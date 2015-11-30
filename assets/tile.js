Game.Tile = function (name,symbol) {
  this.attr = {
    _sym: symbol,
    _name: name
  };
};

Game.Tile.prototype.getSymbol = function () {
  return this.attr._sym;
};
Game.Tile.prototype.getName = function () {
  return this.attr._name;
};
//-----------------------------------------------------------------------------

Game.Tile.nullTile = new Game.Tile('nullTile',new Game.Symbol());
Game.Tile.floorTile = new Game.Tile('floor',new Game.Symbol('.'));
Game.Tile.wallTile = new Game.Tile('wall',new Game.Symbol('#'));
