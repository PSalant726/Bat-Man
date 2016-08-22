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
