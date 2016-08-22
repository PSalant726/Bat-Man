const Game = require('./game.js');

const Maze = function (size){
  this.height = null;
  this.width = null;
  this.blockSize = size;
  this.pillSize = 0;
  this.maze = null;

  this.reset();
};

Maze.prototype.withinBounds = function (y, x) {
  return y >= 0 && y < this.height && x >= 0 && x < this.width;
};

Maze.prototype.isWallSpace = function (pos) {
  return this.withinBounds(pos.y, pos.x) && this.maze[pos.y][pos.x] === Game.WALL;
};

Maze.prototype.isFloorSpace = function (pos) {
  if (!this.withinBounds(pos.y, pos.x)) {
    return false;
  }
  let piece = this.maze[pos.y][pos.x];
  return piece === Game.EMPTY ||
    piece === Game.BISCUIT ||
    piece === Game.PILL;
};

Maze.prototype.drawWall = function (ctx) {
  let i, j, p, line;
  ctx.strokeStyle = "#0000FF";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  for (i = 0; i < Game.WALLS.length; i += 1) {
    line = Game.WALLS[i];
    ctx.beginPath();
    for (j = 0; j < line.length; j += 1) {
      p = line[j];
      if (p.move) {
        ctx.moveTo(p.move[0] * this.blockSize, p.move[1] * this.blockSize);
      } else if (p.line) {
        ctx.lineTo(p.line[0] * this.blockSize, p.line[1] * this.blockSize);
      } else if (p.curve) {
        ctx.quadraticCurveTo(
          p.curve[0] * this.blockSize,
          p.curve[1] * this.blockSize,
          p.curve[2] * this.blockSize,
          p.curve[3] * this.blockSize
        );
      }
    }
    ctx.stroke();
  }
};

Maze.prototype.reset = function () {
  this.maze = Game.MAP.clone();
  this.height = this.maze.length;
  this.width = this.maze[0].length;
};

Maze.prototype.block = function (pos) {
  return this.maze[pos.y][pos.x];
};

Maze.prototype.setBlock = function (pos, type) {
  this.maze[pos.y][pos.x] = type;
};

Maze.prototype.drawPills = function (ctx) {
  if (++this.pillSize > 30) {
    this.pillSize = 0;
  }
  for (i = 0; i < this.height; i += 1) {
    for (j = 0; j < this.width; j += 1) {
      if (this.maze[i][j] === Game.PILL) {
        ctx.beginPath();

        ctx.fillStyle = "#000";
        ctx.fillRect(
          (j * this.blockSize),
          (i * this.blockSize),
          this.blockSize,
          this.blockSize
        );

        ctx.fillStyle = "#FFF";
        ctx.arc(
          (j * this.blockSize) + this.blockSize / 2,
          (i * this.blockSize) + this.blockSize / 2,
          Math.abs(5 - (this.pillSize / 2)),
          0,
          Math.PI * 2,
          false
        );
        ctx.fill();
        ctx.closePath();
      }
    }
  }
};

Maze.prototype.draw = function (ctx) {
  let i, j, size = this.blockSize;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, this.width * size, this.height * size);
  this.drawWall(ctx);
  for (i = 0; i < this.height; i += 1) {
    for (j = 0; j < this.width; j += 1) {
      this.drawBlock(i, j, ctx);
    }
  }
};

Maze.prototype.drawBlock = function (y, x, ctx) {
  let layout = this.maze[y][x];
  if (layout === Game.PILL) return;
  ctx.beginPath();
  if (layout === Game.EMPTY || layout === Game.BLOCK || layout === Game.BISCUIT) {
    ctx.fillStyle = "#000";
    ctx.fillRect(
      (x * this.blockSize),
      (y * this.blockSize),
      this.blockSize,
      this.blockSize
    );
    if (layout === Game.BISCUIT) {
      ctx.fillStyle = "#FFF";
      ctx.fillRect(
        (x * this.blockSize) + (this.blockSize / 2.5),
        (y * this.blockSize) + (this.blockSize / 2.5),
        this.blockSize / 6,
        this.blockSize / 6
      );
    }
  }
  ctx.closePath();
};

module.exports = Maze;
