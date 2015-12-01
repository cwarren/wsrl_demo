Game.EntityMixin = {};

/* Mixins have a META property is is info about/for the mixin itself (usually just a name, group, and possibly an init function) and then all other properties. The META property is NOT copied into objects for which this mixin is used - all other properies ARE copied in */

Game.EntityMixin.WalkerCorporeal = {
  META: {
    mixinName: 'WalkerCorporeal',
    mixinGroup: 'Walker'
  },
  tryWalk: function (map,dx,dy) {
    var targetX = Math.min(Math.max(0,this.getX() + dx),map.getWidth());
    var targetY = Math.min(Math.max(0,this.getY() + dy),map.getHeight());
    if (map.getTile(targetX,targetY).isWalkable()) {
      this.setPos(targetX,targetY);
      return true;
    }
    return false;
  }
};
