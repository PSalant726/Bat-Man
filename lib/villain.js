const Game = require('./game.js');

const Villain = function (game, map, color){
  this.game = game;
  this.map = map;
  this.color = color;
  this.position = null;
  this.direction = null;
  this.eatable = null;
  this.eaten = null;
  this.due = null;
};

Villain.prototype.getNewCoord = function (dir, current){
  let speed = isVulnerable() ? 1 : isHidden() ? 4 : 2,
      xSpeed = (dir === LEFT && -speed || dir === RIGHT && speed || 0),
      ySpeed = (dir === DOWN && speed || dir === UP && -speed || 0);

  return {
    "x": addBounded(current.x, xSpeed),
    "y": addBounded(current.y, ySpeed)
  };
};

Villain.prototype.addBounded = function (x1, x2){
  let rem = x1 % 10,
      result = rem + x2;
  if (rem !== 0 && result > 10) {
    return x1 + (10 - rem);
  } else if (rem > 0 && result < 0) {
    return x1 - rem;
  }
  return x1 + x2;
};

Villain.prototype.isVulnerable = function(){
  return this.eatable !== null;
};

Villain.prototype.isDangerous = function (){
  return this.eaten === null;
};

Villain.prototype.isHidden = function(){
  return this.eatable === null && this.eaten !== null;
};

Villain.prototype.getRandomDirection = function(){
  let moves = (this.direction === LEFT || this.direction === RIGHT) ? [UP, DOWN] : [LEFT, RIGHT];
  return moves[Math.floor(Math.random() * 2)];
};

Villain.prototype.reset = function(){
  this.eaten = null;
  this.eatable = null;
  this.position = { "x": 90, "y": 80 };
  this.direction = getRandomDirection();
  this.due = getRandomDirection();
};

Villain.prototype.onWholeSquare = function(){
  return x % 10 === 0;
};

Villain.prototype.oppositeDirection = function(dir){
  return dir === LEFT && RIGHT ||
    dir === RIGHT && LEFT ||
    dir === UP && DOWN || UP;
};

Villain.prototype.makeEatable = function(){
  this.direction = oppositeDirection(this.direction);
  this.eatable = this.game.getTick();
};

Villain.prototype.eat = function(){
  this.eatable = null;
  this.eaten = this.game.getTick();
};

Villain.prototype.pointToCoord = function(x){
  return Math.round(x / 10);
};

Villain.prototype.nextSquare = function(x, dir){
  let rem = x % 10;
  if (rem === 0) {
    return x;
  } else if (dir === RIGHT || dir === DOWN) {
    return x + (10 - rem);
  } else {
    return x - rem;
  }
};

Villain.prototype.onGridSquare = function(pos){
  return onWholeSquare(pos.y) && onWholeSquare(pos.x);
};

Villain.prototype.secondsAgo = function(tick){
  return (this.game.getTick() - tick) / Game.FPS;
};

Villain.prototype.getColor = function(){
  if (this.eatable) {
    if (secondsAgo(this.eatable) > 5) {
      return this.game.getTick() % 20 > 10 ? "#FFFFFF" : "#0000BB";
    } else {
      return "#0000BB";
    }
  } else if (this.eaten) {
    return "#222";
  }
  return this.color;
};

Villain.prototype.draw = function(ctx){
  let s = this.map.blockSize,
      top = (this.position.y / 10) * s,
      left = (this.position.x / 10) * s,
      tl = left + s,
      base = top + s - 3,
      inc = s / 10,
      high = this.game.getTick() % 10 > 5 ? 3 : -3,
      low = this.game.getTick() % 10 > 5 ? -3 : 3,
      f = s / 12,
      off = {};

  if (this.eatable && secondsAgo(this.eatable) > 8) {
    this.eatable = null;
  }
  if (this.eaten && secondsAgo(this.eaten) > 3) {
    this.eaten = null;
  }

  ctx.fillStyle = getColor();
  ctx.beginPath();

  ctx.moveTo(left, base);

  ctx.quadraticCurveTo(left, top, left + (s / 2),  top);
  ctx.quadraticCurveTo(left + s, top, left + s,  base);

  ctx.quadraticCurveTo(tl - (inc * 1), base + high, tl - (inc * 2),  base);
  ctx.quadraticCurveTo(tl - (inc * 3), base + low, tl - (inc * 4),  base);
  ctx.quadraticCurveTo(tl - (inc * 5), base + high, tl - (inc * 6),  base);
  ctx.quadraticCurveTo(tl - (inc * 7), base + low, tl - (inc * 8),  base);
  ctx.quadraticCurveTo(tl - (inc * 9), base + high, tl - (inc * 10), base);

  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = "#FFF";
  ctx.arc(left + 6,top + 6, s / 6, 0, 300, false);
  ctx.arc((left + s) - 6,top + 6, s / 6, 0, 300, false);
  ctx.closePath();
  ctx.fill();

  off[RIGHT] = [f, 0];
  off[LEFT] = [-f, 0];
  off[UP] = [0, -f];
  off[DOWN] = [0, f];

  ctx.beginPath();
  ctx.fillStyle = "#000";
  ctx.arc(left + 6 + off[this.direction][0], top + 6 + off[this.direction][1], s / 15, 0, 300, false);
  ctx.arc((left + s) - 6 + off[this.direction][0], top + 6 + off[this.direction][1], s / 15, 0, 300, false);
  ctx.closePath();
  ctx.fill();
};

Villain.prototype.pane = function(pos){
  if (pos.y === 100 && pos.x >= 190 && this.direction === RIGHT) {
    return { "y": 100, "x": -10 };
  }
  if (pos.y === 100 && pos.x <= -10 && this.direction === LEFT) {
    return { "y": 100, "x": 190 };
  }
  return false;
};

Villain.prototype.move = function(ctx){
  let oldPos = this.position,
      onGrid = onGridSquare(this.position),
      npos = null;

  if (this.due !== this.direction) {
    npos = getNewCoord(this.due, this.position);
    if (onGrid &&
      this.map.isFloorSpace({
        "y": pointToCoord(nextSquare(npos.y, this.due)),
        "x": pointToCoord(nextSquare(npos.x, this.due))
      })
    ) {
      this.direction = this.due;
    } else {
      npos = null;
    }
  }
  if (npos === null) {
    npos = getNewCoord(this.direction, this.position);
  }
  if (onGrid &&
    this.map.isWallSpace({
      "y": pointToCoord(nextSquare(npos.y, this.direction)),
      "x": pointToCoord(nextSquare(npos.x, this.direction))
    })
  ) {
    this.due = getRandomDirection();
    return move(ctx);
  }
  this.position = npos;
  var tmp = pane(this.position);
  if (tmp) {
    this.position = tmp;
  }
  this.due = getRandomDirection();
  return { "new": this.position, "old": oldPos };
};

module.exports = Villain;
