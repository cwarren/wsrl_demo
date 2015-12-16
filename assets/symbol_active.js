Game.SymbolActive = function(template) {
  template = template || {};
  Game.Symbol.call(this, template);
  this.attr._name = template.name || '';
  this.attr._id = template.presetId || Game.util.uniqueId();

};
Game.SymbolActive.extend(Game.Symbol);
