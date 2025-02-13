import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();

const playerWidth=20;
const playerHeight=20;
const gameWidth=630;
const gameHeight=425;
const gameX=5;
const gameY=50;
var collectible;
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
        player=newPlayer();
        drawGame();
        //console.log(player);
        socket.emit('new player',(player));
    }
    drawGame();
});

socket.emit('collectible',(collectible));

socket.on('collectible',(serverCollectible)=>{
    if(serverCollectible){
        collectible=serverCollectible;
    }else{
        collectible=addCollectible();
        drawGame();
        socket.emit('collectible',(collectible));
    }
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
   
    if(keystring&&player){
        player.movePlayer(keystring,2);
        // Check for a collision with the collectible, score goes up if collision
        if(collectible){
            if(player.collision(collectible)){
                player.score+=collectible.value;
                console.log('player scored');
                // Create random collectible that doesn't intersect with any of the other players
                // Create the player.
                drawGame();
                socket.emit('player change',{event: 'score',player:player,collectible:addCollectible()});
            }
        }
        
        // Call the player object on that keystring. 
        socket.emit('player change',{
            player: player,
            event: 'move'
        });
    }
    
})

function newPlayer(){
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
    
    return new Player(playerX,playerY,0,players.length);
}

function addCollectible(){
    var id=0;
    if(collectible){
        id=collectible.id;
    }
    var invalid=true;
    while(invalid){
        invalid=false;
        var collectibleX=gameX+Math.random()*gameWidth;
        var collectibleY=gameY+Math.random()*gameHeight;
        players.forEach(p=>{
            if(((p.x<collectibleX+2*playerWidth)&&(p.x>collectibleX-2*playerWidth))&&((p.x<collectibleY+2*playerHeight)&&p.x>(collectibleY-2*playerHeight))){
                invalid = true;
            }
        })
    }
    return new Collectible({x:collectibleX,y:collectibleY,value:1+Math.floor(Math.random()*20),id:id});
}


function drawGame(){
    context.clearRect(0,0,640,480);
    context.fillStyle='#0a0703';
    context.fillRect(0,0,640,480);
    context.strokeStyle='white';
    context.strokeRect(5,50,630,425);
    
    // Draw the text
    context.font='20px Arial';
    context.fillStyle='white';
    context.fillText('Controls: WASD',7,30);
    context.fillText('Rank: '+player.calculateRank(players),500,30);
    
    // Draw the collectible
    if(collectible){
        context.fillStyle='orange';
        context.beginPath();
        context.arc(collectible.x,collectible.y,8,0,2*Math.PI);
        context.fill();
    }
    

    // Draw the players
    players.forEach(p=>{
        if(p.id==player.id){
            context.fillStyle='white';
        }else{
            context.fillStyle='red';
        }
        context.fillRect(p.x,p.y,20,20)
    })
}


