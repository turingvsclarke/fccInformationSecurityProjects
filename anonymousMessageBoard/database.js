const mysql=require("mysql2");
require('dotenv').config();

const pool=mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();
module.exports={
    reportReply: async function(reply_id){
        const result=await pool.query("update replies set reported=true where reply_id=?",[reply_id])
        return result
    },
    reportThread: async function(thread_id){
        const result=await pool.query("update threads set reported=true where thread_id=?",[thread_id])
        return result
    },
    deleteReply: async function(reply_id,delete_password){
        const [row]=await pool.query("select * from replies where reply_id=? and delete_password=?",[reply_id,delete_password])
        if(row.length()>0){
            // Mark that thread as deleted
            const result=await pool.query("update replies set reply_text='[deleted]' where reply_id=?",[reply_id])
            // Mark all associated replies as deleted
            const result1=await pool.query("update replies set deleted=true where reply_id=?",[reply_id])
            // set the deleted column of all the replies with that thread_id to true
            return true;
        }
        return false;
    },
    deleteThread: async function(thread_id,delete_password){
        const [row]=await pool.query("select * from threads where thread_id=? and delete_password=?",[thread_id,delete_password])
        if(row.length()>0){
            // Mark that thread as deleted
            const result=await pool.query("update threads set deleted=true where thread_id=?",[thread_id])
            // Mark all associated replies as deleted
            const result1=await pool.query("update replies set deleted=true where thread_id=?",[thread_id])
            // set the deleted column of all the replies with that thread_id to true
            return true;
        }
        return false;
    },
    insertReply: async function(text, delete_password, thread_id){
        const result=await pool.query("insert into replies(text, delete_password, thread_id) values(?,?,?)",[text,delete_password,thread_id])

        const result1=await pool.query("update threads set bumped_on=? where thread_id=?",[result.bumped_on,thread_id])
        
        return result.reply_id
    },
    insertThread: async function(text,delete_password,board_name){
        // Get the board id
        const [board]=await pool.query("select * from boards where board_name=?",[board_name])
        let board_id=board[0].board_id
        const result=await pool.query("insert into threads(text,delete_password,board_id) values(?,?,?)",[text,delete_password,board_id])
        return result.thread_id
    },
    getThreadsFromBoard: async function(board_name){
        const [board_id]=await pool.query("select board_id from boards where board_name=?",[board_name])
        const [threads]=await pool.query("select thread_id, thread_text, created_on, bumped_on from threads where board_id=? and not deleted=true order by bumped_on",board_id[0])
        threads=threads.slice(0,)
        for (var thread of threads){
            const [replies]=await pool.query("select reply_id, reply_text, created_on from replies where thread_id=? and not deleted=true order by created_on",[thread_id])
            replies=replies.slice(0,3);
            thread.replies=replies;
        }
        return threads;
    },
    getThread: async function getThread(thread_id){
        const [threads]=await pool.query("select thread_id, thread_text, created_on, bumped_on from threads where thread_id=? and not deleted=true",thread_id)
        const replies=await pool.query("select reply_id, reply_text, created_on from replies where thread_id=? and not deleted=true order by created_on",[thread_id])
        let thread=threads[0]
        thread.replies=replies
        return thread;
    }
}
