/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const Game = __webpack_require__(1);
	const Villain = __webpack_require__(2);
	const Pacman = __webpack_require__(4);
	const Maze = __webpack_require__(5);
	const Audio = __webpack_require__(6);
	const Util = __webpack_require__(3);

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
	  this.level = 1;
	  this.user.reset();
	  this.map.reset();
	  // this.map.draw(this.ctx);
	  this.setState(Util.WAITING);
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
	  this.map.reset();
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


/***/ },
/* 1 */
/***/ function(module, exports) {

	var Game = {
	  FPS: 30,
	  WALL: 0,
	  BISCUIT: 1,
	  EMPTY: 2,
	  BLOCK: 3,
	  PILL: 4,
	  MAP: [
	    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	  	[0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	  	[0, 4, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 4, 0],
	  	[0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
	  	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	  	[0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
	  	[0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
	  	[0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
	  	[2, 2, 2, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 2, 2, 2],
	  	[0, 0, 0, 0, 1, 0, 1, 0, 0, 3, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	  	[2, 2, 2, 2, 1, 1, 1, 0, 3, 3, 3, 0, 1, 1, 1, 2, 2, 2, 2],
	  	[0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	  	[2, 2, 2, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 2, 2, 2],
	  	[0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	  	[0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	  	[0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
	  	[0, 4, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 4, 0],
	  	[0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
	  	[0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
	  	[0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
	  	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	  	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	  ],
	  WALLS: [
	    [
	      { "move": [0, 9.5] }, { "line": [3, 9.5] },
	      { "curve": [3.5, 9.5, 3.5, 9] }, { "line": [3.5, 8] },
	      { "curve": [3.5, 7.5, 3, 7.5] }, { "line": [1, 7.5] },
	      { "curve": [0.5, 7.5, 0.5, 7] }, { "line": [0.5, 1] },
	      { "curve": [0.5, 0.5, 1, 0.5] }, { "line": [9, 0.5] },
	      { "curve": [9.5, 0.5, 9.5, 1] }, { "line": [9.5, 3.5] }
	    ],
	    [
	      { "move": [9.5, 1] },
	      { "curve": [9.5, 0.5, 10, 0.5] }, { "line": [18, 0.5] },
	      { "curve": [18.5, 0.5, 18.5, 1] }, { "line": [18.5, 7] },
	      { "curve": [18.5, 7.5, 18, 7.5] }, { "line": [16, 7.5] },
	      { "curve": [15.5, 7.5, 15.5, 8] }, { "line": [15.5, 9] },
	      { "curve": [15.5, 9.5, 16, 9.5] }, { "line": [19, 9.5] }
	    ],
	    [
	      { "move": [2.5, 5.5] }, { "line": [3.5, 5.5] }
	    ],
	    [
	      { "move": [3, 2.5] },
	      { "curve": [3.5, 2.5, 3.5, 3] },
	      { "curve": [3.5, 3.5, 3, 3.5] },
	      { "curve": [2.5, 3.5, 2.5, 3] },
	      { "curve": [2.5, 2.5, 3, 2.5] }
	    ],
	    [
	      { "move": [15.5, 5.5] }, { "line": [16.5, 5.5] }
	    ],
	    [
	      { "move": [16, 2.5] }, { "curve": [16.5, 2.5, 16.5, 3] },
	      { "curve": [16.5, 3.5, 16, 3.5] }, { "curve": [15.5, 3.5, 15.5, 3] },
	      { "curve": [15.5, 2.5, 16, 2.5] }
	    ],
	    [
	      { "move": [6, 2.5] }, { "line": [7, 2.5] }, { "curve": [7.5, 2.5, 7.5, 3] },
	      { "curve": [7.5, 3.5, 7, 3.5] }, { "line": [6, 3.5] },
	      { "curve": [5.5, 3.5, 5.5, 3] }, { "curve": [5.5, 2.5, 6, 2.5] }
	    ],
	    [
	      { "move": [12, 2.5] }, { "line": [13, 2.5] }, { "curve": [13.5, 2.5, 13.5, 3] },
	      { "curve": [13.5, 3.5, 13, 3.5] }, { "line": [12, 3.5] },
	      { "curve": [11.5, 3.5, 11.5, 3] }, { "curve": [11.5, 2.5, 12, 2.5] }
	    ],
	    [
	      { "move": [7.5, 5.5] }, { "line": [9, 5.5] }, { "curve": [9.5, 5.5, 9.5, 6] },
	      { "line": [9.5, 7.5] }
	    ],
	    [
	      { "move": [9.5, 6] }, { "curve": [9.5, 5.5, 10.5, 5.5] },
	      { "line": [11.5, 5.5] }
	    ],
	    [
	      { "move": [5.5, 5.5] }, { "line": [5.5, 7] }, { "curve": [5.5, 7.5, 6, 7.5] },
	      { "line": [7.5, 7.5] }
	    ],
	    [
	      { "move": [6, 7.5] }, { "curve": [5.5, 7.5, 5.5, 8] }, { "line": [5.5, 9.5] }
	    ],
	    [
	      { "move": [13.5, 5.5] }, { "line": [13.5, 7] },
	      { "curve": [13.5, 7.5, 13, 7.5] }, { "line": [11.5, 7.5] }
	    ],
	    [
	      { "move": [13, 7.5] }, { "curve": [13.5, 7.5, 13.5, 8] },
	      { "line": [13.5, 9.5] }
	    ],
	    [
	      { "move": [0, 11.5] }, { "line": [3, 11.5] }, { "curve": [3.5, 11.5, 3.5, 12] },
	      { "line": [3.5, 13] }, { "curve": [3.5, 13.5, 3, 13.5] }, { "line": [1, 13.5] },
	      { "curve": [0.5, 13.5, 0.5, 14] }, { "line": [0.5, 17] },
	      { "curve": [0.5, 17.5, 1, 17.5] }, { "line": [1.5, 17.5] }
	    ],
	    [
	      { "move": [1, 17.5] }, { "curve": [0.5, 17.5, 0.5, 18] }, { "line": [0.5, 21] },
	      { "curve": [0.5, 21.5, 1, 21.5] }, { "line": [18, 21.5] },
	      { "curve": [18.5, 21.5, 18.5, 21] }, { "line": [18.5, 18] },
	      { "curve": [18.5, 17.5, 18, 17.5] }, { "line": [17.5, 17.5] }
	    ],
	    [
	      { "move": [18, 17.5] }, { "curve": [18.5, 17.5, 18.5, 17] },
	      { "line": [18.5, 14] }, { "curve": [18.5, 13.5, 18, 13.5] },
	      { "line": [16, 13.5] }, { "curve": [15.5, 13.5, 15.5, 13] },
	      { "line": [15.5, 12] }, { "curve": [15.5, 11.5, 16, 11.5] },
	      { "line": [19, 11.5] }
	    ],
	    [
	      { "move": [5.5, 11.5] }, { "line": [5.5, 13.5] }
	    ],
	    [
	      { "move": [13.5, 11.5] }, { "line": [13.5, 13.5] }
	    ],
	    [
	      { "move": [2.5, 15.5] }, { "line": [3, 15.5] },
	      { "curve": [3.5, 15.5, 3.5, 16] }, { "line": [3.5, 17.5] }
	    ],
	    [
	      { "move": [16.5, 15.5] }, { "line": [16, 15.5] },
	      { "curve": [15.5, 15.5, 15.5, 16] }, { "line": [15.5, 17.5] }
	    ],
	    [
	      { "move": [5.5, 15.5] }, { "line": [7.5, 15.5] }
	    ],
	    [
	      { "move": [11.5, 15.5] }, { "line": [13.5, 15.5] }
	    ],
	    [
	      { "move": [2.5, 19.5] }, { "line": [5, 19.5] },
	      { "curve": [5.5, 19.5, 5.5, 19] }, { "line": [5.5, 17.5] }
	    ],
	    [
	      { "move": [5.5, 19]}, { "curve": [5.5, 19.5, 6, 19.5]},
	      { "line": [7.5, 19.5]}
	    ],
	    [
	      { "move": [11.5, 19.5] }, { "line": [13, 19.5] },
	      { "curve": [13.5, 19.5, 13.5, 19] }, { "line": [13.5, 17.5] }
	    ],
	    [
	      { "move": [13.5, 19] }, { "curve": [13.5, 19.5, 14, 19.5] },
	      { "line": [16.5, 19.5] }
	    ],
	    [
	      { "move": [7.5, 13.5] }, { "line": [9, 13.5] },
	      { "curve": [9.5, 13.5, 9.5, 14] }, { "line": [9.5, 15.5] }
	    ],
	    [
	      { "move": [9.5, 14] }, { "curve": [9.5, 13.5, 10, 13.5] },
	      { "line": [11.5, 13.5] }
	    ],
	    [
	      { "move": [7.5, 17.5] }, { "line": [9, 17.5] },
	      { "curve": [9.5, 17.5, 9.5, 18] }, { "line": [9.5, 19.5] }
	    ],
	    [
	      { "move": [9.5, 18] }, { "curve": [9.5, 17.5, 10, 17.5] },
	      { "line": [11.5, 17.5] }
	    ],
	    [
	      { "move": [8.5, 9.5] }, { "line": [8, 9.5] }, { "curve": [7.5, 9.5, 7.5, 10] },
	      { "line": [7.5, 11] }, { "curve": [7.5, 11.5, 8, 11.5] },
	      { "line": [11, 11.5] }, { "curve": [11.5, 11.5, 11.5, 11] },
	      { "line": [11.5, 10] }, { "curve": [11.5, 9.5, 11, 9.5] },
	      { "line": [10.5, 9.5] }
	    ]
	  ]
	};

	module.exports = Game;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	const Game = __webpack_require__(1);
	const Util = __webpack_require__(3);

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
	  let speed = this.isVulnerable() ? 1 : this.isHidden() ? 4 : 2,
	      xSpeed = (dir === Util.LEFT && -speed || dir === Util.RIGHT && speed || 0),
	      ySpeed = (dir === Util.DOWN && speed || dir === Util.UP && -speed || 0);

	  return {
	    "x": this.addBounded(current.x, xSpeed),
	    "y": this.addBounded(current.y, ySpeed)
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
	  let moves = (this.direction === Util.LEFT || this.direction === Util.RIGHT) ? [Util.UP, Util.DOWN] : [Util.LEFT, Util.RIGHT];
	  return moves[Math.floor(Math.random() * 2)];
	};

	Villain.prototype.reset = function(){
	  this.eaten = null;
	  this.eatable = null;
	  this.position = { "x": 90, "y": 80 };
	  this.direction = this.getRandomDirection();
	  this.due = this.getRandomDirection();
	};

	Villain.prototype.onWholeSquare = function(x){
	  return x % 10 === 0;
	};

	Villain.prototype.oppositeDirection = function(dir){
	  return dir === Util.LEFT && Util.RIGHT ||
	    dir === Util.RIGHT && Util.LEFT ||
	    dir === Util.UP && Util.DOWN || Util.UP;
	};

	Villain.prototype.makeEatable = function(){
	  this.direction = this.oppositeDirection(this.direction);
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
	  } else if (dir === Util.RIGHT || dir === Util.DOWN) {
	    return x + (10 - rem);
	  } else {
	    return x - rem;
	  }
	};

	Villain.prototype.onGridSquare = function(pos){
	  return this.onWholeSquare(pos.y) && this.onWholeSquare(pos.x);
	};

	Villain.prototype.secondsAgo = function(tick){
	  return (this.game.getTick() - tick) / Game.FPS;
	};

	Villain.prototype.getColor = function(){
	  if (this.eatable) {
	    if (this.secondsAgo(this.eatable) > 5) {
	      return this.game.getTick() % 20 > 10 ? "#FFFFFF" : "#0000BB";
	    } else {
	      return "#0000BB";
	    }
	  } else if (this.eaten) {
	    return "rgba(0,0,0,0)";
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

	  if (this.eatable && this.secondsAgo(this.eatable) > 8) {
	    this.eatable = null;
	  }
	  if (this.eaten && this.secondsAgo(this.eaten) > 3) {
	    this.eaten = null;
	  }

	  ctx.fillStyle = this.getColor();
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
	  ctx.arc(left + 6, top + 6, s / 6, 0, 300, false);
	  ctx.arc((left + s) - 6, top + 6, s / 6, 0, 300, false);
	  ctx.closePath();
	  ctx.fill();

	  off[Util.RIGHT] = [f, 0];
	  off[Util.LEFT] = [-f, 0];
	  off[Util.UP] = [0, -f];
	  off[Util.DOWN] = [0, f];

	  ctx.beginPath();
	  ctx.fillStyle = "#000";
	  ctx.arc(left + 6 + off[this.direction][0], top + 6 + off[this.direction][1], s / 15, 0, 300, false);
	  ctx.arc((left + s) - 6 + off[this.direction][0], top + 6 + off[this.direction][1], s / 15, 0, 300, false);
	  ctx.closePath();
	  ctx.fill();
	};

	Villain.prototype.pane = function(pos){
	  if (pos.y === 100 && pos.x >= 190 && this.direction === Util.RIGHT) {
	    return { "y": 100, "x": -10 };
	  }
	  if (pos.y === 100 && pos.x <= -10 && this.direction === Util.LEFT) {
	    return { "y": 100, "x": 190 };
	  }
	  return false;
	};

	Villain.prototype.move = function(ctx){
	  let oldPos = this.position,
	      onGrid = this.onGridSquare(this.position),
	      npos = null;

	  if (this.due !== this.direction) {
	    npos = this.getNewCoord(this.due, this.position);
	    if (onGrid && this.map.isFloorSpace({
	        "y": this.pointToCoord(this.nextSquare(npos.y, this.due)),
	        "x": this.pointToCoord(this.nextSquare(npos.x, this.due))
	      })
	    ) {
	      this.direction = this.due;
	    } else {
	      npos = null;
	    }
	  }
	  if (npos === null) {
	    npos = this.getNewCoord(this.direction, this.position);
	  }
	  if (onGrid && this.map.isWallSpace({
	      "y": this.pointToCoord(this.nextSquare(npos.y, this.direction)),
	      "x": this.pointToCoord(this.nextSquare(npos.x, this.direction))
	    })
	  ) {
	    this.due = this.getRandomDirection();
	    return this.move(ctx);
	  }
	  this.position = npos;
	  var tmp = this.pane(this.position);
	  if (tmp) this.position = tmp;
	  this.due = this.getRandomDirection();
	  return { "new": this.position, "old": oldPos };
	};

	module.exports = Villain;


/***/ },
/* 3 */
/***/ function(module, exports) {

	const Util = {
	  DOWN        : 1,
	  LEFT        : 2,
	  UP          : 3,
	  NONE        : 4,
	  WAITING     : 5,
	  PAUSE       : 6,
	  PLAYING     : 7,
	  COUNTDOWN   : 8,
	  EATEN_PAUSE : 9,
	  DYING       : 10,
	  RIGHT       : 11,
	  OVER        : 12,
	  KEY         : {
	    "BACKSPACE": 8,
	    "TAB": 9,
	    "NUM_PAD_CLEAR": 12,
	    "ENTER": 13,
	    "SHIFT": 16,
	    "CTRL": 17,
	    "ALT": 18,
	    "PAUSE": 19,
	    "CAPS_LOCK": 20,
	    "ESCAPE": 27,
	    "SPACEBAR": 32,
	    "PAGE_UP": 33,
	    "PAGE_DOWN": 34,
	    "END": 35,
	    "HOME": 36,
	    "ARROW_LEFT": 37,
	    "ARROW_UP": 38,
	    "ARROW_RIGHT": 39,
	    "ARROW_DOWN": 40,
	    "PRINT_SCREEN": 44,
	    "INSERT": 45,
	    "DELETE": 46,
	    "SEMICOLON": 59,
	    "WINDOWS_LEFT": 91,
	    "WINDOWS_RIGHT": 92,
	    "SELECT": 93,
	    "NUM_PAD_ASTERISK": 106,
	    "NUM_PAD_PLUS_SIGN": 107,
	    "NUM_PAD_HYPHEN-MINUS": 109,
	    "NUM_PAD_FULL_STOP": 110,
	    "NUM_PAD_SOLIDUS": 111,
	    "NUM_LOCK": 144,
	    "SCROLL_LOCK": 145,
	    "EQUALS_SIGN": 187,
	    "COMMA": 188,
	    "HYPHEN-MINUS": 189,
	    "FULL_STOP": 190,
	    "SOLIDUS": 191,
	    "GRAVE_ACCENT": 192,
	    "LEFT_SQUARE_BRACKET": 219,
	    "REVERSE_SOLIDUS": 220,
	    "RIGHT_SQUARE_BRACKET": 221,
	    "APOSTROPHE": 222
	  }
	};

	module.exports = Util;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	const Game = __webpack_require__(1);
	const Util = __webpack_require__(3);

	const Pacman = function(game, map){
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

	Pacman.prototype.addScore = function(nScore){
	  this.score += nScore;
	  if (this.score >= 10000 && this.score - nScore < 10000) {
	    this.lives += 1;
	  }
	};

	Pacman.prototype.theScore = function(){
	  return this.score;
	};

	Pacman.prototype.loseLife = function(){
	  this.lives -= 1;
	};

	Pacman.prototype.getLives = function(){
	  return this.lives;
	};

	Pacman.prototype.initUser = function(){
	  this.score = 0;
	  this.lives = 3;
	  this.newLevel();
	};

	Pacman.prototype.newLevel = function(){
	  this.resetPosition();
	  this.eaten = 0;
	};

	Pacman.prototype.resetPosition = function(){
	  this.position = { "x": 90, "y": 120 };
	  this.direction = Util.LEFT;
	  this.due = Util.LEFT;
	};

	Pacman.prototype.reset = function(){
	  this.initUser();
	  this.resetPosition();
	};

	Pacman.prototype.keyDown = function(event) {
	  if (typeof this.keyMap[event.keyCode] !== "undefined") {
	    this.due = this.keyMap[event.keyCode];
	    event.preventDefault();
	    event.stopPropagation();
	    return false;
	  }
	  return true;
	};

	Pacman.prototype.getNewCoord = function(dir, current){
	  return {
	    "x": current.x + (dir === Util.LEFT && -2 || dir === Util.RIGHT && 2 || 0),
	    "y": current.y + (dir === Util.DOWN && 2 || dir === Util.UP && -2 || 0)
	  };
	};

	Pacman.prototype.onWholeSquare = function(x){
	  return x % 10 === 0;
	};

	Pacman.prototype.pointToCoord = function(x){
	  return Math.round(x / 10);
	};

	Pacman.prototype.nextSquare = function(x, dir){
	  let rem = x % 10;
	  if (rem === 0) {
	    return x;
	  } else if (dir === Util.RIGHT || dir === Util.DOWN) {
	    return x + (10 - rem);
	  } else {
	    return x - rem;
	  }
	};

	Pacman.prototype.next = function(pos, dir){
	  return {
	    "y": this.pointToCoord(this.nextSquare(pos.y, dir)),
	    "x": this.pointToCoord(this.nextSquare(pos.x, dir))
	  };
	};

	Pacman.prototype.onGridSquare = function(pos){
	  return this.onWholeSquare(pos.y) && this.onWholeSquare(pos.x);
	};

	Pacman.prototype.isOnSamePlane = function(due, dir) {
	  return ((due === Util.LEFT || due === Util.RIGHT) &&
	    (dir === Util.LEFT || dir === Util.RIGHT)) ||
	    ((due === Util.UP || due === Util.DOWN) &&
	    (dir === Util.UP || dir === Util.DOWN));
	};

	Pacman.prototype.move = function(ctx){
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

	Pacman.prototype.isMidSquare = function(x){
	  let rem = x % 10;
	  return rem > 3 || rem < 7;
	};

	Pacman.prototype.calcAngle = function(dir, pos) {
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

	Pacman.prototype.drawDead = function(ctx, amount){
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

	Pacman.prototype.draw = function (ctx) {
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

	module.exports = Pacman;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	const Game = __webpack_require__(1);

	const Maze = function (size){
	  this.height = null;
	  this.width = null;
	  this.blockSize = size;
	  this.pillSize = 0;
	  this.maze = null;
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
	          Math.abs(8 - (this.pillSize / 2)),
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


/***/ },
/* 6 */
/***/ function(module, exports) {

	const Audio = function (game) {
	  this.game = game;
	  this.files = [];
	  this.endEvents = [];
	  this.progressEvents = [];
	  this.playing = [];
	};

	Audio.prototype.load = function (name, path, callback) {
	  let that = this;
	  let f = this.files[name] = document.createElement("audio");
	  this.progressEvents[name] = function(event) { that.progress(event, name, callback); };

	  f.addEventListener("canplaythrough", this.progressEvents[name], true);
	  f.setAttribute("preload", "true");
	  f.setAttribute("autobuffer", "true");
	  f.setAttribute("src", path);
	  f.pause();
	};

	Audio.prototype.progress = function (event, name, callback) {
	  if (event.loaded === event.total && typeof callback === "function") {
	    callback();
	    this.files[name].removeEventListener(
	      "canplaythrough",
	      this.progressEvents[name],
	      true
	    );
	  }
	};

	Audio.prototype.disableSound = function () {
	  for (let i = 0; i < this.playing.length; i++) {
	    this.files[this.playing[i]].pause();
	    this.files[this.playing[i]].currentTime = 0;
	  }
	  this.playing = [];
	};

	Audio.prototype.ended = function (name) {
	  let i, tmp = [], found = false;
	  this.files[name].removeEventListener("ended", this.endEvents[name], true);
	  for(i = 0; i < this.playing.length; i++) {
	    if (!found && this.playing[i]) {
	      found = true;
	    } else {
	      tmp.push(this.playing[i]);
	    }
	  }
	  this.playing = tmp;
	};

	Audio.prototype.play = function (name) {
	  let that = this;
	  if (!this.game.soundDisabled()) {
	    this.endEvents[name] = function () { that.ended(name); };
	    this.playing.push(name);
	    this.files[name].addEventListener("ended", this.endEvents[name], true);
	    this.files[name].play();
	  }
	};

	Audio.prototype.pause = function () {
	  for (let i = 0; i < this.playing.length; i++) {
	    this.files[this.playing[i]].pause();
	  }
	};

	Audio.prototype.resume = function () {
	  for (let i = 0; i < this.playing.length; i++) {
	    this.files[this.playing[i]].play();
	  }
	};

	module.exports = Audio;


/***/ }
/******/ ]);