Game.Entity = function(properties) {
    properties = properties || {};
    Game.Symbol.call(this, properties);
    if (! ('attr' in this)) { this.attr = {}; }
    this.attr._name = properties.name || '';
    this.attr._x = properties.x || 0;
    this.attr._y = properties.y || 0;

    this._entityID = Game.util.randomString(32);
    Game.ALL_ENTITIES[this._entityID] = this;
};
Game.Entity.extend(Game.Symbol);

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
