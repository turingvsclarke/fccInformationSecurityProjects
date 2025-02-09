// const mysql=require("mysql2");
require('dotenv').config();


const {MongoClient,ObjectId} = require('mongodb');

var url = process.env.MONGO_URI;

const client=new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});
client.connect();
//await listDatabases(client);

const db=client.db('MessageBoard')

//await db.admin({listDatabases:1});

const testThreads=db.collection('fcc_test');
const board_name='Gamers';
// Insert 20 threads into the database with 6 replies each. 




//const thread=await testThreads.findOne({text:'fcc_test_thread'});
//console.log(thread.replies);
// Async function here that exports the threads
/** 
var threads=await db.collection(board_name).find().toArray((err,threads)=>threads);
    //threads=[...threads];
    threads.sort((thread1,thread2)=>thread1.bumped_on-thread2.bumped_on);
    export threads[0]._id;
    export threads[1]._id;
**/
//const report=await reportReply('fcc_test','66e8a3056f9fb2ecc728c5b6',0);
//console.log(report);
module.exports={
db, 
insertThread: async function(board_name,text,delete_password){
    await db.collection(board_name).insertOne({
        text: text,
        created_on: Date.now(),
        bumped_on: Date.now(),
        reported: false,
        delete_password: delete_password,
        replies: []
    })
},

insertReply: async function(board_name,thread_id,text,delete_password){
    thread_id=new ObjectId(thread_id);
    var thread=await db.collection(board_name).findOne({_id:thread_id});
    let replies=[...thread.replies];
    let replyLength=replies.length;
    replies.push({
        _id: replyLength,
        text: text,
        created_on: Date.now(),
        delete_password: delete_password,
        reported: false
    });
    // Update the thread
    db.collection(board_name).updateOne({_id:thread_id},
        { $set: {replies: replies,bumped_on:Date.now()}}
    );

    },

getThreadsFromBoard: async function(board_name){
    // Grab all the threads. Only take the first ten entries of that array. 
    // For each thread, grab the first 
    var threads=[];
    var threads=await db.collection(board_name).find().toArray((err,threads)=>threads);
    //threads=[...threads];
    threads.sort((thread1,thread2)=>thread1.bumped_on-thread2.bumped_on);
    threads=threads.slice(0,10);
    threads=threads.map(thread=>{
        delete thread.reported;
        delete thread.delete_password;
        let replies=[...thread.replies.sort((reply1,reply2)=>reply1.created_on-reply2.created_on).slice(0,3)];
        replies=replies.map(reply=>{
            delete reply.delete_password;
            delete reply.reported;
            return reply;
        });
        thread.replies=[...replies];
        return thread;
    });
    return threads;
},

getThread: async function(board_name,thread_id){
    thread_id=new ObjectId(thread_id);
    var thread=await db.collection(board_name).findOne({_id:thread_id});
    if(thread){
        thread={...thread};
        delete thread.reported;
        delete thread.delete_password;
        thread.replies.forEach(reply=>{
            delete reply.delete_password;
            delete reply.reported;
        })
    }
    return thread;
},

deleteThread: async function(board_name,thread_id,delete_password){
        thread_id=new ObjectId(thread_id);
        const thread=await db.collection(board_name).findOne({_id:thread_id});
        if(thread.delete_password==delete_password){
            // delete the thread from the database
            db.collection(board_name).deleteOne({_id:thread_id});
            return 'success';
        }else{
            return 'incorrect password';
        }
    },

deleteReply: async function(board_name,thread_id,reply_id,delete_password){
    // Find the 
    thread_id=new ObjectId(thread_id);
    const thread=await db.collection(board_name).findOne({_id:thread_id});
    var replies=[...thread.replies];
    var replyCopy=replies.filter(reply=>reply._id==reply_id)[0];
    if(replyCopy.delete_password==delete_password){
        replyCopy.text='[deleted]';
        db.collection(board_name).updateOne({_id:thread_id},
            { $set: {replies: replies},
            $currentDate: {bumped_on:{$type:"timestamp"}}}
        );
        return 'success';
    }else{
        return 'incorrect password';
    }
},

reportThread: async function(board_name,thread_id){
    thread_id=new ObjectId(thread_id);
    db.collection(board_name).updateOne({_id:thread_id},
        { $set: {reported: true, bumped_on: Date.now()}}
    );
    return 'reported';
},

reportReply: async function(board_name,thread_id,reply_id){
    // Replies is an array within the thread object. We want to grab the replies array,
    // change the reported value to true, then update that thread with the correct id.
    // Step 1: Grab the thread
    thread_id=new ObjectId(thread_id);
    const thread=await db.collection(board_name).findOne({_id:thread_id});
    // Update the repy so that reported becomes true
    var replies=[...thread.replies];
    replies.map(reply=>{
        if(reply._id==reply_id){
            reply.reported=true;
        }
        return reply;

        });
    // Update the thread to have the new replies array as its replies value
    db.collection(board_name).updateOne({_id:thread_id},
        { $set: {replies: replies, bumped_on: Date.now()}}
    );
    return "reported";
}

}
/** 
db.collection('Gamers').deleteMany().then(()=>{
    let threads=[]
    for(let i=0;i<20;i++){
        let thread_text="TestThread"+i;
        let delete_password="delete_me";
        // Create replies array
        replies=[];
        // Generate a reply
        for(let i=0;i<6;i++){
            let reply={
                _id:i,
                text:'Reply'+i,
                created_on:new Date(),
                delete_password:'delete_me',
                reported:false
            };
            replies.push(reply);
        }
        let thread={
            text: thread_text,
            created_on: new Date(),
            bumped_on: new Date(),
            reported: false,
            delete_password: 'delete_me',
            replies:replies
        }
        threads.push(thread);
    }
    db.collection(board_name).insertMany(threads).then(()=>{
        db.collection(board_name).find().toArray((err,threads)=>{
            threads.sort((thread1,thread2)=>thread1.bumped_on-thread2.bumped_on);
            module.exports.thread1=threads[0]._id;
            module.exports.thread2=threads[1]._id;
        })
    })

})
**/
