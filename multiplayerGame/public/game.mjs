import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();

const playerWidth=20;
const playerHeight=20;
const gameWidth=630;
const gameHeight=425;
const gameX=5;
const gameY=50;

// So we need a whole bunch of stuff here for the client and how they're going to interact with the board. 
// When a client joins, give them an id
// Every client needs its own player, plus a list of all the other players. 
var players=[];
var player;
// Ask the server for the number of players right now
socket.on('players',(serverPlayers)=>{
    players=serverPlayers;
    // If we don't have a player yet, add one with the id being that of the playerCount
    if(!player){
        // Create the player.
        var invalid=true;
        while(invalid){
            invalid=false;
            var playerX=gameX+Math.random()*gameWidth;
            var playerY=gameY+Math.random()*gameHeight;
            players.forEach(p=>{
                if(((p.x<playerX+2*playerWidth)&&(p.x>playerX-2*playerWidth))&&((p.x<playerY+2*playerHeight)&&p.x>(playerY-2*playerHeight))){
                    invalid = true;
                }
            })
        }
        
        player=new Player(playerX,playerY,0,serverPlayers.length);
        //console.log(player);
        socket.emit('new player',(player));
    }
    drawPlayers();
});

socket.on('player change',(info)=>{
    console.log('player changed');
})

const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');
document.addEventListener("keydown",function(event){
    var keystring='';
    switch(event.key){
        case 'ArrowDown':
            keystring='down';
            break;
        case 'ArrowUp':
            keystring='up';
            break;
        case 'ArrowRight':
            keystring='right';
            break;
        case 'ArrowLeft':
            keystring='left';
            break;
    }
    console.log(player);
    if(keystring&&player){
        player.movePlayer(keystring,2);
        // Call the player object on that keystring. 
        socket.emit('player change',{
            player: player,
            event: 'move'
        });
    }
    console.log("Key pressed: "+keystring);
})
context.fillStyle='#0a0703';
context.fillRect(0,0,640,480);
context.strokeStyle='white';
context.strokeRect(5,50,630,425);

context.font='20px Arial';
context.fillStyle='white';
context.fillText('Controls: WASD',7,30);

function drawPlayers(){
    context.clearRect(5,50,630,425);
    context.fillStyle='#0a0703';
    context.fillRect(5,50,630,425);
    context.strokeStyle='white';
    context.strokeRect(5,50,630,425);
    console.log(players);
    players.forEach(p=>{
        if(p.id==player.id){
            context.fillStyle='white';
        }else{
            context.fillStyle='red';
        }
        context.fillRect(p.x,p.y,20,20)
    })

}


