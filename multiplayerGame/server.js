require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
//const { Server } = require('socket.io');
const cors = require('cors');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');
const helmet=require('helmet');
const app=express();
const http=require('http').createServer(app);
//const webServer = http.createServer(app);
const io = require('socket.io')(http);

let players=[];
let playerCount=0;
let id=0;
var collectible;
// So when a user connect give them the current list of all players
io.on('connection',socket=>{
  var player;
  if(collectible){
    socket.emit('collectible',(collectible));
  }
  socket.emit('players',(players));
  socket.on('new player',(player)=>{
    player=player;
    players.push(player);
    io.emit('players',(players));
  
    socket.on('player change',info=>{
      if(info.event=='move'){
        // update the players array
        player=info.player;
        players=players.map(p=>{
          if(info.player.id==p.id){
            return player;
          }else{
            return p;
          }
        })
        io.emit('players',(players));
      }
      if(info.event=='score'){
        player=info.player;
        players=players.map(p=>{
          if(info.player.id==p.id){
            return player;
          }else{
            return p;
          }
        });
        io.emit('players',(players));
        io.emit('collectible',(info.collectible));
      }
    });

    socket.on('disconnect',()=>{
      // Remove that player from the list of players
      players=players.filter(p=>p.id!=player.id);
      // Tell the other clients about it
      io.emit('players',(players))
    })
  })
  socket.on('collectible',(received_collectible)=>{
    if(received_collectible){
      collectible=received_collectible;
    }
    io.emit('collectible',(collectible));
  })
  });




app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

app.use(helmet());
app.use(helmet.noCache());

app.use((req,res,next)=>{
  res.setHeader('X-Powered-By','PHP 7.4.3');
  next();
})

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = http.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app; // For testing
