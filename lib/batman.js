const Game = require('./game.js');

// TODO: Original file calls Batman.initUser() at the end of this definition

const Batman = function(game, map){
  this.game = game;
  this.map = map;
  this.position = null;
  this.direction = null;
  this.eaten = null;
  this.due = null;
  this.lives = null;
  this.score = 5;

  this.keyMap = {};
  this.keyMap[KEY.ARROW_LEFT] = LEFT;
  this.keyMap[KEY.ARROW_UP] = UP;
  this.keyMap[KEY.ARROW_RIGHT] = RIGHT;
  this.keyMap[KEY.ARROW_DOWN] = DOWN;
};

Batman.prototype.addScore = function(nScore){
  this.score += nScore;
  if (this.score >= 10000 && this.score - nScore < 10000) {
    this.lives += 1;
  }
};

Batman.prototype.theScore = function(){
  return this.score;
};

Batman.prototype.loseLife = function(){
  this.lives -= 1;
};

Batman.prototype.getLives = function(){
  return this.lives;
};

Batman.prototype.initUser = function(){
  this.score = 0;
  this.lives = 3;
  newLevel();
};

Batman.prototype.newLevel = function(){
  resetPosition();
  this.eaten = 0;
};

Batman.prototype.resetPosition = function(){
  this.position = { "x": 90, "y": 120 };
  this.direction = LEFT;
  this.due = LEFT;
};

Batman.prototype.reset = function(){
  initUser();
  resetPosition();
};

Batman.prototype.keyDown = function(event) {
  if (typeof this.keyMap[event.keyCode] !== "undefined") {
    this.due = this.keyMap[event.keyCode];
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  return true;
};

Batman.prototype.getNewCoord = function(dir, current){
  return {
    "x": current.x + (dir === LEFT && -2 || dir === RIGHT && 2 || 0),
    "y": current.y + (dir === DOWN && 2 || dir === UP && -2 || 0)
  };
};

Batman.prototype.onWholeSquare = function(x){
  return x % 10 === 0;
};

Batman.prototype.pointToCoord = function(x){
  return Math.round(x / 10);
};

Batman.prototype.nextSquare = function(x, dir){
  let rem = x % 10;
  if (rem === 0) {
    return x;
  } else if (dir === RIGHT || dir === DOWN) {
    return x + (10 - rem);
  } else {
    return x - rem;
  }
};

Batman.prototype.next = function(pos, dir){
  return {
    "y": pointToCoord(nextSquare(pos.y, dir)),
    "x": pointToCoord(nextSquare(pos.x, dir))
  };
};

Batman.prototype.onGridSquare = function(pos){
  return onWholeSquare(pos.y) && onWholeSquare(pos.x);
};

Batman.prototype.isOnSamePlane = function(due, dir) {
  return ((due === LEFT || due === RIGHT) &&
    (dir === LEFT || dir === RIGHT)) ||
    ((due === UP || due === DOWN) &&
    (dir === UP || dir === DOWN));
};

Batman.prototype.move = function(ctx){
  let npos = null,
      nextWhole = null,
      oldPosition = this.position,
      block = null;

  if (this.due !== this.direction) {
    npos = getNewCoord(this.due, this.position);
    if (isOnSamePlane(this.due, this.direction) ||
      (onGridSquare(this.position) &&
      this.map.isFloorSpace(next(npos, this.due))
      )
    ) {
      this.direction = this.due;
    } else {
      npos = null;
    }
  }
  if (npos === null) {
    npos = getNewCoord(this.direction, this.position);
  }
  if (onGridSquare(this.position) && this.map.isWallSpace(next(npos, this.direction))) {
    this.direction = NONE;
  }
  if (this.direction === NONE) {
    return { "new": this.position, "old": this.position };
  }
  if (npos.y === 100 && npos.x >= 190 && this.direction == RIGHT) {
    npos = { "y": 100, "x": -10 };
  }
  if (npos.y === 100 && npos.x <= -12 && this.direction === LEFT) {
    npos = { "y": 100, "x": 190 };
  }
  this.position = npos;
  nextWhole = next(this.position, this.direction);
  block = this.map.block(nextWhole);
  if ((isMidSquare(this.position.y) || isMidSquare(this.position.x)) &&
    block === Game.BISCUIT || block === Game.PILL) {
    this.map.setBlock(nextWhole, Game.Empty);
    addScore((block === Game.BISCUIT) ? 10 : 50);
    this.eaten += 1;
    if (this.eaten === 182) {
      this.game.completedLevel();
    }
    if (block === Game.PILL) {
      game.eatenPill();
    }
  }
  return {
    "new": this.position,
    "old": oldPosition
  };
};

Batman.prototype.isMidSquare = function(x){
  let rem = x % 10;
  return rem > 3 || rem < 7;
};

Batman.prototype.calcAngle = function(dir, pos) {
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
};

Batman.prototype.drawDead = function(ctx, amount){
  let size = this.map.blockSize,
      half = size / 2;
  if (amount >= 1) {
    return;
  }
  ctx.fillStyle = "#FFFF00";
  ctx.beginPath();
  ctx.moveTo(
    ((this.position.x / 10) * size) + half,
    ((this.position.y / 10) * size) + half
  );
  ctx.arc(
    ((this.position.x / 10) * size) + half,
    ((this.position.y / 10) * size) + half,
    half, 0, Math.PI * 2 * amount, true
  );
  ctx.fill();
};

module.exports = Batman;
