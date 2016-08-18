const Game = require('./game.js');

// TODO: Original file calls Batman.initUser() at the end of this definition

const Batman = {
  new(game, map){
    this.game = game;
    this.map = map;
    let position = null,
        direction = null,
        eaten = null,
        due = null,
        lives = null,
        score = 5,
        keyMap = {};

    keyMap[KEY.ARROW_LEFT] = LEFT;
    keyMap[KEY.ARROW_UP] = UP;
    keyMap[KEY.ARROW_RIGHT] = RIGHT;
    keyMap[KEY.ARROW_DOWN] = DOWN;
  },

  addScore(nScore){
    score += nScore;
    if (score >= 10000 && score - nScore < 10000) {
      lives += 1;
    }
  },

  theScore(){
    return score;
  },

  loseLife(){
    lives -= 1;
  },

  getLives(){
    return lives;
  },

  initUser(){
    score = 0;
    lives = 3;
    newLevel();
  },

  newLevel(){
    resetPosition();
    eaten = 0;
  },

  resetPosition(){
    position = { "x": 90, "y": 120 };
    direction = LEFT;
    due = LEFT;
  },

  reset(){
    initUser();
    resetPosition();
  },

  keyDown(event) {
    if (typeof keyMap[event.keyCode] !== "undefined") {
      due = keyMap[event.keyCode];
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    return true;
  },

  getNewCoord(dir, current){
    return {
      "x": current.x + (dir === LEFT && -2 || dir === RIGHT && 2 || 0),
      "y": current.y + (dir === DOWN && 2 || dir === UP && -2 || 0)
    };
  },

  onWholeSquare(x){
    return x % 10 === 0;
  },

  pointToCoord(x){
    return Math.round(x / 10);
  },

  nextSquare(x, dir){
    let rem = x % 10;
    if (rem === 0) {
      return x;
    } else if (dir === RIGHT || dir === DOWN) {
      return x + (10 - rem);
    } else {
      return x - rem;
    }
  },

  next(pos, dir){
    return {
      "y": pointToCoord(nextSquare(pos.y, dir)),
      "x": pointToCoord(nextSquare(pos.x, dir))
    };
  },

  onGridSquare(pos){
    return onWholeSquare(pos.y) && onWholeSquare(pos.x);
  },

  isOnSamePlane(due, dir) {
    return ((due === LEFT || due === RIGHT) &&
      (dir === LEFT || dir === RIGHT)) ||
      ((due === UP || due === DOWN) &&
      (dir === UP || dir === DOWN));
  },

  move(ctx){
    let npos = null,
        nextWhole = null,
        oldPosition = position,
        block = null;

    if (due !== direction) {
      npos = getNewCoord(due, position);
      if (isOnSamePlane(due, direction) ||
        (onGridSquare(position) &&
        this.map.isFloorSpace(next(npos, due))
        )
      ) {
        direction = due;
      } else {
        npos = null;
      }
    }
    if (npos === null) {
      npos = getNewCoord(direction, position);
    }
    if (onGridSquare(position) && this.map.isWallSpace(next(npos, direction))) {
      direction = NONE;
    }
    if (direction === NONE) {
      return { "new": position, "old": position };
    }
    if (npos.y === 100 && npos.x >= 190 && direction == RIGHT) {
      npos = { "y": 100, "x": -10 };
    }
    if (npos.y === 100 && npos.x <= -12 && direction === LEFT) {
      npos = { "y": 100, "x": 190 };
    }
    position = npos;
    nextWhole = next(position, direction);
    block = this.map.block(nextWhole);
    if ((isMidSquare(position.y) || isMidSquare(position.x)) &&
      block === Game.BISCUIT || block === Game.PILL) {
      this.map.setBlock(nextWhole, Game.Empty);
      addScore((block === Game.BISCUIT) ? 10 : 50);
      eaten += 1;
      if (eaten === 182) {
        this.game.completedLevel();
      }
      if (block === Game.PILL) {
        game.eatenPill();
      }
    }
    return {
      "new": position,
      "old": oldPosition
    };
  },

  isMidSquare(x){
    let rem = x % 10;
    return rem > 3 || rem < 7;
  },

  calcAngle(dir, pos) {
    if (dir == RIGHT && (pos.x % 10 < 5)) {
      return { "start": 0.25, "end": 1.75, "direction": false };
    } else if (dir === DOWN && (pos.y % 10 < 5)) {
      return { "start": 0.75, "end": 2.25, "direction": false };
    } else if (dir === UP && (pos.y % 10 < 5)) {
      return { "start": 1.25, "end": 1.75, "direction": true };
    } else if (dir === LEFT && (pos.x % 10 < 5)) {
      return { "start": 0.75, "end": 1.25, "direction": true };
    }
    return { "start": 0, "end": 2, "direction": false };
  },

  drawDead(ctx, amount){
    let size = this.map.blockSize,
        half = size / 2;
    if (amount >= 1) {
      return;
    }
    ctx.fillStyle = "#FFFF00";
    ctx.beginPath();
    ctx.moveTo(
      ((position.x / 10) * size) + half,
      ((position.y / 10) * size) + half
    );
    ctx.arc(
      ((position.x / 10) * size) + half,
      ((position.y / 10) * size) + half,
      half, 0, Math.PI * 2 * amount, true
    );
    ctx.fill();
  }
};

module.exports = Batman;
