Game.ALL_ENTITIES = {};

Game.EntityTemplates = {};

Game.EntityTemplates.Avatar = {
  name: 'avatar',
  chr:'@',
  fg:'#dda',
  maxHp: 10,
  mixins: [Game.EntityMixin.WalkerCorporeal,Game.EntityMixin.HitPoints,Game.EntityMixin.Chronicle]
};
