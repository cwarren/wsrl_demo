Game.EntityGenerator = new Game.Generator('entities',Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  description: 'our Hero!',
  chr:'@',
  fg:'#dda',
  sightRadius: 5,
  maxHp: 10,
  attackAvoid: 1,
  attackDamage: 2,
  inventoryCapacity: 35,
  maxFood: 400,
  mixins: ["PlayerActor", "PlayerMessager", "WalkerCorporeal", "Sight", "MapMemory", "HitPoints", "Chronicle", "MeleeAttacker", "MeleeDefender","InventoryHolder","FoodConsumer"]
});

Game.EntityGenerator.learn({
  name: 'moss',
  description: 'A large ground-covering patch of soft, fuzzy plantlife',
  chr:'%',
  fg:'#6b6',
  maxHp: 1,
  mixins: ["HitPoints"]
});

Game.EntityGenerator.learn({
  name: 'newt',
  description: 'It is small, wriggly, and moist. ',
  chr:'~',
  fg:'#f98',
  maxHp: 2,
  mixins: ["HitPoints", "WanderActor", "WalkerCorporeal"]
});

Game.EntityGenerator.learn({
  name: 'angry squirrel',
  description: "It is very upset that it can't find its nuts, it will attack if you get in its way",
  chr:String.fromCharCode(163),
  fg:'#aaa',
  maxHp: 2,
  attackPower: 1,
  attackAvoid: 2,
  damageMitigation: 1,
  mixins: ["HitPoints", "WanderActor", "WalkerCorporeal", "MeleeAttacker","MeleeDefender"]
});

Game.EntityGenerator.learn({
  name: 'attack slug',
  description: 'Beware the rage of this highly trained land-mollusk.',
  chr:'~',
  fg:'#ff9',
  maxHp: 4,
  sightRadius: 4,
  attackPower: 1,
  wanderChaserActionDuration: 1200,
  attackActionDuration: 3000,
  mixins: ["HitPoints", "Sight", "WanderChaserActor", "WalkerCorporeal", "MeleeAttacker"]
});
