const Game = require('./game.js');

const Villain = {
  new(game, map, color){
    this.game = game;
    this.map = map;
    this.color = color;
    let position = null,
        direction = null,
        eatable = null,
        eaten = null,
        due = null;
  },

  getNewCoord(dir, current){
    let speed = isVulnerable() ? 1 : isHidden() ? 4 : 2,
        xSpeed = (dir === LEFT && -speed || dir === RIGHT && speed || 0),
        ySpeed = (dir === DOWN && speed || dir === UP && -speed || 0);

    return {
      "x": addBounded(current.x, xSpeed),
      "y": addBounded(current.y, ySpeed)
    };
  },

  addBounded(x1, x2){
    let rem = x1 % 10,
        result = rem + x2;
    if (rem !== 0 && result > 10) {
      return x1 + (10 - rem);
    } else if (rem > 0 && result < 0) {
      return x1 - rem;
    }
    return x1 + x2;
  },

  isVulnerable(){
    return eatable !== null;
  },

  isDangerous(){
    return eaten === null;
  },

  isHidden(){
    return eatable === null && eaten !== null;
  },

  getRandomDirection(){
    let moves = (direction === LEFT || direction === RIGHT) ? [UP, DOWN] : [LEFT, RIGHT];
    return moves[Math.floor(Math.random() * 2)];
  },

  reset(){
    eaten = null;
    eatable = null;
    position = { "x": 90, "y": 80 };
    direction = getRandomDirection();
    due = getRandomDirection();
  },

  onWholeSquare(){
    return x % 10 === 0;
  },

  oppositeDirection(dir){
    return dir === LEFT && RIGHT ||
      dir === RIGHT && LEFT ||
      dir === UP && DOWN || UP;
  },

  makeEatable(){
    direction = oppositeDirection(direction);
    eatable = this.game.getTick();
  },

  eat(){
    eatable = null;
    eaten = this.game.getTick();
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

  onGridSquare(pos){
    return onWholeSquare(pos.y) && onWholeSquare(pos.x);
  },

  secondsAgo(tick){
    return (this.game.getTick() - tick) / Game.FPS;
  },

  getColor(){
    if (eatable) {
      if (secondsAgo(eatable) > 5) {
        return this.game.getTick() % 20 > 10 ? "#FFFFFF" : "#0000BB";
      } else {
        return "#0000BB";
      }
    } else if (eaten) {
      return "#222";
    }
    return this.color;
  },

  draw(ctx){
    let s = this.map.blockSize,
        top = (position.y / 10) * s,
        left = (position.x / 10) * s,
        tl = left + s,
        base = top + s - 3,
        inc = s / 10,
        high = this.game.getTick() % 10 > 5 ? 3 : -3,
        low = this.game.getTick() % 10 > 5 ? -3 : 3,
        f = s / 12,
        off = {};

    if (eatable && secondsAgo(eatable) > 8) {
      eatable = null;
    }
    if (eaten && secondsAgo(eaten) > 3) {
      eaten = null;
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
    ctx.arc(left + 6 + off[direction][0], top + 6 + off[direction][1], s / 15, 0, 300, false);
    ctx.arc((left + s) - 6 + off[direction][0], top + 6 + off[direction][1], s / 15, 0, 300, false);
    ctx.closePath();
    ctx.fill();
  },

  pane(pos){
    if (pos.y === 100 && pos.x >= 190 && direction === RIGHT) {
      return { "y": 100, "x": -10 };
    }
    if (pos.y === 100 && pos.x <= -10 && direction === LEFT) {
      return { "y": 100, "x": 190 };
    }
    return false;
  },

  move(ctx){
    let oldPos = position,
        onGrid = onGridSquare(position),
        npos = null;

    if (due !== direction) {
      npos = getNewCoord(due, position);
      if (onGrid &&
        this.map.isFloorSpace({
          "y": pointToCoord(nextSquare(npos.y, due)),
          "x": pointToCoord(nextSquare(npos.x, due))
        })
      ) {
        direction = due;
      } else {
        npos = null;
      }
    }
    if (npos === null) {
      npos = getNewCoord(direction, position);
    }
    if (onGrid &&
      this.map.isWallSpace({
        "y": pointToCoord(nextSquare(npos.y, direction)),
        "x": pointToCoord(nextSquare(npos.x, direction))
      })
    ) {
      due = getRandomDirection();
      return move(ctx);
    }
    position = npos;
    var tmp = pane(position);
    if (tmp) {
      position = tmp;
    }
    due = getRandomDirection();
    return { "new": position, "old": oldPos };
  }
};

module.exports = Villain;
