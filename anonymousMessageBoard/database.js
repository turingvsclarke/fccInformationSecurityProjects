const mysql=require("mysql2");
require('dotenv').config();

const pool=mysql.createPool({
    host: '127.0.0.1',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

const row=async ()=>await pool.query("insert into boards(board_name) values(?)",["Gamers"]);
row().then(x=>console.log(x));

module.exports={
    reportReply: async function(_id){
        const result=await pool.query("update replies set reported=true where _id=?",[_id])
        return result
    },
    reportThread: async function(_id){
        const result=await pool.query("update threads set reported=true where _id=?",[_id])
        return result
    },
    deleteReply: async function(_id,delete_password){
        const [row]=await pool.query("select * from replies where _id=? and delete_password=?",[_id,delete_password])
        if(row.length>0){
            // Mark that thread as deleted
            const result=await pool.query("update replies set reply_text='[deleted]' where _id=?",[_id])
            // Mark all associated replies as deleted
            const result1=await pool.query("update replies set deleted=true where _id=?",[_id])
            // set the deleted column of all the replies with that _id to true
            return true;
        }
        return false;
    },
    deleteThread: async function(_id,delete_password){
        const [row]=await pool.query("select * from threads where _id=? and delete_password=?",[_id,delete_password])
        if(row.length>0){
            // Mark that thread as deleted
            const result=await pool.query("update threads set deleted=1 where _id=?",[_id])
            // Mark all associated replies as deleted
            const result1=await pool.query("update replies set deleted=1 where _id=?",[_id])
            // set the deleted column of all the replies with that _id to true
            return true;
        }
        return false;
    },
    insertReply: async function(text, delete_password, _id){
        await pool.query("insert into replies(reply_text, delete_password, _id) values(?,?,?)",[text,delete_password,_id])
        const [result]=await pool.query("SELECT * FROM replies WHERE _id=LAST_INSERT_ID()");
        const result1=await pool.query("update threads set bumped_on=? where _id=?",[result[0].created_on,_id])
        
        return result._id
    },

    insertThread: async function(text,delete_password,board_name){
        // Get the board id
        var [board]=await pool.query("select * from boards where board_name=?",[board_name])
        // Add the board if it doesn't already exist
        if(board.length==0){
            await pool.query("insert into boards(board_name) values(?)",[board_name]);
            [board] = await pool.query("select * from boards where board_name=?",[board_name])
        }
        let board_id=board[0].board_id
        const result=await pool.query("insert into threads(thread_text,delete_password,board_id) values(?,?,?)",[text,delete_password,board_id])
        return result._id
    },
    getThreadsFromBoard: async function(board_name){
        const [board_id]=await pool.query("select board_id from boards where board_name=?",[board_name])
        var [threads]=await pool.query("select _id, thread_text, created_on, bumped_on from threads where board_id=? and not deleted order by bumped_on",board_id[0])
        threads=threads.slice(0,)
        for (var thread of threads){
            var [replies]=await pool.query("select _id, reply_text, created_on from replies where _id=? and not deleted order by created_on",[thread._id])
            replies=replies.slice(0,3);
            thread.replies=replies;
        }
        return threads;
    },
    getThread: async function getThread(_id){
        const [threads]=await pool.query("select _id, thread_text, created_on, bumped_on from threads where _id=? and not deleted",_id)
        const [replies]=await pool.query("select _id, reply_text, created_on from replies where _id=? and not deleted order by created_on",[_id])
        let thread=threads[0];
        if(thread){
            thread.replies=replies;
        }
        return thread;
    }
}
