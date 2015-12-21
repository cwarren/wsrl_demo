Game.ItemGenerator = new Game.Generator('items',Game.Item);

Game.ItemGenerator.learn({name:'_inventoryContainer',mixins: ["Container"]});

Game.ItemGenerator.learn({
  name: 'rock',
  description: 'a generic lump of hard mineral',
  chr:String.fromCharCode(174),
  fg:'#bbc'
});
