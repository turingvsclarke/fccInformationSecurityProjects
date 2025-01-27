// const mysql=require("mysql2");
import dotenv from 'dotenv';
dotenv.config();

import {MongoClient,ObjectId} from 'mongodb';

var url = process.env.MONGO_URI;

const client=new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});
client.connect();
//await listDatabases(client);

const db=client.db('MessageBoard')

await db.admin({listDatabases:1});

const testThreads=db.collection('fcc_test');

const thread=await testThreads.findOne({text:'fcc_test_thread'});
console.log(thread.replies);

const report=await reportReply('fcc_test','66e8a3056f9fb2ecc728c5b6',0);
console.log(report);

export async function reportReply(board_name,thread_id,reply_id){
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
            { $set: {replies: replies},
            $currentDate: {bumped_on:{$type:"timestamp"}}}
        );
        return "reported";
}



export async function reportThread(board_name,thread_id){
        thread_id=new ObjectId(thread_id);
        db.collection(board_name).updateOne({_id:thread_id},
            { $set: {reported: true},
            $currentDate: {bumped_on:{$type:"timestamp"}}}
        );
        return 'reported';
    }

export async function deleteReply(board_name,thread_id,reply_id,delete_password){
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
    }

export async function deleteThread(board_name,thread_id,delete_password){
        thread_id=new ObjectId(thread_id);
        const thread=await db.collection(board_name).findOne({_id:thread_id});
        if(thread.delete_password==delete_password){
            // delete the thread from the database
            db.collection(board_name).deleteOne({_id:thread_id});
            return 'success';
        }else{
            return 'incorrect password';
        }
    }

export async function insertReply(board_name,thread_id,text,delete_password){
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

    }

export async function insertThread(board_name,text,delete_password){
        await db.collection(board_name).insertOne({
            text: text,
            created_on: Date.now(),
            bumped_on: Date.now(),
            reported: false,
            delete_password: delete_password,
            replies: []
        })
    }

export async function getThread(board_name,thread_id){
        thread_id=new ObjectId(thread_id);
        var thread=await db.collection(board_name).findOne({_id:thread_id});
        thread={...thread};
        delete thread.reported;
        delete thread.delete_password;
        thread.replies.forEach(reply=>{
            delete reply.delete_password;
            delete reply.reported;
        })
        return thread;
    }

export async function getThreadsFromBoard(board_name){
        // Grab all the threads. Only take the first ten entries of that array. 
        // For each thread, grab the first 
        var threads=await db.collection(board_name).find();
        threads=[...threads];
        threads.sort((thread1,thread2)=>thread1.bumped_on-thread2.bumped_on);
        threads=threads.slice(0,10);
        threads.forEach(thread=>{
            delete thread.reported;
            delete thread.delete_password;
            let replies=replies.sort((reply1,reply2)=>reply1.created_on-reply2.created_on).slice(0,3);
            replies.forEach(reply=>{
                delete reply.delete_password;
                delete reply.reported;
            });
        });
        return threads;
    }

