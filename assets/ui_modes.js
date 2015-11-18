Game.UIMode = {};
Game.UIMode.DEFAULT_COLOR_FG = '#fff';
Game.UIMode.DEFAULT_COLOR_BG = '#000';
Game.UIMode.DEFAULT_COLOR_STR = '%c{'+Game.UIMode.DEFAULT_COLOR_FG+'}%b{'+Game.UIMode.DEFAULT_COLOR_BG+'}';

Game.UIMode.gameStart = {
  enter: function () {
    console.log('game starting');
  },
  exit: function () {
  },
  render: function (display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(1,1,"game start",fg,bg);
    display.drawText(1,3,"press any key to play",fg,bg);
  },
  handleInput: function (inputType,inputData) {
    console.log('gameStart inputType:');
    console.dir(inputType);
    console.log('gameStart inputData:');
    console.dir(inputData);
  }
};

Game.UIMode.gamePlay = {
  enter: function () {
    console.log('game playing');
  },
  exit: function () {
  },
  render: function (display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(1,1,"game play",fg,bg);
    display.drawText(1,3,"press [Enter] to win",fg,bg);
    display.drawText(1,4,"press [Esc] to lose",fg,bg);
  },
  handleInput: function (inputType,inputData) {
    console.log('gamePlay inputType:');
    console.dir(inputType);
    console.log('gamePlay inputData:');
    console.dir(inputData);
  }
};

Game.UIMode.gameWin = {
  enter: function () {
    console.log('game winning');
  },
  exit: function () {
  },
  render: function (display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(1,1,"You WON!!!!",fg,bg);
  },
  handleInput: function (inputType,inputData) {
    console.log('gameWin inputType:');
    console.dir(inputType);
    console.log('gameWin inputData:');
    console.dir(inputData);
  }
};

Game.UIMode.gameLose = {
  enter: function () {
    console.log('game losing');
  },
  exit: function () {
  },
  render: function (display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(1,1,"You lost :(",fg,bg);
  },
  handleInput: function (inputType,inputData) {
    console.log('gameLose inputType:');
    console.dir(inputType);
    console.log('gameLose inputData:');
    console.dir(inputData);
  }
};
