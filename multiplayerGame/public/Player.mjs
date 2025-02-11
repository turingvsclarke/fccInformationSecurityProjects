class Player {
  constructor({x, y, score, id}) {
    this.x=x;
    this.y=y;
    this.score=score;
    this.id=id;
  }

  movePlayer(dir, speed) {
    switch(dir) {
      case 'left':
        this.x++;
        break;
      case 'right':
        this.x--;
        break;
      case 'up':
        this.y++;
      case 'down':
        this.y--;
    }
  }

  collision(item) {
    if(item.x==this.x&&item.y==this.y)
      return true;
    return false;
  }

  calculateRank(arr) {
    playerScore=arr.sort((a,b)=>{return b.score-a.score});
    let rank=playerScore.index(this)+1;
    return rank/playerScore;
  }
}

export default Player;
