Game.UIMode = {};
Game.UIMode.DEFAULT_COLOR_FG = '#fff';
Game.UIMode.DEFAULT_COLOR_BG = '#000';
Game.UIMode.DEFAULT_COLOR_STR = '%c{'+Game.UIMode.DEFAULT_COLOR_FG+'}%b{'+Game.UIMode.DEFAULT_COLOR_BG+'}';

Game.UIMode.gameStart = {
  enter: function () {
    //console.log('game starting');
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
  RANDOM_SEED_KEY: 'gameRandomSeed',
  enter: function () {
    Game.refresh();
    //console.log('game persistence');
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
    if (inputType == 'keypress') {
      var inputChar = String.fromCharCode(inputData.charCode);
      if (inputChar == 'S') { // ignore the various modding keys - control, shift, etc.
        this.saveGame();
      } else if (inputChar == 'L') {
        this.restoreGame();
      } else if (inputChar == 'N') {
        this.newGame();
      }
    } else if (inputType == 'keydown') {
      if (inputData.keyCode == 27) { // 'Escape'
        Game.switchUiMode(Game.UIMode.gamePlay);
      }
    }
  },
  saveGame: function () {
    if (this.localStorageAvailable()) {
      Game.DATASTORE.GAME_PLAY = Game.UIMode.gamePlay.attr;
      Game.DATASTORE.MESSAGES = Game.Message.attr;

      Game.DATASTORE.SCHEDULE = {};
      // NOTE: offsetting times by 1 so later restore can just drop them in and go
      Game.DATASTORE.SCHEDULE[Game.Scheduler._current.getId()] = 1;
      for (var i = 0; i < Game.Scheduler._queue._eventTimes.length; i++) {
        Game.DATASTORE.SCHEDULE[Game.Scheduler._queue._events[i].getId()] = Game.Scheduler._queue._eventTimes[i] + 1;
      }
      Game.DATASTORE.SCHEDULE_TIME = Game.Scheduler._queue.getTime() - 1; // offset by 1 so that when the engine is started after restore the queue state will match that as when it was saved

      window.localStorage.setItem(Game._PERSISTANCE_NAMESPACE, JSON.stringify(Game.DATASTORE));
      Game.switchUiMode(Game.UIMode.gamePlay);
    }
  },
  restoreGame: function () {
    if (this.localStorageAvailable()) {
      var json_state_data = window.localStorage.getItem(Game._PERSISTANCE_NAMESPACE);
      var state_data = JSON.parse(json_state_data);

      Game.DATASTORE = {};
      Game.DATASTORE.MAP = {};
      Game.DATASTORE.ENTITY = {};
      Game.initializeTimingEngine();
      // NOTE: the timing stuff is initialized here because we need to ensure that the stuff exists when entities are created, but the actual schedule restoration re-runs timing initialization

      // game level stuff
      Game.setRandomSeed(state_data[this.RANDOM_SEED_KEY]);

      // maps
      for (var mapId in state_data.MAP) {
        if (state_data.MAP.hasOwnProperty(mapId)) {
          var mapAttr = JSON.parse(state_data.MAP[mapId]);
          Game.DATASTORE.MAP[mapId] = new Game.Map(mapAttr._mapTileSetName);
          Game.DATASTORE.MAP[mapId].fromJSON(state_data.MAP[mapId]);
        }
      }

      ROT.RNG.getUniform(); // once the map is regenerated cycle the RNG so we're getting new data for entity generation

      // entities
      for (var entityId in state_data.ENTITY) {
        if (state_data.ENTITY.hasOwnProperty(entityId)) {
          var entAttr = JSON.parse(state_data.ENTITY[entityId]);
          var newE = Game.EntityGenerator.create(entAttr._generator_template_key,entAttr._id);
          Game.DATASTORE.ENTITY[entityId] = newE;
          Game.DATASTORE.ENTITY[entityId].fromJSON(state_data.ENTITY[entityId]);
        }
      }

      // game play et al
      Game.UIMode.gamePlay.attr = state_data.GAME_PLAY;
      Game.Message.attr = state_data.MESSAGES;

      // schedule
      Game.initializeTimingEngine();
      for (var schedItemId in state_data.SCHEDULE) {
        if (state_data.SCHEDULE.hasOwnProperty(schedItemId)) {
          // check here to determine which data store thing will be added to the scheduler (and the actual addition may vary - e.g. not everyting will be a repeatable thing)
          if (Game.DATASTORE.ENTITY.hasOwnProperty(schedItemId)) {
            Game.Scheduler.add(Game.DATASTORE.ENTITY[schedItemId],true,state_data.SCHEDULE[schedItemId]);
          }
        }
      }
      Game.Scheduler._queue._time = state_data.SCHEDULE_TIME;

      Game.switchUiMode(Game.UIMode.gamePlay);
    }
  },
  newGame: function () {
    Game.DATASTORE = {};
    Game.DATASTORE.MAP = {};
    Game.DATASTORE.ENTITY = {};
    Game.initializeTimingEngine();
    Game.setRandomSeed(5 + Math.floor(Game.TRANSIENT_RNG.getUniform()*100000));
    Game.UIMode.gamePlay.setupNewGame();
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
    var json = JSON.stringify(state);

    // var json = {};
    // for (var at in state) {
    //   if (state.hasOwnProperty(at)) {
    //     if (state[at] instanceof Object && 'toJSON' in state[at]) {
    //       json[at] = state[at].toJSON();
    //     } else {
    //       json[at] = state[at];
    //     }
    //   }
    // }
    return json;
  },
  BASE_fromJSON: function (json,state_hash_name) {
    var using_state_hash = 'attr';
    if (state_hash_name) {
      using_state_hash = state_hash_name;
    }
    this[using_state_hash] = JSON.parse(json);
    // for (var at in this[using_state_hash]) {
    //   if (this[using_state_hash].hasOwnProperty(at)) {
    //     if (this[using_state_hash][at] instanceof Object && 'fromJSON' in this[using_state_hash][at]) {
    //       this[using_state_hash][at].fromJSON(json[at]);
    //     } else {
    //       this[using_state_hash][at] = json[at];
    //     }
    //   }
    // }
  }
};

Game.UIMode.gamePlay = {
  attr: {
    _mapId: '',
    _cameraX: 100,
    _cameraY: 100,
    _avatarId: ''
  },
  JSON_KEY: 'uiMode_gamePlay',
  enter: function () {
    // console.log('game playing');
    // console.log('engine lock state is '+Game.TimeEngine._lock);
    if (this.attr._avatarId) {
      this.setCameraToAvatar();
    }
    Game.TimeEngine.unlock();
    Game.refresh();
    // console.log('end enter game play; engine lock state is '+Game.TimeEngine._lock);
    //this.getAvatar().raiseEntityEvent('actionDone');
  },
  exit: function () {
    Game.refresh();
    Game.TimeEngine.lock();
  },
  getMap: function () {
    return Game.DATASTORE.MAP[this.attr._mapId];
  },
  setMap: function (m) {
    this.attr._mapId = m.getId();
  },
  getAvatar: function () {
    return Game.DATASTORE.ENTITY[this.attr._avatarId];
  },
  setAvatar: function (a) {
    this.attr._avatarId = a.getId();
  },
  render: function (display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    this.getMap().renderOn(display,this.attr._cameraX,this.attr._cameraY);
    // display.drawText(1,1,"game play",fg,bg); // DEV
    // display.drawText(1,3,"press [Enter] to win",fg,bg);
    // display.drawText(1,4,"press [Esc] to lose",fg,bg);
    // display.drawText(1,5,"press = to save, restore, or start a new game",fg,bg);

    //this.renderAvatar(display);
  },
  // renderAvatar: function (display) {
  //   Game.Symbol.AVATAR.draw(display,this.attr._avatar.getX()-this.attr._cameraX+display._options.width/2,
  //                                   this.attr._avatar.getY()-this.attr._cameraY+display._options.height/2);
  // },
  renderAvatarInfo: function (display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(1,2,"avatar x: "+this.getAvatar().getX(),fg,bg); // DEV
    display.drawText(1,3,"avatar y: "+this.getAvatar().getY(),fg,bg); // DEV
  },
  moveAvatar: function (dx,dy) {
    if (this.getAvatar().tryWalk(this.getMap(),dx,dy)) {
      this.setCameraToAvatar();
      return true;
    }
    return false;
  },
  moveCamera: function (dx,dy) {
    this.setCamera(this.attr._cameraX + dx,this.attr._cameraY + dy);
  },
  setCamera: function (sx,sy) {
    this.attr._cameraX = Math.min(Math.max(0,sx),this.getMap().getWidth());
    this.attr._cameraY = Math.min(Math.max(0,sy),this.getMap().getHeight());
    //Game.renderDisplayMain();
  },
  setCameraToAvatar: function () {
    this.setCamera(this.getAvatar().getX(),this.getAvatar().getY());
  },
  handleInput: function (inputType,inputData) {
    var tookTurn = false;
    if (inputType == 'keypress') {

      // NOTE: a lot of repeated call below - think about where/how that might be done differently...?
      var pressedKey = String.fromCharCode(inputData.charCode);
      if (inputData.keyIdentifier == 'Enter') {
        Game.switchUiMode(Game.UIMode.gameWin);
        return;
      } else if (pressedKey == '1') {
        //Game.Message.ageMessages();
        tookTurn = this.moveAvatar(-1,1);
      } else if (pressedKey == '2') {
        //Game.Message.ageMessages();
        tookTurn = this.moveAvatar(0,1);
      } else if (pressedKey == '3') {
        // Game.Message.ageMessages();
        tookTurn = this.moveAvatar(1,1);
      } else if (pressedKey == '4') {
        // Game.Message.ageMessages();
        tookTurn = this.moveAvatar(-1,0);
      } else if (pressedKey == '5') {
        // do nothing / stay still
        tookTurn = true;
        //Game.renderDisplayMessage();
      } else if (pressedKey == '6') {
        // Game.Message.ageMessages();
        tookTurn = this.moveAvatar(1,0);
      } else if (pressedKey == '7') {
        // Game.Message.ageMessages();
        tookTurn = this.moveAvatar(-1,-1);
      } else if (pressedKey == '8') {
        // Game.Message.ageMessages();
        tookTurn = this.moveAvatar(0,-1);
      } else if (pressedKey == '9') {
        // Game.Message.ageMessages();
        tookTurn = this.moveAvatar(1,-1);
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

    if (tookTurn) {
      this.getAvatar().raiseEntityEvent('actionDone');
      Game.Message.ageMessages();
      return true;
    }
  },
  setupNewGame: function () {
    this.setMap(new Game.Map('caves1'));
    this.setAvatar(Game.EntityGenerator.create('avatar'));

    this.getMap().addEntity(this.getAvatar(),this.getMap().getRandomWalkableLocation());
    this.setCameraToAvatar();

    // dev code - just add some entities to the map
    for (var ecount = 0; ecount < 5; ecount++) {
      this.getMap().addEntity(Game.EntityGenerator.create('moss'),this.getMap().getRandomWalkableLocation());
      this.getMap().addEntity(Game.EntityGenerator.create('newt'),this.getMap().getRandomWalkableLocation());
    }

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
