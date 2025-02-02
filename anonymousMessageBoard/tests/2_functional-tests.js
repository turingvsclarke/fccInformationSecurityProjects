const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const expect=chai.expect;
const server = require('../server');

const {db,insertThread,insertReply,getThread,getThreadsFromBoard,deleteThread,deleteReply,reportThread,reportReply} = require('../database.js');
const { ObjectId } = require('mongodb');

chai.use(chaiHttp);

const board_name='Gamers';

// Grab the first two and find out what there thread id's are
var threads,thread_id1,thread_id2;
//console.log(thread1);
//console.log(thread2);
var thread_id1=new ObjectId('679f43cfdb7b12d39494563f')
var thread_id2=new ObjectId('679f43cfdb7b12d394945640')
// use getThreadsFromBoard here to get a bunch of threads

suite('Functional Tests', function() {
    // We have thirteen tests we need to write here. 
    // Test #1
    test('#createNewThread',function(done){
        // Send a post request with text and delete_password
        let threadText="TestThread"+Date.now();
        chai.request(server).post('/api/threads/'+board_name).send({'text':threadText,'delete_password':'delete_me'}).end(
            (err,res)=>{
                // Find a thread in the database with that text and delete_password
                db.collection(board_name).findOne({text:threadText,delete_password:'delete_me'}).then(thread=>{
                    // Verify that the document has an id, text, date+time created on/bumped on values
                    assert.hasAllKeys(thread,['_id','text','created_on','bumped_on','reported','delete_password','replies'],'All keys present');
                    // It has a replies array
                    assert.isArray(thread.replies,'replies is an array');
                    // It has a boolean reported value
                    assert.isBoolean(thread.reported,'reported is a boolean');
                    // It has a text delete_password string
                    assert.isString(thread.text,'text is a string');
                    // Verify that the document has a created_on near to today's date
                    expect(thread.created_on).to.be.closeTo(Date.now(),1000);
                    // Verify that the document has a bumped_on near to today's date
                    expect(thread.bumped_on).to.be.closeTo(Date.now(),1000);
                });
                done();
            }
        );
    })

    // Test #2
    test('#view10MostRecentThreads',function(done){
        // Compare the results of the post request with that of the functional call
        chai.request(server).get('/api/threads/'+board_name).end(
            (err,res)=>{
                let threads = res.body;
                assert.isArray(res.body,'Array returned');
                // Verify that the resultant array has size at most 10
                assert.isAtMost(threads.length,10,'No more than 10 threads were returned')
                threads.forEach(thread=>{
                    //assert.isArray(thread,'Thread is an array');
                    // Verify that the threads don't have delete_password or reported keys
                    assert.hasAllKeys(thread,['_id','text','created_on','bumped_on','replies'],'All thread keys present');
                    // Verify that each of the threads have no more than 3 replies attached to them
                    assert.isAtMost(thread.replies.length,3,'No more than 3 replies with each thread');
                    thread.replies.forEach(reply=>{
                        // Verify that the replies do not have delete_password or reported keys
                        assert.hasAllKeys(reply,['_id', 'text', 'created_on'],'All reply keys present');
                    })
                });
                done();
            }
        );
    })
    
    // Test #3
    test('#deleteThreadWrongPassword',function(done){
        // DELETE request with id and password
        chai.request(server).delete('/api/threads/'+board_name).send({'thread_id':thread_id1,'delete_password':'egg salad'}).end(
            (err,res)=>{
               // Verify that the result is incorrect_password
               assert.deepEqual(res.text,'incorrect password');
               // Verify that that thread is still in the database
                getThread(board_name,thread_id1).then(thread=>{
                    assert.isNotNull(thread,'Thread is still in database');
                });
               
               done();
            }
        );   
    })
    
    // Test #4
    test('#deleteThreadCorrectPassword',function(done){
        // DELETE request with id and correct password
        chai.request(server).delete('/api/threads/'+board_name).send({'thread_id':thread_id1,'delete_password':'delete_me'}).end(
            (err,res)=>{
                // Verify that the result is 'success'
                assert.deepEqual(res.text,'success');
                // Verify that no record exists in the database with that id
                getThread(board_name,thread_id1).then(thread=>{
                    assert.isNull(thread,'Thread has been deleted');
                });
               
            
            done();
        });
    })
    
    // Test #5
    test('#reportThread',function(done){
        // PUT request with thread id and board name
        chai.request(server).put('/api/threads/'+board_name).send({'thread_id':thread_id2}).end(
            (err,res)=>{
               // Verify that the result is 'reported'
               assert.deepEqual(res.text,'reported');
               // Go find the thread with that id and verify that its 'reported' attribute is set to true
                db.collection(board_name).findOne({_id:thread_id2}).then(thread=>{
                    assert.isTrue(thread.reported,'The thread has been reported');
                    done();
                }
                );
        });
    })
   
    // Test #6
    test('#createNewReply',function(done){
        // POST request with thread id, text, delete_password, board name
        chai.request(server).post('/api/replies/'+board_name).send({'text':'Witty comment','delete_password':'delete_me','thread_id':thread_id2}).end(
            (err,res)=>{
                // Find a thread in the database with that text and delete_password
                db.collection(board_name).findOne({_id: new ObjectId(thread_id2)}).then(thread=>{
                    // Find a thread with that id. Verify it has a reply with the text and delete_password given
                    let reply=thread.replies[thread.replies.length-1];
                    assert.isNotNull(reply,'Reply successfully created')
                    // Verify that the reply has properties _id, text, created_on, delete_password, reported
                    assert.hasAllKeys(reply,['_id','text','created_on','reported','delete_password'],'All keys present');
                    // It has a boolean reported value
                    assert.isBoolean(reply.reported,'reported is a boolean');
                    // It has a text delete_password string
                    assert.isString(reply.text,'text is a string');
                    // Verify that reply.created_on==thread.bumped_on
                    expect(thread.bumped_on).to.be.closeTo(reply.created_on,1000);
                    // Verify that the document has a bumped_on near to today's date
                    expect(thread.bumped_on).to.be.closeTo(Date.now(),1000);
                });
                
                done();
        });
    })
    
    // Test #7
    test('#viewSingleThread',function(done){
        // GET request with board name and thread_id
        chai.request(server).get('/api/replies/'+board_name+'?thread_id='+thread_id2).end(
            (err,res)=>{
                let thread = res.body;
                assert.isObject(res.body,'Object returned');
                // Verify that the thread doesn't have delete_password or reported keys
                assert.hasAllKeys(thread,['_id','text','created_on','bumped_on','replies'],'All thread keys present');
                assert.isArray(thread.replies,'Replies are an array');
                thread.replies.forEach(reply=>{
                    // Verify that the replies do not have delete_password or reported keys
                    assert.hasAllKeys(reply,['_id', 'text', 'created_on'],'All reply keys present');
                });
            }
        );
        done();
    })
    
    // Test #8
    test('#deleteReplyWrongPassword',function(done){
        // DELETE request with board name, reply id, thread id, delete password
        chai.request(server).delete('/api/replies/'+board_name).send({'thread_id':thread_id2,'reply_id':0,'delete_password':'egg salad'}).end(
            (err,res)=>{
               // Verify that the result is incorrect_password
               assert.deepEqual(res.text,'incorrect password');
               // Verify that that thread is still in the database and get the reply from it
                 getThread(board_name,thread_id2).then(thread=>{
                    let reply=thread.replies[0];
                    // Verify that reply.text does not equal '[deleted]'
                    assert.notEqual(reply.text,'[deleted]','reply has not been deleted');
                 });
               
               done();
            }
        );   
    })

    // Test #9
    test('#deleteReplyCorrectPassword',function(done){
        // DELETE request with board name, reply id, thread id, delete password
        chai.request(server).delete('/api/replies/'+board_name).send({'thread_id':thread_id2,'reply_id':0,'delete_password':'delete_me'}).end(
            (err,res)=>{
               // Verify that the result is 'success'
               assert.deepEqual(res.text,'success');
               // Verify that that thread is still in the database and get the reply from it
               getThread(board_name,thread_id2).then(thread=>{
                let reply=thread.replies.filter(reply=>reply._id==0)[0];
                // Verify that reply.text equals '[deleted]'
                assert.strictEqual(reply.text,'[deleted]');
                done();
               });
            }
        ); 
    })

    // Test #10
    test('#reportReply',function(done){
        // PUT request with board name, thread id, reply id
        chai.request(server).put('/api/replies/'+board_name).send({'thread_id':thread_id2,'reply_id':1}).end(
            (err,res)=>{
               // Verify that the result is 'reported'
               assert.deepEqual(res.text,'reported');
               // Go find the reply of that thread id with that reply id and verify that its 'reported' attribute is set to true
               db.collection(board_name).findOne({_id:thread_id2}).then(thread=>{
                assert.isTrue(thread.replies[1].reported,'The reply has been reported');
                done();
                });
            }
        );
    })
    
});
