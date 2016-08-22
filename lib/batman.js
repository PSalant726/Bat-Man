const Game = require('./game.js');
const Util = require('./util.js');

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
  this.keyMap[Util.KEY.ARROW_LEFT] = Util.LEFT;
  this.keyMap[Util.KEY.ARROW_UP] = Util.UP;
  this.keyMap[Util.KEY.ARROW_RIGHT] = Util.RIGHT;
  this.keyMap[Util.KEY.ARROW_DOWN] = Util.DOWN;

  this.initUser();
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
  this.newLevel();
};

Batman.prototype.newLevel = function(){
  this.resetPosition();
  this.eaten = 0;
};

Batman.prototype.resetPosition = function(){
  this.position = { "x": 90, "y": 120 };
  this.direction = Util.LEFT;
  this.due = Util.LEFT;
};

Batman.prototype.reset = function(){
  this.initUser();
  this.resetPosition();
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
    "x": current.x + (dir === Util.LEFT && -2 || dir === Util.RIGHT && 2 || 0),
    "y": current.y + (dir === Util.DOWN && 2 || dir === Util.UP && -2 || 0)
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
  } else if (dir === Util.RIGHT || dir === Util.DOWN) {
    return x + (10 - rem);
  } else {
    return x - rem;
  }
};

Batman.prototype.next = function(pos, dir){
  return {
    "y": this.pointToCoord(this.nextSquare(pos.y, dir)),
    "x": this.pointToCoord(this.nextSquare(pos.x, dir))
  };
};

Batman.prototype.onGridSquare = function(pos){
  return this.onWholeSquare(pos.y) && this.onWholeSquare(pos.x);
};

Batman.prototype.isOnSamePlane = function(due, dir) {
  return ((due === Util.LEFT || due === Util.RIGHT) &&
    (dir === Util.LEFT || dir === Util.RIGHT)) ||
    ((due === Util.UP || due === Util.DOWN) &&
    (dir === Util.UP || dir === Util.DOWN));
};

Batman.prototype.move = function(ctx){
  let npos = null,
      nextWhole = null,
      oldPosition = this.position,
      block = null;

  if (this.due !== this.direction) {
    npos = this.getNewCoord(this.due, this.position);
    if (this.isOnSamePlane(this.due, this.direction) ||
      (this.onGridSquare(this.position) &&
      this.map.isFloorSpace(this.next(npos, this.due))
      )
    ) {
      this.direction = this.due;
    } else {
      npos = null;
    }
  }
  if (npos === null) {
    npos = this.getNewCoord(this.direction, this.position);
  }
  if (this.onGridSquare(this.position) && this.map.isWallSpace(this.next(npos, this.direction))) {
    this.direction = Util.NONE;
  }
  if (this.direction === Util.NONE) {
    return { "new": this.position, "old": this.position };
  }
  if (npos.y === 100 && npos.x >= 190 && this.direction == Util.RIGHT) {
    npos = { "y": 100, "x": -10 };
  }
  if (npos.y === 100 && npos.x <= -12 && this.direction === Util.LEFT) {
    npos = { "y": 100, "x": 190 };
  }
  this.position = npos;
  nextWhole = this.next(this.position, this.direction);
  block = this.map.block(nextWhole);
  if ((this.isMidSquare(this.position.y) || this.isMidSquare(this.position.x)) &&
    block === Game.BISCUIT || block === Game.PILL) {
    this.map.setBlock(nextWhole, Game.EMPTY);
    this.addScore((block === Game.BISCUIT) ? 10 : 50);
    this.eaten += 1;
    if (this.eaten === 182) {
      this.game.completedLevel();
    }
    if (block === Game.PILL) {
      this.game.eatenPill();
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
  if (dir == Util.RIGHT && (pos.x % 10 < 5)) {
    return { "start": 0.25, "end": 1.75, "direction": false };
  } else if (dir === Util.DOWN && (pos.y % 10 < 5)) {
    return { "start": 0.75, "end": 2.25, "direction": false };
  } else if (dir === Util.UP && (pos.y % 10 < 5)) {
    return { "start": 1.25, "end": 1.75, "direction": true };
  } else if (dir === Util.LEFT && (pos.x % 10 < 5)) {
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

Batman.prototype.draw = function (ctx) {
  let s = this.map.blockSize,
      angle = this.calcAngle(this.direction, this.position);

  ctx.fillStyle = "#FFFF00";
  ctx.beginPath();
  ctx.moveTo(
    ((this.position.x / 10) * s) + s / 2,
    ((this.position.y / 10) * s) + s / 2
  );
  ctx.arc(
    ((this.position.x / 10) * s) + s / 2,
    ((this.position.y / 10) * s) + s / 2,
    s / 2,
    Math.PI * angle.start,
    Math.PI * angle.end,
    angle.direction
  );
  ctx.fill();
};

module.exports = Batman;
