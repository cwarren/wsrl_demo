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
    }
};

var Game = {

  DISPLAY_SPACING: 1.1,
  display: {
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

  init: function() {
    this._randomSeed = 5 + Math.floor(Math.random()*100000);
    //this._randomSeed = 76250;
    console.log("using random seed "+this._randomSeed);
    ROT.RNG.setSeed(this._randomSeed);

    for (var display_key in this.display) {
      if (this.display.hasOwnProperty(display_key)) {
        this.display[display_key].o = new ROT.Display({width: this.display[display_key].w, height: this.display[display_key].h, spacing: Game.DISPLAY_SPACING});
      }
    }
    this.renderDisplayAll();
  },

  getDisplay: function (displayId) {
    if (this.display.hasOwnProperty(displayId)) {
      return this.display[displayId].o;
    }
    return null;
  },

  renderDisplayAll: function() {
    this.renderDisplayAvatar();
    this.renderDisplayMain();
    this.renderDisplayMessage();
  },
  renderDisplayMain: function() {
    var d = this.display.main.o;
    d.drawText(1,1,"main display");
  },
  renderDisplayAvatar: function() {
    var d = this.display.avatar.o;
    d.drawText(1,1,"avatar display");
  },
  renderDisplayMessage: function() {
    var d = this.display.message.o;
    d.drawText(1,1,"message display");
  }

};
