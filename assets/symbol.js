Game.Symbol = function (chr,fg,bg) {
  this.attr = {
      _char: chr,
      _fg:fg||Game.UIMode.DEFAULT_COLOR_FG,
      _bg:bg||Game.UIMode.DEFAULT_COLOR_BG
    };
};

Game.Symbol.prototype.getChar = function () {
  return this.attr._char;
};

Game.Symbol.prototype.getFg = function () {
  return this.attr._fg;
};

Game.Symbol.prototype.getBg = function () {
  return this.attr._bg;
};

Game.Symbol.prototype.draw = function (display,x,y) {
  display.draw(x,y,this.attr._char,this.attr._fg,this.attr._bg);
};

Game.Symbol.AVATAR = new Game.Symbol('@','#dda');
