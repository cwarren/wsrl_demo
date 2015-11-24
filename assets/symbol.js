Game.Symbol = function (chr,fg,bg) {
  this.attr = {
      _char: chr,
      _fg:fg,
      _bg:bg
    };
};

Game.Symbol.prototype.getChar = function () {
  return this.attr._char;
};

Game.Symbol.prototype.getFg = function () {
  return this.attr._char;
};

Game.Symbol.prototype.getBg = function () {
  return this.attr._char;
};
