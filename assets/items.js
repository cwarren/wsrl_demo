Game.ItemGenerator = new Game.Generator('items',Game.Item);

Game.ItemGenerator.learn({name:'_inventoryContainer',mixins: ["Container"]});

Game.ItemGenerator.learn({
  name: 'rock',
  chr:String.fromCharCode(174),
  fg:'#bbc'
});
