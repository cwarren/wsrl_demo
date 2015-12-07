Game.DATASTORE.ENTITY = {};

Game.Entity = function(template) {
    template = template || {};
    // console.log("creating entity using template");
    // console.dir(template);
    Game.Symbol.call(this, template);
    if (! ('attr' in this)) { this.attr = {}; }
    this.attr._name = template.name || '';
    this.attr._x = template.x || 0;
    this.attr._y = template.y || 0;
    this.attr._generator_template_key = template.generator_template_key || '';
    this.attr._mapId = null;

    this.attr._id = template.presetId || Game.util.randomString(32);
    Game.DATASTORE.ENTITY[this.attr._id] = this;

    // mixin sutff
    // track mixins and groups, copy over non-META properties, and run the mixin init if it exists
    this._mixinNames = template.mixins || [];
    this._mixins = [];
    for (var i = 0; i < this._mixinNames.length; i++) {
      this._mixins.push(Game.EntityMixin[this._mixinNames[i]]);
    }
    this._mixinTracker = {};
    // console.dir(template);
    // console.dir(template.mixins);
    // console.dir(this._mixins);
    for (var mi = 0; mi < this._mixins.length; mi++) {
      var mixin = this._mixins[mi];
      // console.dir(mixin);
      this._mixinTracker[mixin.META.mixinName] = true;
      this._mixinTracker[mixin.META.mixinGroup] = true;
      for (var mixinProp in mixin) {
        // console.log("checking mixin prop "+mixinProp);
        if (mixinProp != 'META' && mixin.hasOwnProperty(mixinProp)) {
          this[mixinProp] = mixin[mixinProp];
        }
      }
      if (mixin.META.hasOwnProperty('stateNamespace')) {
        this.attr[mixin.META.stateNamespace] = {};
        for (var mixinStateProp in mixin.META.stateModel) {
          if (mixin.META.stateModel.hasOwnProperty(mixinStateProp)) {
            if (typeof mixin.META.stateModel[mixinStateProp] == 'object') {
              this.attr[mixin.META.stateNamespace][mixinStateProp] = JSON.parse(JSON.stringify(mixin.META.stateModel[mixinStateProp]));
            } else {
              this.attr[mixin.META.stateNamespace][mixinStateProp] = mixin.META.stateModel[mixinStateProp];
            }
          }
        }
      }
      if (mixin.META.hasOwnProperty('init')) {
        mixin.META.init.call(this,template);
      }
    }
};
Game.Entity.extend(Game.Symbol);

Game.Entity.prototype.hasMixin = function(checkThis) {
    if (typeof checkThis == 'object') {
      return this._mixinTracker.hasOwnProperty(checkThis.META.mixinName);
    } else {
      return this._mixinTracker.hasOwnProperty(checkThis);
    }
};

Game.Entity.prototype.raiseEntityEvent = function(evtLabel,evtData) {
  for (var i = 0; i < this._mixins.length; i++) {
    var mixin = this._mixins[i];
    if (mixin.META.listeners && mixin.META.listeners[evtLabel]) {
      mixin.META.listeners[evtLabel].call(this,evtData);
    }
  }
};

Game.Entity.prototype.destroy = function() {
    //remove from map
    this.getMap().extractEntity(this);
    //remove from datastore
    Game.DATASTORE.ENTITY[this.getId()] = undefined;
};

Game.Entity.prototype.getId = function() {
    return this.attr._id;
};

Game.Entity.prototype.getMap = function() {
    return Game.DATASTORE.MAP[this.attr._mapId];
};
Game.Entity.prototype.setMap = function(map) {
    this.attr._mapId = map.getId();
};

Game.Entity.prototype.getName = function() {
    return this.attr._name;
};
Game.Entity.prototype.setName = function(name) {
    this.attr._name = name;
};
Game.Entity.prototype.setPos = function(x_or_xy,y) {
  if (typeof x_or_xy == 'object') {
    this.attr._x = x_or_xy.x;
    this.attr._y = x_or_xy.y;
  } else {
    this.attr._x = x_or_xy;
    this.attr._y = y;
  }
};
Game.Entity.prototype.getPos = function () {
  return {x:this.attr._x,y:this.attr._y};
};
Game.Entity.prototype.getX = function() {
    return this.attr._x;
};
Game.Entity.prototype.setX = function(x) {
    this.attr._x = x;
};
Game.Entity.prototype.setY = function(y) {
    this.attr._y = y;
};
Game.Entity.prototype.getY   = function() {
    return this.attr._y;
};

Game.Entity.prototype.toJSON = function () {
  var json = Game.UIMode.gamePersistence.BASE_toJSON.call(this);
  return json;
};
Game.Entity.prototype.fromJSON = function (json) {
  Game.UIMode.gamePersistence.BASE_fromJSON.call(this,json);
};
