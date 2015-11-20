Game.UIMode = {};
Game.UIMode.DEFAULT_COLOR_FG = '#fff';
Game.UIMode.DEFAULT_COLOR_BG = '#000';
Game.UIMode.DEFAULT_COLOR_STR = '%c{'+Game.UIMode.DEFAULT_COLOR_FG+'}%b{'+Game.UIMode.DEFAULT_COLOR_BG+'}';

Game.UIMode.gameStart = {
  enter: function () {
    console.log('game starting');
    Game.Message.send("Welcome to WSRL");
  },
  exit: function () {
  },
  render: function (display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(1,1,"game start",fg,bg);
    display.drawText(1,3,"press any key to continue",fg,bg);
  },
  handleInput: function (inputType,inputData) {
  //  console.log('gameStart inputType:');
  //  console.dir(inputType);
  //  console.log('gameStart inputData:');
  //  console.dir(inputData);
    if (inputData.charCode !== 0) { // ignore the various modding keys - control, shift, etc.
      Game.switchUiMode(Game.UIMode.gamePersistence);
    }
  }
};

Game.UIMode.gamePersistence = {
  enter: function () {
    console.log('game persistence');
  },
  exit: function () {
  },
  render: function (display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(1,3,"press S to save the current game, L to load the saved game, or N start a new one",fg,bg);
    console.log('TODO: check whether local storage has a game before offering restore');
    console.log('TODO: check whether a game is in progress before offering restore');
  },
  handleInput: function (inputType,inputData) {
  //  console.log('gameStart inputType:');
  //  console.dir(inputType);
  //  console.log('gameStart inputData:');
  //  console.dir(inputData);
    var inputChar = String.fromCharCode(inputData.charCode);
    if (inputChar == 'S') { // ignore the various modding keys - control, shift, etc.
      this.saveGame();
    } else if (inputChar == 'L') {
      this.restoreGame();
    } else if (inputChar == 'N') {
      this.newGame();
    }
  },
  restoreGame: function () {
    var  json_state_data = '{"randomSeed":12}';
    console.log('TODO: implement recovering game state from local storage');
    var state_data = JSON.parse(json_state_data);
    console.dir(state_data);
    Game.setRandomSeed(state_data.randomSeed);
    console.log("post-restore: using random seed "+Game.getRandomSeed());
    Game.switchUiMode(Game.UIMode.gamePlay);
  },
  saveGame: function (json_state_data) {
    console.log('TODO: implement saving game state to local storage');
    Game.switchUiMode(Game.UIMode.gamePlay);
  },
  newGame: function () {
    Game.setRandomSeed(5 + Math.floor(Math.random()*100000));
    Game.switchUiMode(Game.UIMode.gamePlay);
  }
};

Game.UIMode.gamePlay = {
  enter: function () {
    console.log('game playing');
    Game.Message.clear();
  },
  exit: function () {
  },
  render: function (display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(1,1,"game play",fg,bg);
    display.drawText(1,3,"press [Enter] to win",fg,bg);
    display.drawText(1,4,"press [Esc] to lose",fg,bg);
    display.drawText(1,5,"press = to save, restore, or start a new game",fg,bg);
  },
  handleInput: function (inputType,inputData) {
    // console.log('gameStart inputType:');
    // console.dir(inputType);
    // console.log('gameStart inputData:');
    // console.dir(inputData);
    Game.Message.send("you pressed the '"+String.fromCharCode(inputData.charCode)+"' key");
    if (inputType == 'keypress') {
      if (inputData.keyIdentifier == 'Enter') {
        Game.switchUiMode(Game.UIMode.gameWin);
      }
    }
    else if (inputType == 'keydown') {
      if (inputData.keyCode == 27) {
        Game.switchUiMode(Game.UIMode.gameLose);
      }
    }
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
    // console.log('gameStart inputType:');
    // console.dir(inputType);
    // console.log('gameStart inputData:');
    // console.dir(inputData);
    Game.Message.clear();
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
    // console.log('gameStart inputType:');
    // console.dir(inputType);
    // console.log('gameStart inputData:');
    // console.dir(inputData);
    Game.Message.clear();
  }
};
