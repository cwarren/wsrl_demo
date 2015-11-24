Game.Tile = function (symbol) {
  this.attr = {
    _sym: symbol
  };
};

Game.Tile.prototype.getSymbol = function () {
  return this.attr._sym;
};

//-----------------------------------------------------------------------------

Game.Tile.nullTile = new Game.Tile(new Game.Symbol());
Game.Tile.floorTile = new Game.Tile(new Game.Symbol('.'));
Game.Tile.wallTile = new Game.Tile(new Game.Symbol('#'));
