const Game = require('./game.js');
const Villain = require('./villain.js');
const Pacman = require('./pacman.js');
const Maze = require('./maze.js');
const Audio = require('./audio.js');
const Util = require('./util.js');

Object.prototype.clone = function () {
  let i, newObj = (this instanceof Array) ? [] : {};
  for (i in this) {
    if (i === "clone") continue;
    if (this[i] && typeof this[i] === "object") {
      newObj[i] = this[i].clone();
    } else {
      newObj[i] = this[i];
    }
  }
  return newObj;
};

const KeyFunc = function () {
  // 0 - 9
  for (let i = 48; i <= 57; i++) {
    Util.KEY["" + (i - 48)] = i;
  }
  //  A - Z
  for (let i = 65; i <= 90; i++) {
    Util.KEY["" + String.fromCharCode(i)] = i;
  }
  // NUM_PAD_0 - NUM_PAD_9
  for (let i = 96; i <= 105; i++) {
    Util.KEY["NUM_PAD" + (i - 96)] = i;
  }
  // F1 - F12
  for (let i = 112; i <= 123; i++) {
    // TODO: Was i - 112 + 1 ?
    Util.KEY["F" + (i - 111)] = i;
  }
};

KeyFunc();

const PlayGame = function (){
  this.state = Util.WAITING;
  this.audio = null;
  this.ghosts = [];
  this.ghostSpecs = ["#00FFDE", "#FF0000", "#FFB8DE", "#FFB847"];
  this.eatenCount = 0;
  this.level = 0;
  this.tick = 0;
  this.ghostPos = true;
  this.userPos = true;
  this.stateChanged = true;
  this.timerStart = null;
  this.lastTime = 0;
  this.ctx = null;
  this.timer = null;
  this.map = null;
  this.user = null;
  this.stored = null;
};

PlayGame.prototype.getTick = function () {
  return this.tick;
};

PlayGame.prototype.drawScore = function (text, position) {
  this.ctx.fillStyle = "#FFFFFF";
  this.ctx.font = "12px Arcade";
  this.ctx.fillText(
    text,
    (position.new.x / 10) * this.map.blockSize,
    ((position.new.y + 5) / 10) * this.map.blockSize
  );
};

PlayGame.prototype.dialog = function (text) {
  this.ctx.fillStyle = "#FFFF00";
  this.ctx.font = "16px Arcade";
  let width = this.ctx.measureText(text).width,
      x = ((this.map.width * this.map.blockSize) - width) / 2;
  this.ctx.fillText(text, x, (this.map.height * 10) + 8);
};

PlayGame.prototype.soundDisabled = function () {
  return localStorage.soundDisabled === "true";
};

PlayGame.prototype.startLevel = function () {
  this.user.resetPosition();
  for (let i = 0; i < this.ghosts.length; i += 1) {
    this.ghosts[i].reset();
  }
  this.audio.play("start");
  this.timerStart = this.tick;
  this.setState(Util.COUNTDOWN);
};

PlayGame.prototype.startNewGame = function () {
  this.setState(Util.WAITING);
  this.level = 1;
  this.user.reset();
  // this.map.reset();
  // this.map.draw(this.ctx);
  this.startLevel();
};

PlayGame.prototype.keyDown = function (e) {
  if (e.keyCode === Util.KEY.N && this.state === Util.WAITING) {
    this.startNewGame();
  } else if (e.keyCode === Util.KEY.S) {
    this.audio.disableSound();
    localStorage.soundDisabled = !this.soundDisabled();
  } else if (e.keyCode === Util.KEY.P && this.state === Util.PAUSE) {
    this.audio.resume();
    this.map.draw(this.ctx);
    this.setState(this.stored);
  } else if (e.keyCode === Util.KEY.P) {
    this.stored = this.state;
    this.setState(this.stored);
    this.audio.pause();
    this.map.draw(this.ctx);
    this.dialog("Paused");
  } else if (this.state !== Util.PAUSE) {
    return this.user.keyDown(e);
  }
  return true;
};

PlayGame.prototype.resetGame = function () {
  this.setState(Util.WAITING);
  this.level = 1;
  this.user.reset();
  // this.map.reset();
};

PlayGame.prototype.loseLife = function () {
  this.user.loseLife();
  if (this.user.getLives() > 0) {
    this.setState(Util.WAITING);
    this.startLevel();
  } else {
    this.dialog("G A M E   O V E R");
    setTimeout(this.resetGame.bind(this), 3000);
  }
};

PlayGame.prototype.setState = function (nState) {
  this.state = nState;
  this.stateChanged = true;
};

PlayGame.prototype.collided = function (user, ghost) {
  return (Math.sqrt(Math.pow(ghost.x - user.x, 2) + Math.pow(ghost.y - user.y, 2))) < 10;
};

PlayGame.prototype.drawFooter = function () {
  let topLeft = this.map.height * this.map.blockSize,
      textBase = topLeft + 17;

  this.ctx.fillStyle = "#000000";
  this.ctx.fillRect(0, topLeft, (this.map.width * this.map.blockSize), 30);

  this.ctx.fillStyle = "#FFFF00";

  for (let i = 0, len = this.user.getLives(); i < len; i++) {
    this.ctx.fillStyle = "#FFFF00";
    this.ctx.beginPath();
    this.ctx.moveTo(
      202 + (30 * i) + this.map.blockSize / 2,
      topLeft + this.map.blockSize / 2
    );
    this.ctx.arc(
      202 + (30 * i) + this.map.blockSize / 2,
      topLeft + this.map.blockSize / 2,
      this.map.blockSize / 2,
      Math.PI * 0.25,
      Math.PI * 1.75,
      false
    );
    this.ctx.fill();
  }

  this.ctx.fillStyle = !this.soundDisabled() ? "#00FF00" : "#FF0000";
  this.ctx.font = "bold 16px sans-serif";
  this.ctx.fillText("♪", 15, textBase);
  // this.ctx.fillText("s", 15, textBase - 3);

  this.ctx.fillStyle = "#FFFF00";
  this.ctx.font = "13px Arcade";
  this.ctx.fillText("Score: " + this.user.theScore(), 40, textBase);
  this.ctx.fillText("Level: " + this.level, 350, textBase);
};

PlayGame.prototype.redrawBlock = function (pos) {
  this.map.drawBlock(Math.floor(pos.y / 10), Math.floor(pos.x / 10), this.ctx);
  this.map.drawBlock(Math.ceil(pos.y / 10), Math.ceil(pos.x / 10), this.ctx);
};

PlayGame.prototype.mainDraw = function () {
  let diff, u, i, len, nScore;
  this.ghostPos = [];
  for(i = 0, len = this.ghosts.length; i < len; i += 1) {
    this.ghostPos.push(this.ghosts[i].move(this.ctx));
  }

  u = this.user.move(this.ctx);
  for (i = 0, len = this.ghosts.length; i < len; i += 1) {
    this.redrawBlock(this.ghostPos[i].old);
  }
  this.redrawBlock(u.old);
  this.audio.play("eating");

  for (i = 0, len = this.ghosts.length; i < len; i += 1) {
    this.ghosts[i].draw(this.ctx);
  }
  this.user.draw(this.ctx);
  this.userPos = u.new;


  for (i = 0, len = this.ghosts.length; i < len; i += 1) {
    if (this.collided(this.userPos, this.ghostPos[i].new)) {
      if (this.ghosts[i].isVulnerable()) {
        this.audio.play("eatghost");
        this.ghosts[i].eat();
        this.eatenCount += 1;
        nScore = this.eatenCount * 50;
        this.drawScore(nScore, this.ghostPos[i]);
        this.user.addScore(nScore);
        this.setState(Util.EATEN_PAUSE);
        this.timerStart = this.tick;
      } else if (this.ghosts[i].isDangerous()) {
        this.audio.play("die");
        this.setState(Util.DYING);
        this.timerStart = this.tick;
      }
    }
  }
};

PlayGame.prototype.mainLoop = function () {
  let diff;
  if (this.state !== Util.PAUSE) ++this.tick;
  if (this.state === Util.PLAYING) {
    this.mainDraw();
  } else if (this.state === Util.WAITING && this.stateChanged) {
    this.stateChanged = false;
    this.map.draw(this.ctx);
    this.dialog("PRESS N TO START A NEW GAME!");
  } else if (this.state === Util.EATEN_PAUSE &&
    (this.tick - this.timerStart) > (Game.FPS / 3)) {
    this.map.draw(this.ctx);
    this.setState(Util.PLAYING);
  } else if (this.state === Util.DYING) {
    if (this.tick - this.timerStart > (Game.FPS * 2)) {
      this.loseLife();
    } else {
      this.redrawBlock(this.userPos);
      for (let i = 0, len = this.ghosts.length; i < len; i += 1) {
        this.redrawBlock(this.ghostPos[i].old);
        this.ghostPos.push(this.ghosts[i].draw(this.ctx));
      }
      this.user.drawDead(this.ctx, (this.tick - this.timerStart) / (Game.FPS * 2));
    }
  } else if (this.state === Util.COUNTDOWN) {
    diff = 5 + Math.floor((this.timerStart - this.tick) / Game.FPS);
    if (diff === 0) {
      this.map.draw(this.ctx);
      this.setState(Util.PLAYING);
    } else {
      if (diff !== this.lastTime) {
        this.lastTime = diff;
        this.map.draw(this.ctx);
        this.dialog("STARTING IN: " + diff);
      }
    }
  }
  this.map.drawPills(this.ctx);
  this.drawFooter();
};

PlayGame.prototype.eatenPill = function () {
  this.audio.play("eatpill");
  this.timerStart = this.tick;
  this.eatenCount = 0;
  for (let i = 0; i < this.ghosts.length; i += 1) {
    this.ghosts[i].makeEatable(this.ctx);
  }
};

PlayGame.prototype.completedLevel = function () {
  this.setState(Util.WAITING);
  this.level += 1;
  // this.map.reset();
  this.user.newLevel();
  this.startLevel();
};

PlayGame.prototype.keyPress = function (event) {
  if (this.state !== Util.WAITING && this.state !== Util.PAUSE) {
    event.preventDefault();
    event.stopPropagation();
  }
};

PlayGame.prototype.init = function (wrapper, root) {
  let i, len, ghost,
      blockSize = wrapper.offsetWidth / 19,
      canvas = document.createElement("canvas"),
      that = this;

  canvas.setAttribute("width", (blockSize * 19) + "px");
  canvas.setAttribute("height", (blockSize * 22) + 30 + "px");
  wrapper.appendChild(canvas);
  this.ctx = canvas.getContext("2d");

  this.audio = new Audio({ "soundDisabled": this.soundDisabled.bind(this) });

  this.map = new Maze(blockSize);
  this.map.reset();

  this.user = new Pacman({
    "completedLevel": this.completedLevel.bind(this),
    "eatenPill": this.eatenPill.bind(this)
  }, this.map);
  this.user.initUser();

  for (i = 0, len = this.ghostSpecs.length; i < len; i += 1) {
    ghost = new Villain({
      "getTick": this.getTick.bind(this)
    }, this.map, this.ghostSpecs[i]);
    this.ghosts.push(ghost);
  }

  this.map.draw(this.ctx);
  this.dialog("LOADING...");

  let extension = "ogg";
  let audio_files = [
    ["start", root + "assets/audio/opening_song." + extension],
    ["die", root + "assets/audio/die." + extension],
    ["eatghost", root + "assets/audio/eatghost." + extension],
    ["eatpill", root + "assets/audio/eatpill." + extension],
    ["eating", root + "assets/audio/eating.short." + extension],
    ["eating2", root + "assets/audio/eating.short." + extension]
  ];
  this.load(audio_files, function(){ that.loaded(); });
};

PlayGame.prototype.load = function (arr, callback) {
  let that = this;
  if (arr.length === 0) {
    callback();
  } else {
    let x = arr.pop();
    this.audio.load(x[0], x[1], function() { that.load(arr, callback); });
  }
};

PlayGame.prototype.loaded = function () {
  this.dialog("PRESS N TO START");
  document.addEventListener("keydown", this.keyDown.bind(this), true);
  document.addEventListener("keypress", this.keyPress.bind(this), true);
  if (this.timer) window.clearInterval(this.timer);
  this.timer = window.setInterval(this.mainLoop.bind(this), 1000 / Game.FPS);
};

var game = new PlayGame();
var el = document.getElementById("pacman");
window.addEventListener("DOMContentLoaded", function () { game.init(el, "./"); });

module.exports = PlayGame;
