Game.Generator = function(genName,constructorFunction, defaultTemplate) {
  this._name = genName;
  this._templates = {};
  this._constructorToUse = constructorFunction;

  this._templates._DEFAULT = defaultTemplate || {};
};

Game.Generator.prototype.learn = function (nameOfTemplate,template) {
  this._templates[nameOfTemplate] = template;
};

Game.Generator.prototype.create = function (nameOfTemplate) {
  var templateToUse = this._templates[nameOfTemplate];
  if (!templateToUse) { templateToUse = '_DEFAULT';  }
  return new this._constructorToUse(templateToUse);
};
