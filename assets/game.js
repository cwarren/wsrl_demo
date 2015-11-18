console.log("hello?");

window.onload = function() {
    console.log("starting WSRL - window loaded");
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

        var bindEventToScreen = function(eventType) {
            window.addEventListener(eventType, function(evt) {
              Game.eventHandler(eventType, evt);
            });
        };
        // Bind keyboard input events
        bindEventToScreen('keypress');
        bindEventToScreen('keydown');
//        bindEventToScreen('keyup');

        Game.switchUiMode(Game.UIMode.gameStart);
    }
};

var Game = {

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

  _curUiMode: null,

  init: function() {
    this._randomSeed = 5 + Math.floor(Math.random()*100000);
    //this._randomSeed = 76250;
    console.log("using random seed "+this._randomSeed);
    ROT.RNG.setSeed(this._randomSeed);

    for (var display_key in this._display) {
      if (this._display.hasOwnProperty(display_key)) {
        this._display[display_key].o = new ROT.Display({width: this._display[display_key].w, height: this._display[display_key].h, spacing: Game._DISPLAY_SPACING});
      }
    }
    this.renderDisplayAll();
  },

  getDisplay: function (displayId) {
    if (this._display.hasOwnProperty(displayId)) {
      return this._display[displayId].o;
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
    if (this._curUiMode === null) {
      return;
    }
    if (this._curUiMode.hasOwnProperty('renderAvatar')) {
      this._curUiMode.renderAvatar(this._display.avatar.o);
    }
  },
  renderDisplayMain: function() {
    this._display.main.o.clear();
    if (this._curUiMode === null) {
      return;
    }
    if (this._curUiMode.hasOwnProperty('render')) {
      this._curUiMode.render(this._display.main.o);
    }
  },
  renderDisplayMessage: function() {
    Game.Message.render(this._display.message.o);
  },

  eventHandler: function (eventType, evt) {
    // When an event is received have the current ui handle it
    if (this._curUiMode !== null) {
        this._curUiMode.handleInput(eventType, evt);
        Game.refresh();
    }
  },

  switchUiMode: function (newUiMode) {
    if (this._curUiMode !== null) {
      this._curUiMode.exit();
    }
    this._curUiMode = newUiMode;
    if (this._curUiMode !== null) {
      this._curUiMode.enter();
    }
    this.renderDisplayAll();
  }
};
