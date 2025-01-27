'use strict';

import {insertThread,insertReply,getThread,getThreadsFromBoard,deleteThread,deleteReply,reportThread,reportReply} from '../database.js';

export function apiRoutes(app) {
  
  app.route('/api/threads/:board');
    
  app.route('/api/replies/:board');


 
  app.route('/api/threads/:board').post((req,res)=>{
    // Form data includes text, delete_password
    insertThread(req.body.text,req.body.delete_password,req.params.board);
    res.redirect('/')
  });


  // You can send a POST request to /api/replies/{board} with form data including text, delete_password, & thread_id. 
  // This will update the bumped_on date to the comment's date. 
  // In the thread's replies array, an object will be saved with at least the properties _id, text, created_on, delete_password, & reported.
  app.route('/api/replies/:board').post((req,res)=>{
    // Search the database using the board and thread id
    insertReply(req.body.text,req.body.delete_password,req.body.thread_id).then(()=>{
      res.redirect('/');
    })
  });

  // You can send a GET request to /api/threads/{board}. 
  // Returned will be an array of the most recent 10 bumped threads on the board with only the most recent 3 replies for each. 
  // The reported and delete_password fields will not be sent to the client.
  app.route('/api/threads/:board').get((req,res)=>{
    getThreadsFromBoard(req.params.board).then((threads)=>{
      res.send(threads);
    })
    //res.send('Welcome to the '+req.params.board+ " board!!")
  })

  // You can send a GET request to /api/replies/{board}?thread_id={thread_id}. 
  // Returned will be the entire thread with all its replies, also excluding the same fields from the client as the previous test.
  app.route('/api/replies/:board').get((req,res)=>{
    getThread(req.params.board,req.query.thread_id).then((thread)=>{
      res.send(thread)
    })
    //res.send("The id is "+thread_id)
  })
  /** 
  You can send a DELETE request to /api/threads/{board} and pass along the thread_id & delete_password to delete the thread. 
  Returned will be the string incorrect password or success.
  app.
  */
  app.route('/api/threads/:board').delete((req,res)=>{
    deleteThread(req.params.board,req.body.thread_id,req.body.delete_password).then((validation)=>{
      res.send(validation);
    })
  })
  /*** 
  You can send a DELETE request to /api/replies/{board} and pass along the thread_id, reply_id, & delete_password. 
  Returned will be the string incorrect password or success. 
  On success, the text of the reply_id will be changed to [deleted].
  **/
  app.route('/api/replies/:board').delete((req,res)=>{
    deleteReply(req.params.board,req.body.thread_id,req.body.reply_id,req.body.delete_password).then((validation)=>{
      res.send(validation);
    })
  })

  /*** 
  You can send a PUT request to /api/threads/{board} and pass along the thread_id.
  Returned will be the string reported. 
  The reported value of the thread_id will be changed to true.
  ***/
  app.route('/api/threads/:board').put((req,res)=>{
    reportThread(req.params.board,req.body.thread_id).then(()=>{
      res.send('reported')
    })
  })

  /** 
  You can send a PUT request to /api/replies/{board} and pass along the thread_id & reply_id. Returned will be the string reported. The reported value of the reply_id will be changed to true.
  ***/
  app.route('/api/replies/:board').put((req,res)=>{
    reportReply(req.params.board,req.body.thread_id,req.body.reply_id).then(()=>{
      res.send('reported')
    })
  })
};