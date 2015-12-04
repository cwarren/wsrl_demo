Game.EntityGenerator = new Game.Generator('entities',Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr:'@',
  fg:'#dda',
  maxHp: 10,
  mixins: [Game.EntityMixin.PlayerActor, Game.EntityMixin.PlayerMessager, Game.EntityMixin.WalkerCorporeal, Game.EntityMixin.HitPoints, Game.EntityMixin.Chronicle, Game.EntityMixin.MeleeAttacker]
});

Game.EntityGenerator.learn({
  name: 'moss',
  chr:'%',
  fg:'#6b6',
  maxHp: 1,
  mixins: [Game.EntityMixin.HitPoints]
});

Game.EntityGenerator.learn({
  name: 'newt',
  chr:'~',
  fg:'#f98',
  maxHp: 2,
  mixins: [Game.EntityMixin.HitPoints, Game.EntityMixin.WanderActor, Game.EntityMixin.WalkerCorporeal]
});
