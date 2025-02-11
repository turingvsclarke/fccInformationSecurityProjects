import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();

// So we need a whole bunch of stuff here for the client and how they're going to interact with the board. 
// When a client joins, give them an id


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
    if(keystring){
        // Call the player object on that keystring. 
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
