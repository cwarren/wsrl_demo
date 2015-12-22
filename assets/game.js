window.onload = function() {
    //console.log("starting WSRL - window loaded");
    // Check if rot.js can work on this browser
    if (!ROT.isSupported()) {
        alert("The rot.js library isn't supported by your browser.");
    } else {
        // Initialize the game
        Game.init();

        // Add the containers to our HTML page
        document.getElementById('wsrl-avatar-display').appendChild(   Game.getDisplay('avatar').getContainer());
        document.getElementById('wsrl-main-display').appendChild(   Game.getDisplay('main').getContainer());
        document.getElementById('wsrl-message-display').appendChild(   Game.getDisplay('message').getContainer());

        Game.switchUiMode('gameStart');
    }
};

var Game = {
  _PERSISTANCE_NAMESPACE: 'wsrlgame',

  _DISPLAY_SPACING: 1.1,
  _display: {
    main: {
      w: 80,
      h: 24,
      o: null
    },
    avatar: {
      w: 20,
      h: 24,
      o: null
    },
    message: {
      w: 100,
      h: 6,
      o: null
    }
  },

  _game: null,
  _curUiMode: null,
  _uiModeNameStack: [],
  _randomSeed: 0,
  TRANSIENT_RNG: null,

  DATASTORE: {},

  DeadAvatar: null,

  Scheduler: null,
  TimeEngine: null,

  init: function() {
    this._game = this;

    this.TRANSIENT_RNG = ROT.RNG.clone();
    Game.setRandomSeed(5 + Math.floor(this.TRANSIENT_RNG.getUniform()*100000));

    //this.initializeTimingEngine();

    for (var display_key in this._display) {
      if (this._display.hasOwnProperty(display_key)) {
        this._display[display_key].o = new ROT.Display({width: this._display[display_key].w, height: this._display[display_key].h, spacing: Game._DISPLAY_SPACING});
      }
    }
    this.renderDisplayAll();

    var game = this;
    var bindEventToUiMode = function(event) {
        window.addEventListener(event, function(e) {
            // send event to the ui mode if there is one
            if (game.getCurUiMode() !== null) {
                game.getCurUiMode().handleInput(event, e);
            }
        });
    };
    // Bind keyboard input events
    bindEventToUiMode('keypress');
    bindEventToUiMode('keydown');
    // bindEventToUiMode('keyup');
  },

  initializeTimingEngine: function () {
    // NOTE: single, central timing system for now - might have to refactor this later to deal with mutliple map stuff
    Game.Scheduler = new ROT.Scheduler.Action();
    Game.TimeEngine = new ROT.Engine(Game.Scheduler);
  },

  getRandomSeed: function () {
    return this._randomSeed;
  },
  setRandomSeed: function (s) {
    this._randomSeed = s;
    console.log("using random seed "+this._randomSeed);
    this.DATASTORE[Game.UIMode.gamePersistence.RANDOM_SEED_KEY] = this._randomSeed;
    ROT.RNG.setSeed(this._randomSeed);
  },

  getDisplay: function (displayId) {
    if (this._display.hasOwnProperty(displayId)) {
      return this._display[displayId].o;
    }
    return null;
  },
  getDisplayHeight: function (displayId) {
    if (this._display.hasOwnProperty(displayId)) {
      return this._display[displayId].h;
    }
    return null;
  },

  refresh: function () {
    this.renderDisplayAll();
  },
  renderDisplayAll: function() {
    this.renderDisplayAvatar();
    this.renderDisplayMain();
    this.renderDisplayMessage();
  },
  renderDisplayAvatar: function() {
    this._display.avatar.o.clear();
    if (this.getCurUiMode() === null) {
      return;
    }
    if ('renderAvatarInfo' in this.getCurUiMode()) {
      this.getCurUiMode().renderAvatarInfo(this._display.avatar.o);
    }
  },
  renderDisplayMain: function() {
    this._display.main.o.clear();
    if (this.getCurUiMode() === null) {
      return;
    }
    if ('render' in this.getCurUiMode()) {
      this.getCurUiMode().render(this._display.main.o);
    }
  },
  renderDisplayMessage: function() {
    Game.Message.render(this._display.message.o);
  },
  hideDisplayMessage: function() {
    this._display.message.o.clear();
  },
  specialMessage: function(msg) {
    this._display.message.o.clear();
    this._display.message.o.drawText(1,1,'%c{#fff}%b{#000}'+msg,79);
  },

  eventHandler: function (eventType, evt) {
    // When an event is received have the current ui handle it
    if (this.getCurUiMode() !== null) {
        this.getCurUiMode().handleInput(eventType, evt);
    }
  },

  getAvatar: function () {
    return Game.UIMode.gamePlay.getAvatar();
  },

  getCurUiMode: function () {
    var uiModeName = this._uiModeNameStack[0];
    if (uiModeName) {
      return Game.UIMode[uiModeName];
    }
    return null;
  },
  getCurUiModeName: function () {
    var uiModeName = this._uiModeNameStack[0];
    if (uiModeName) {
      return uiModeName;
    }
    return null;
  },
  switchUiMode: function (newUiModeName) {
    if (newUiModeName.startsWith('LAYER_')) {
      console.log('cannot switchUiMode to layer '+newUiModeName);
      return;
    }
    var curMode = this.getCurUiMode();
    if (curMode !== null) {
      curMode.exit();
    }
    this._uiModeNameStack[0] = newUiModeName;
    var newMode = Game.UIMode[newUiModeName];
    if (newMode) {
      newMode.enter();
    }
    // this.renderDisplayAll();
  },
  addUiMode: function (newUiModeLayerName) {
    if (! newUiModeLayerName.startsWith('LAYER_')) {
      console.log('addUiMode not possible for non-layer '+newUiModeLayerName);
      return;
    }
    // var curMode = this.getCurUiMode();
    // if (curMode !== null) {
    //   curMode.exit();
    // }
    this._uiModeNameStack.unshift(newUiModeLayerName);
    var newMode = Game.UIMode[newUiModeLayerName];
    if (newMode) {
      newMode.enter();
    }
    // this.renderDisplayAll();
  },
  removeUiMode: function () {
    var curMode = this.getCurUiMode();
    if (curMode !== null) {
      curMode.exit();
    }
    this._uiModeNameStack.shift();
    // curMode = this.getCurUiMode();
    // if (curMode !== null) {
    //   curMode.enter();
    // }
    // this.renderDisplayAll();
  },
  removeUiModeAllLayers: function () {
    var curModeName = this.getCurUiModeName();
    while ((curModeName !== null) && curModeName.startsWith('LAYER_')) {
      var curMode = this.getCurUiMode();
      curMode.exit();
      this._uiModeNameStack.shift();
      curModeName = this.getCurUiModeName();
    }
    // curMode = this.getCurUiMode();
    // if (curMode !== null) {
    //   curMode.enter();
    // }
    // this.renderDisplayAll();
  }
};
