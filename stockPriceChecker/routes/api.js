'use strict';
const axios=require('axios')

module.exports = function (app) {
  // Set up Mongo Database

  app.route('/api/stock-prices')
    .get(function (req, res){
      var stockSymbol
      var likes=0
      var array=false
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
