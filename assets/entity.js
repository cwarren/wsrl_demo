Game.Entity = function(template) {
    template = template || {};
    Game.Symbol.call(this, template);
    if (! ('attr' in this)) { this.attr = {}; }
    this.attr._name = template.name || '';
    this.attr._x = template.x || 0;
    this.attr._y = template.y || 0;

    this._entityID = Game.util.randomString(32);
    Game.ALL_ENTITIES[this._entityID] = this;

    // mixin sutff
    // track mixins and groups, copy over non-META properties, and run the mixin init if it exists
    this._mixinTracker = {};
    // console.dir(template);
    // console.dir(template.mixins);
    if (template.hasOwnProperty('mixins')) {
      for (var i = 0; i < template.mixins.length; i++) {
        var mixin = template.mixins[i];
        // console.dir(mixin);
        this._mixinTracker[mixin.META.mixinName] = true;
        this._mixinTracker[mixin.META.mixinGroup] = true;
        for (var mixinProp in mixinProp != 'META' && mixin) {
          if (mixinProp != 'META' && mixin.hasOwnProperty(mixinProp)) {
            this[mixinProp] = mixin[mixinProp];
          }
        }
        if (mixin.META.hasOwnProperty('init')) {
          mixin.META.init.call(this,template);
        }
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

Game.Entity.prototype.getName = function() {
    return this.attr._name;
};
Game.Entity.prototype.setName = function(name) {
    this.attr._name = name;
};
Game.Entity.prototype.setPos = function(x,y) {
  this.attr._x = x;
  this.attr._y = y;
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
  var json = {};
  for (var at in this.attr) {
    if (this.attr.hasOwnProperty(at)) {
      if (this.attr[at] instanceof Object && 'toJSON' in this.attr[at]) {
        json[at] = this.attr[at].toJSON();
      } else {
        json[at] = this.attr[at];
      }
    }
  }
  return json;
};
Game.Entity.prototype.fromJSON = function (json) {
  for (var at in this.attr) {
    if (this.attr.hasOwnProperty(at)) {
      if (this.attr[at] instanceof Object && 'fromJSON' in this.attr[at]) {
        this.attr[at].fromJSON(json[at]);
      } else {
        this.attr[at] = json[at];
      }
    }
  }
};
