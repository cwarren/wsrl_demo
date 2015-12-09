Game.UIMode = {};
Game.UIMode.DEFAULT_COLOR_FG = '#fff';
Game.UIMode.DEFAULT_COLOR_BG = '#000';
Game.UIMode.DEFAULT_COLOR_STR = '%c{'+Game.UIMode.DEFAULT_COLOR_FG+'}%b{'+Game.UIMode.DEFAULT_COLOR_BG+'}';

//#############################################################################
//#############################################################################

Game.UIMode.gameStart = {
  enter: function () {
    //console.log('game starting');
    Game.Message.send("Welcome to WSRL");
    Game.KeyBinding.setKeyBinding();
    Game.refresh();
  },
  exit: function () {
    Game.KeyBinding.informPlayer();
    Game.refresh();
  },
  render: function (display) {
    display.drawText(1,1,Game.UIMode.DEFAULT_COLOR_STR+"game start");
    display.drawText(1,3,Game.UIMode.DEFAULT_COLOR_STR+"press any key to continue");
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

//#############################################################################
//#############################################################################

Game.UIMode.gamePersistence = {
  RANDOM_SEED_KEY: 'gameRandomSeed',
  _storedKeyBinding: '',
  enter: function () {
    this._storedKeyBinding = Game.KeyBinding.getKeyBinding();
    Game.KeyBinding.setKeyBinding('persist');
    Game.refresh();
    //console.log('game persistence');
  },
  exit: function () {
    Game.KeyBinding.setKeyBinding(this._storedKeyBinding);
    Game.refresh();
  },
  render: function (display) {
    display.drawText(3,3,Game.UIMode.DEFAULT_COLOR_STR+"press S to save the current game, L to load the saved game, or N start a new one",70);
//    console.log('TODO: check whether local storage has a game before offering restore');
//    console.log('TODO: check whether a game is in progress before offering restore');
  },
  handleInput: function (inputType,inputData) {
    // console.log(inputType);
    // console.dir(inputData);
    var actionBinding = Game.KeyBinding.getInputBinding(inputType,inputData);
    // console.log('action binding is');
    // console.dir(actionBinding);
    // console.log('----------');
    if (! actionBinding) {
      return false;
    }

    if        (actionBinding.actionKey == 'PERSISTENCE_SAVE') {
      this.saveGame();
    } else if (actionBinding.actionKey == 'PERSISTENCE_LOAD') {
      this.restoreGame();
    } else if (actionBinding.actionKey == 'PERSISTENCE_NEW') {
      this.newGame();
    } else if (actionBinding.actionKey == 'CANCEL') {
      Game.switchUiMode(Game.UIMode.gamePlay);
    }
    return false;
  },
  saveGame: function () {
    if (this.localStorageAvailable()) {
      Game.DATASTORE.GAME_PLAY = Game.UIMode.gamePlay.attr;
      Game.DATASTORE.MESSAGES = Game.Message.attr;

      Game.DATASTORE.KEY_BINDING_SET = this._storedKeyBinding; // NOTE: not getting the key binding directly because it's set to 'persist when this ui mode is entered - the 'real' key binding is saved in _storedKeyBinding

      Game.DATASTORE.SCHEDULE = {};
      // NOTE: offsetting times by 1 so later restore can just drop them in and go
      Game.DATASTORE.SCHEDULE[Game.Scheduler._current.getId()] = 1;
      for (var i = 0; i < Game.Scheduler._queue._eventTimes.length; i++) {
        Game.DATASTORE.SCHEDULE[Game.Scheduler._queue._events[i].getId()] = Game.Scheduler._queue._eventTimes[i] + 1;
      }
      Game.DATASTORE.SCHEDULE_TIME = Game.Scheduler._queue.getTime() - 1; // offset by 1 so that when the engine is started after restore the queue state will match that as when it was saved

      window.localStorage.setItem(Game._PERSISTANCE_NAMESPACE, JSON.stringify(Game.DATASTORE));
      Game.Message.send('game saved');
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
          Game.DATASTORE.MAP[mapId] = new Game.Map(mapAttr._mapTileSetName,mapId);
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
      this._storedKeyBinding = state_data.KEY_BINDING_SET; // NOTE: not setting the key binding directly because it's set to _storedKeyBinding when this ui mode is exited

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

      Game.Message.send('game loaded');
      Game.switchUiMode(Game.UIMode.gamePlay);
      Game.KeyBinding.informPlayer();
    }
  },
  newGame: function () {
    Game.DATASTORE = {};
    Game.DATASTORE.MAP = {};
    Game.DATASTORE.ENTITY = {};
    Game.initializeTimingEngine();
    Game.setRandomSeed(5 + Math.floor(Game.TRANSIENT_RNG.getUniform()*100000));
    Game.UIMode.gamePlay.setupNewGame();
    Game.Message.send('new game started');
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
    return JSON.stringify(state);
  },
  BASE_fromJSON: function (json,state_hash_name) {
    var using_state_hash = 'attr';
    if (state_hash_name) {
      using_state_hash = state_hash_name;
    }
    this[using_state_hash] = JSON.parse(json);
  }
};

//#############################################################################
//#############################################################################

Game.UIMode.gameWin = {
  enter: function () {
    console.log('game winning');
  },
  exit: function () {
  },
  render: function (display) {
    display.drawText(1,1,Game.UIMode.DEFAULT_COLOR_STR+"You WON!!!!");
  },
  handleInput: function (inputType,inputData) {
    // console.log('gameStart inputType:');
    // console.dir(inputType);
    // console.log('gameStart inputData:');
    // console.dir(inputData);
    Game.Message.clear();
  }
};

//#############################################################################
//#############################################################################

Game.UIMode.gameLose = {
  enter: function () {
    console.log('game losing');
  },
  exit: function () {
  },
  render: function (display) {
    display.drawText(1,1,Game.UIMode.DEFAULT_COLOR_STR+"You lost :(");
  },
  handleInput: function (inputType,inputData) {
    // console.log('gameStart inputType:');
    // console.dir(inputType);
    // console.log('gameStart inputData:');
    // console.dir(inputData);
    Game.Message.clear();
  }
};

//#############################################################################
//#############################################################################

Game.UIMode.gamePlay = {
  attr: {
    _mapId: '',
    _avatarId: '',
    _cameraX: 100,
    _cameraY: 100
  },
  JSON_KEY: 'uiMode_gamePlay',
  enter: function () {
    // console.log('game playing');
    if (this.attr._avatarId) {
      this.setCameraToAvatar();
    }
    Game.TimeEngine.unlock();
    // Game.KeyBinding.informPlayer(); // NOTE: not sure one way or another if this should be here - eventual help system should obviate the need for this message...
    Game.refresh();
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
  },
  renderAvatarInfo: function (display) {
    display.drawText(1,2,Game.UIMode.DEFAULT_COLOR_STR+"avatar x: "+this.getAvatar().getX()); // DEV
    display.drawText(1,3,Game.UIMode.DEFAULT_COLOR_STR+"avatar y: "+this.getAvatar().getY()); // DEV
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
    // console.log(inputType);
    // console.dir(inputData);
    var actionBinding = Game.KeyBinding.getInputBinding(inputType,inputData);
    // console.log('action binding is');
    // console.dir(actionBinding);
    // console.log('----------');
    if ((! actionBinding) || (actionBinding.actionKey == 'CANCEL')) {
      return false;
    }

    var tookTurn = false;
    if        (actionBinding.actionKey == 'MOVE_UL') {
      tookTurn = this.moveAvatar(-1 ,-1);
    } else if (actionBinding.actionKey == 'MOVE_U') {
      tookTurn = this.moveAvatar(0  ,-1);
    } else if (actionBinding.actionKey == 'MOVE_UR') {
      tookTurn = this.moveAvatar(1  ,-1);
    } else if (actionBinding.actionKey == 'MOVE_L') {
      tookTurn = this.moveAvatar(-1  ,0);
    } else if (actionBinding.actionKey == 'MOVE_WAIT') {
      tookTurn = true;
    } else if (actionBinding.actionKey == 'MOVE_R') {
      tookTurn = this.moveAvatar(1  , 0);
    } else if (actionBinding.actionKey == 'MOVE_DL') {
      tookTurn = this.moveAvatar(-1  , 1);
    } else if (actionBinding.actionKey == 'MOVE_D') {
      tookTurn = this.moveAvatar(0  , 1);
    } else if (actionBinding.actionKey == 'MOVE_DR') {
      tookTurn = this.moveAvatar(1  , 1);
    }

    else if (actionBinding.actionKey   == 'CHANGE_BINDINGS') {
      Game.KeyBinding.swapToNextKeyBinding();
    } else if (actionBinding.actionKey == 'PERSISTENCE') {
      Game.switchUiMode(Game.UIMode.gamePersistence);
    }

    if (tookTurn) {
      this.getAvatar().raiseEntityEvent('actionDone');
      Game.Message.ageMessages();
      return true;
    }
    return false;
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

//#############################################################################
//#############################################################################

Game.UIMode.textReading = {
  _storedKeyBinding: '',
  _text: '',
  enter: function () {
    this._storedKeyBinding = Game.KeyBinding.getKeyBinding();
    Game.KeyBinding.setKeyBinding('textReading');
    Game.refresh();
    //console.log('game persistence');
  },
  exit: function () {
    Game.KeyBinding.setKeyBinding(this._storedKeyBinding);
    Game.refresh();
  },
  render: function (display) {
    var dims = Game.util.getDisplayDim(display);
    display.drawText(1,3,Game.UIMode.DEFAULT_COLOR_STR+"text is "+text, dims.w-2);
//    console.log('TODO: check whether local storage has a game before offering restore');
//    console.log('TODO: check whether a game is in progress before offering restore');
  },
  handleInput: function (inputType,inputData) {
    // console.log(inputType);
    // console.dir(inputData);
    var actionBinding = Game.KeyBinding.getInputBinding(inputType,inputData);
    // console.log('action binding is');
    // console.dir(actionBinding);
    // console.log('----------');
    if (! actionBinding) {
      return false;
    }
/*
    if        (actionBinding.actionKey == 'PERSISTENCE_SAVE') {
      this.saveGame();
    } else if (actionBinding.actionKey == 'PERSISTENCE_LOAD') {
      this.restoreGame();
    } else if (actionBinding.actionKey == 'PERSISTENCE_NEW') {
      this.newGame();
    } else if (actionBinding.actionKey == 'CANCEL') {
      Game.switchUiMode(Game.UIMode.gamePlay);
    }
    */
    return false;
  },
  getText: function () {
    return this._text;
  },
  setText: function (t) {
    this._text = t;
//    Game.renderDisplayMain();
  }
};
