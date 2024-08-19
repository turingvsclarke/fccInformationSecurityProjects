'use strict';
const axios=require('axios')
const bcrypt=require('bcrypt')
const myDB = require('../connection');

module.exports = function (app,myDatabase) {
  // Set up Mongo Database

  app.route('/api/stock-prices')
    .get(function (req, res){
      var stockSymbol
      var likes=0
      var array=false

      // Get the ip address from the request object
      let address=req.socket.remoteAddress
      var ip_address='';

      // Check the database for that 

      var salt = bcrypt.genSaltSync(10);
      bcrypt.hash(address,salt,(err,hash)=>{
        console.log('address: ',address)
        console.log('hash: ',hash)
        bcrypt.compare(address,hash,function(err,isMatch){
          if(isMatch){
            console.log('addresses match')
          }
        });
      })

      
      myDatabase.findOne({ip_address:'bunny' }, (err, user) => {
        console.log(`User ${address} attempted to log in.`);
        if (err) return done(err);
        if (!user || !bcrypt.compareSync(password,user.password)){
          wrongInfo=true;
          return done(null, false);
        }
        return done(null, user);
      });
      
      // Store that ip address in the database. 
      // Check database for that ip address. Unhash it and then compare



      if(typeof(req.query.stock)=='object'){
        array=true
        stockSymbol=String(req.query.stock[0]).toLowerCase();
      }else{
        stockSymbol=String(req.query.stock).toLowerCase();
      }
      if(typeof(req.query.likes)=='object'){
        likes=req.query.like[0]?1:likes
        // Convert the likes to a number and put that in. 
      }else{
        likes=req.query.like?1:likes
      }
      var stockInfo
      // Make a query for the stock price
      
      // If two stocks are passed, find data from both of them
      axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stockSymbol}/quote`)
      .then((result)=>{
        stockInfo={stock:result.data.symbol,price:result.data.latestPrice,likes:likes}

        if(array){
          
          axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${req.query.stock[1].toLowerCase()}/quote`).then(
            (result1)=>{
              var like1=0
              if(typeof(req.query.like)=='object'){
                like1=req.query.like[1]?1:0;
              }
              delete stockInfo.likes
              stockInfo.rel_likes=likes-like1
              let stockData1={stock:result1.data.symbol,price:result1.data.latestPrice,rel_likes:like1-likes}
              res.json({stockData:[stockInfo,stockData1]})
            }
          )
        }
        else{
          res.json({'stockData':stockInfo})
        }
      })
      .catch((err)=> {
       
        res.json(err)
        })
      
      /*** 
      res.json({stockData:{stock:stockData,price:Number(req.query.price),likes:likes}})
      */
    });
};
