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
      if (this.hasMixin('Chronicle')) { // NOTE: this is sub-optimal because it couple this mixin to the Chronicle one (i.e. this needs to know the Chronicle function to call) - the event system will solve this issue
        this.trackTurn();
      }
      return true;
    }
    return false;
  }
};

Game.EntityMixin.Chronicle = {
  META: {
    mixinName: 'Chronicle',
    mixinGroup: 'Chronicle'
  },
  _Chronicle_attr: {
    turnCounter: 0
  },
  trackTurn: function () {
    this._Chronicle_attr.turnCounter++;
  },
  getTurns: function () {
    return this._Chronicle_attr.turnCounter;
  },
  setTurns: function (n) {
    this._Chronicle_attr.turnCounter = n;
  }
};

Game.EntityMixin.HitPoints = {
  META: {
    mixinName: 'HitPoints',
    mixinGroup: 'HitPoints',
    init: function (template) {
      this._HitPoints_attr.maxHp = template.maxHp || 1;
      this._HitPoints_attr.curHp = template.curHp || this._HitPoints_attr.maxHp;
    }
  },
  _HitPoints_attr: {
    maxHp: 1,
    curHp: 1
  },
  getMaxHp: function () {
    return this._HitPoints_attr.maxHp;
  },
  setMaxHp: function (n) {
    this._HitPoints_attr.maxHp = n;
  },
  getCurHp: function () {
    return this._HitPoints_attr.curHp;
  },
  setCurHp: function (n) {
    this._HitPoints_attr.curHp = n;
  },
  takeHits: function (amt) {
    this._HitPoints_attr.curHp -= amt;
  },
  recoverHits: function (amt) {
    this._HitPoints_attr.curHp = Math.min(this._HitPoints_attr.curHp+amt,this._HitPoints_attr.maxHp);
  }
};
