Game.UIMode = {};
Game.UIMode.DEFAULT_COLOR_FG = '#fff';
Game.UIMode.DEFAULT_COLOR_BG = '#000';
Game.UIMode.DEFAULT_COLOR_STR = '%c{'+Game.UIMode.DEFAULT_COLOR_FG+'}%b{'+Game.UIMode.DEFAULT_COLOR_BG+'}';

Game.UIMode.gameStart = {
  enter: function () {
    console.log('game starting');
    Game.Message.send("Welcome to WSRL");
    Game.refresh();
  },
  exit: function () {
    Game.refresh();
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
    Game.refresh();
    console.log('game persistence');
  },
  exit: function () {
    Game.refresh();
  },
  render: function (display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(1,3,"press S to save the current game, L to load the saved game, or N start a new one",fg,bg);
//    console.log('TODO: check whether local storage has a game before offering restore');
//    console.log('TODO: check whether a game is in progress before offering restore');
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
  saveGame: function (json_state_data) {
    if (this.localStorageAvailable()) {
      window.localStorage.setItem(Game._PERSISTANCE_NAMESPACE, JSON.stringify(Game._game)); // .toJSON()
      Game.switchUiMode(Game.UIMode.gamePlay);
    }
  },
  restoreGame: function () {
    if (this.localStorageAvailable()) {
      var json_state_data = window.localStorage.getItem(Game._PERSISTANCE_NAMESPACE);
      var state_data = JSON.parse(json_state_data);
      Game.setRandomSeed(state_data._randomSeed);
      Game.UIMode.gamePlay.setupPlay(state_data);
      Game.switchUiMode(Game.UIMode.gamePlay);
    }
  },
  newGame: function () {
    Game.setRandomSeed(5 + Math.floor(ROT.RNG.getUniform()*100000));
    Game.UIMode.gamePlay.setupPlay();
    Game.switchUiMode(Game.UIMode.gamePlay);
  },
  localStorageAvailable: function () { // NOTE: see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
  	try {
  		var x = '__storage_test__';
  		window.localStorage.setItem( x, x);
  		window.localStorage.removeItem(x);
  		return true;
  	}
  	catch(e) {
      Game.Message.send('Sorry, no local data storage is available for this browser');
  		return false;
  	}
  },
  BASE_toJSON: function(state_hash_name) {
    var state = this.attr;
    if (state_hash_name) {
      state = this[state_hash_name];
    }
    var json = {};
    for (var at in state) {
      if (state.hasOwnProperty(at)) {
        if (state[at] instanceof Object && 'toJSON' in state[at]) {
          json[at] = state[at].toJSON();
        } else {
          json[at] = state[at];
        }
      }
    }
    return json;
  },
  BASE_fromJSON: function (json,state_hash_name) {
    var using_state_hash = 'attr';
    if (state_hash_name) {
      using_state_hash = state_hash_name;
    }
    for (var at in this[using_state_hash]) {
      if (this[using_state_hash].hasOwnProperty(at)) {
        if (this[using_state_hash][at] instanceof Object && 'fromJSON' in this[using_state_hash][at]) {
          this[using_state_hash][at].fromJSON(json[at]);
        } else {
          this[using_state_hash][at] = json[at];
        }
      }
    }
  }
};

Game.UIMode.gamePlay = {
  attr: {
    _map: null,
    _mapWidth: 300,
    _mapHeight: 200,
    _cameraX: 100,
    _cameraY: 100,
    _avatar: null
  },
  JSON_KEY: 'uiMode_gamePlay',
  enter: function () {
    console.log('game playing');
    Game.Message.clear();
    Game.refresh();
  },
  exit: function () {
    Game.refresh();
  },
  render: function (display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    this.attr._map.renderOn(display,this.attr._cameraX,this.attr._cameraY);
    display.drawText(1,1,"game play",fg,bg); // DEV
    display.drawText(1,3,"press [Enter] to win",fg,bg);
    display.drawText(1,4,"press [Esc] to lose",fg,bg);
    display.drawText(1,5,"press = to save, restore, or start a new game",fg,bg);
    this.renderAvatar(display);
  },
  renderAvatar: function (display) {
    Game.Symbol.AVATAR.draw(display,this.attr._avatar.getX()-this.attr._cameraX+display._options.width/2,
                                    this.attr._avatar.getY()-this.attr._cameraY+display._options.height/2);
  },
  renderAvatarInfo: function (display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(1,2,"avatar x: "+this.attr._avatar.getX(),fg,bg); // DEV
    display.drawText(1,3,"avatar y: "+this.attr._avatar.getY(),fg,bg); // DEV
  },
  moveAvatar: function (dx,dy) {
    if (this.attr._avatar.tryWalk(this.attr._map,dx,dy)) {
      this.setCameraToAvatar();
    }
  },
  moveCamera: function (dx,dy) {
    this.setCamera(this.attr._cameraX + dx,this.attr._cameraY + dy);
  },
  setCamera: function (sx,sy) {
    this.attr._cameraX = Math.min(Math.max(0,sx),this.attr._mapWidth);
    this.attr._cameraY = Math.min(Math.max(0,sy),this.attr._mapHeight);
    Game.refresh();
  },
  setCameraToAvatar: function () {
    this.setCamera(this.attr._avatar.getX(),this.attr._avatar.getY());
  },
  handleInput: function (inputType,inputData) {
    var pressedKey = String.fromCharCode(inputData.charCode);
    Game.Message.send("you pressed the '"+String.fromCharCode(inputData.charCode)+"' key");
    Game.renderDisplayMessage();
    if (inputType == 'keypress') {
      // console.log('gameStart inputType:'); // DEV
      // console.dir(inputType);
      // console.log('gameStart inputData:');
      // console.dir(inputData);
      if (inputData.keyIdentifier == 'Enter') {
        Game.switchUiMode(Game.UIMode.gameWin);
        return;
      } else if (pressedKey == '1') {
        this.moveAvatar(-1,1);
      } else if (pressedKey == '2') {
        this.moveAvatar(0,1);
      } else if (pressedKey == '3') {
        this.moveAvatar(1,1);
      } else if (pressedKey == '4') {
        this.moveAvatar(-1,0);
      } else if (pressedKey == '5') {
        // do nothing / stay still
      } else if (pressedKey == '6') {
        this.moveAvatar(1,0);
      } else if (pressedKey == '7') {
        this.moveAvatar(-1,-1);
      } else if (pressedKey == '8') {
        this.moveAvatar(0,-1);
      } else if (pressedKey == '9') {
        this.moveAvatar(1,-1);
      }
    }
    else if (inputType == 'keydown') {
      // console.log('gameStart inputType:');
      // console.dir(inputType);
      // console.log('gameStart inputData:');
      // console.dir(inputData);
      if (inputData.keyCode == 27) { // 'Escape'
        Game.switchUiMode(Game.UIMode.gameLose);
      }
      else if (inputData.keyCode == 187) { // '='
        Game.switchUiMode(Game.UIMode.gamePersistence);
      }
    }
  },
  setupPlay: function (restorationData) {
    var mapTiles = Game.util.init2DArray(this.attr._mapWidth,this.attr._mapHeight,Game.Tile.nullTile);
    var generator = new ROT.Map.Cellular(this.attr._mapWidth,this.attr._mapHeight);
    generator.randomize(0.5);

    // repeated cellular automata process
    var totalIterations = 3;
    for (var i = 0; i < totalIterations - 1; i++) {
      generator.create();
    }

    // run again then update map
    generator.create(function(x,y,v) {
      if (v === 1) {
        mapTiles[x][y] = Game.Tile.floorTile;
      } else {
        mapTiles[x][y] = Game.Tile.wallTile;
      }
    });

    // create map from the tiles
    this.attr._map =  new Game.Map(mapTiles);

    this.attr._avatar = new Game.Entity(Game.EntityTemplates.Avatar);

    // restore anything else if the data is available
    if (restorationData !== undefined && restorationData.hasOwnProperty(Game.UIMode.gamePlay.JSON_KEY)) {
      this.fromJSON(restorationData[Game.UIMode.gamePlay.JSON_KEY]);
    } else {
      this.attr._avatar.setPos(this.attr._map.getRandomWalkableLocation());
    }

    this.setCameraToAvatar();
  },
  toJSON: function() {
    return Game.UIMode.gamePersistence.BASE_toJSON.call(this);
  },
  fromJSON: function (json) {
    Game.UIMode.gamePersistence.BASE_fromJSON.call(this,json);
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
