Game.ALL_ENTITIES = {};

Game.EntityTemplates = {};

Game.EntityTemplates.Avatar = {
  name: 'avatar',
  chr:'@',
  fg:'#dda',
  mixins: [Game.EntityMixin.WalkerCorporeal]
};
