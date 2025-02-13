class Player {
  constructor(x, y, score, id) {
    this.x=x;
    this.y=y;
    this.score=score;
    this.id=id;
  }

  movePlayer(dir, speed) {
    switch(dir) {
      case 'left':
        this.x-=speed;
        break;
      case 'right':
        this.x+=speed;
        break;
      case 'up':
        this.y-=speed;
        break;
      case 'down':
        this.y+=speed;
        break;
    }
  }

  collision(item) {
    if((item.x<this.x+10)&&(item.x>this.x-10)&&(item.y<this.y+10)&&(item.y>this.y-10)){
      return true;
    }
    return false;
  }

  calculateRank(arr) {
    let playerScores=arr.sort((a,b)=>{return b.score-a.score});
    let rank=1+playerScores.findIndex(p=>p.id==this.id);
    return rank+ ' / ' + playerScores.length;
  }
}

export default Player;
