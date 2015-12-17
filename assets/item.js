Game.DATASTORE.ITEM = {};

Game.Item = function(template) {
    template = template || {};
    // console.log("creating entity using template");
    // Game.util.cdebug(template);
    this._mixinSet = Game.ItemMixin;
    Game.SymbolActive.call(this, template);
    this.attr._generator_template_key = template.generator_template_key || '';

    Game.DATASTORE.ITEM[this.attr._id] = this;
};
Game.Item.extend(Game.SymbolActive);
