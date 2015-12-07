Game.EntityMixin = {};

// Mixins have a META property is is info about/for the mixin itself and then all other properties. The META property is NOT copied into objects for which this mixin is used - all other properies ARE copied in.

Game.EntityMixin.PlayerMessager = {
  META: {
    mixinName: 'PlayerMessager',
    mixinGroup: 'PlayerMessager',
    listeners: {
      'walkForbidden': function(evtData) {
        Game.Message.send('you can\'t walk into the '+evtData.target.getName());
        Game.renderDisplayMessage();
        Game.Message.ageMessages();
      },
      'dealtDamage': function(evtData) {
        Game.Message.send('you hit the '+evtData.damagee.getName()+' for '+evtData.damageAmount);
        Game.renderDisplayMessage();
      },
      'madeKill': function(evtData) {
        Game.Message.send('you killed the '+evtData.entKilled.getName());
        Game.renderDisplayMessage();
      },
      'damagedBy': function(evtData) {
        Game.Message.send('the '+evtData.damager.getName()+' hit you for '+evtData.damageAmount);
        Game.renderDisplayMessage();
      },
      'killed': function(evtData) {
        Game.Message.send('you were killed by the '+evtData.killedBy.getName());
        Game.renderDisplayMessage();
      }
    }
  }
//    Game.Message.send(msg);
};

Game.EntityMixin.PlayerActor = {
  META: {
    mixinName: 'PlayerActor',
    mixinGroup: 'Actor',
    stateNamespace: '_PlayerActor_attr',
    stateModel:  {
      baseActionDuration: 1000,
      actingState: false,
      currentActionDuration: 1000
    },
    init: function (template) {
      Game.Scheduler.add(this,true,1);
    },
    listeners: {
      'actionDone': function(evtData) {
        Game.Scheduler.setDuration(this.getCurrentActionDuration());
        this.setCurrentActionDuration(this.getBaseActionDuration());
        setTimeout(function() {Game.TimeEngine.unlock();},1); // NOTE: this tiny delay ensures console output happens in the right order, which in turn means I have confidence in the turn-taking order of the various entities
        // console.log("end player acting");
      }
    }
  },
  getBaseActionDuration: function () {
    return this.attr._PlayerActor_attr.baseActionDuration;
  },
  setBaseActionDuration: function (n) {
    this.attr._PlayerActor_attr.baseActionDuration = n;
  },
  getCurrentActionDuration: function () {
    return this.attr._PlayerActor_attr.currentActionDuration;
  },
  setCurrentActionDuration: function (n) {
    this.attr._PlayerActor_attr.currentActionDuration = n;
  },
  isActing: function (state) {
    if (state !== undefined) {
      this.attr._PlayerActor_attr.actingState = state;
    }
    return this.attr._PlayerActor_attr.actingState;
  },
  act: function () {
    // console.log("begin player acting");
    // console.log("player pre-lock engine lock state is "+Game.TimeEngine._lock);
    if (this.isActing()) { return; } // a gate to deal with JS timing issues
    this.isActing(true);
    Game.refresh();
    Game.TimeEngine.lock();
    // console.log("player post-lock engine lock state is "+Game.TimeEngine._lock);
    this.isActing(false);
  }
};

Game.EntityMixin.WalkerCorporeal = {
  META: {
    mixinName: 'WalkerCorporeal',
    mixinGroup: 'Walker'
  },
  tryWalk: function (map,dx,dy) {
    var targetX = Math.min(Math.max(0,this.getX() + dx),map.getWidth()-1);
    var targetY = Math.min(Math.max(0,this.getY() + dy),map.getHeight()-1);
    // console.log('tryWalk deltas: '+dx+','+dy+' '+this.getName());
    // console.log('tryWalk initial pos: '+this.getX()+','+this.getY()+' '+this.getName());
    // console.log('tryWalk: '+targetX+','+targetY+' '+this.getName());

    if (map.getEntity(targetX,targetY)) { // can't walk into spaces occupied by other entities
      // console.log('tryWalk - bump: '+this.getName());
      this.raiseEntityEvent('bumpEntity',{actor:this,recipient:map.getEntity(targetX,targetY)});
      // NOTE: should bumping an entity always take a turn? might have to get some return data from the event (once event return data is implemented)
      return true;
    }
    var targetTile = map.getTile(targetX,targetY);
    if (targetTile.isWalkable()) {
      // console.log('tryWalk - walkable: '+this.getName());
      this.setPos(targetX,targetY);
      var myMap = this.getMap();
      if (myMap) {
        // console.log('tryWalk - myMap.updateEntityLocation: '+this.getName());
        myMap.updateEntityLocation(this);
      }
      // console.log('tryWalk post movement pos: '+this.getX()+','+this.getY()+' '+this.getName());
      return true;
    } else {
      // console.log('tryWalk - walkForbidden: '+this.getName());
      this.raiseEntityEvent('walkForbidden',{target:targetTile});
    }
    return false;
  }
};



Game.EntityMixin.Chronicle = {
  META: {
    mixinName: 'Chronicle',
    mixinGroup: 'Chronicle',
    stateNamespace: '_Chronicle_attr',
    stateModel:  {
      turnCounter: 0,
      killLog:{},
      deathMessage:''
    },
    listeners: {
      'actionDone': function(evtData) {
        this.trackTurnCount();
      },
      'madeKill': function(evtData) {
        // console.log('chronicle kill');
        this.addKill(evtData.entKilled);
      },
      'killed': function(evtData) {
        this.attr._Chronicle_attr.deathMessage = 'killed by '+evtData.killedBy.getName();
      }
    }
  },
  trackTurnCount: function () {
    this.attr._Chronicle_attr.turnCounter++;
  },
  getTurns: function () {
    return this.attr._Chronicle_attr.turnCounter;
  },
  setTurns: function (n) {
    this.attr._Chronicle_attr.turnCounter = n;
  },
  getKills: function () {
    return this.attr._Chronicle_attr.killLog;
  },
  clearKills: function () {
    this.attr._Chronicle_attr.killLog = {};
  },
  addKill: function (entKilled) {
    var entName = entKilled.getName();
    // console.log('chronicle kill of '+entName);
    if (this.attr._Chronicle_attr.killLog[entName]) {
      this.attr._Chronicle_attr.killLog[entName]++;
    } else {
      this.attr._Chronicle_attr.killLog[entName] = 1;
    }
  }
};

Game.EntityMixin.HitPoints = {
  META: {
    mixinName: 'HitPoints',
    mixinGroup: 'HitPoints',
    stateNamespace: '_HitPoints_attr',
    stateModel:  {
      maxHp: 1,
      curHp: 1
    },
    init: function (template) {
      this.attr._HitPoints_attr.maxHp = template.maxHp || 1;
      this.attr._HitPoints_attr.curHp = template.curHp || this.attr._HitPoints_attr.maxHp;
    },
    listeners: {
      'attacked': function(evtData) {
        // console.log('HitPoints attacked');

        this.takeHits(evtData.attackPower);
        this.raiseEntityEvent('damagedBy',{damager:evtData.attacker,damageAmount:evtData.attackPower});
        evtData.attacker.raiseEntityEvent('dealtDamage',{damagee:this,damageAmount:evtData.attackPower});
        if (this.getCurHp() <= 0) {
          this.raiseEntityEvent('killed',{entKilled: this, killedBy: evtData.attacker});
          evtData.attacker.raiseEntityEvent('madeKill',{entKilled: this, killedBy: evtData.attacker});
        }
      },
      'killed': function(evtData) {
        // console.log('HitPoints killed');
        this.destroy();
      }
    }
  },
  getMaxHp: function () {
    return this.attr._HitPoints_attr.maxHp;
  },
  setMaxHp: function (n) {
    this.attr._HitPoints_attr.maxHp = n;
  },
  getCurHp: function () {
    return this.attr._HitPoints_attr.curHp;
  },
  setCurHp: function (n) {
    this.attr._HitPoints_attr.curHp = n;
  },
  takeHits: function (amt) {
    this.attr._HitPoints_attr.curHp -= amt;
  },
  recoverHits: function (amt) {
    this.attr._HitPoints_attr.curHp = Math.min(this.attr._HitPoints_attr.curHp+amt,this.attr._HitPoints_attr.maxHp);
  }
};

Game.EntityMixin.MeleeAttacker = {
  META: {
    mixinName: 'MeleeAttacker',
    mixinGroup: 'Attacker',
    stateNamespace: '_MeleeAttacker_attr',
    stateModel:  {
      attackPower: 1
    },
    init: function (template) {
      this.attr._MeleeAttacker_attr.attackPower = template.attackPower || 1;
    },
    listeners: {
      'bumpEntity': function(evtData) {
        // console.log('MeleeAttacker bumpEntity');
        evtData.recipient.raiseEntityEvent('attacked',{attacker:evtData.actor,attackPower:this.getAttackPower()});
      }
    }
  },
  getAttackPower: function () {
    return this.attr._MeleeAttacker_attr.attackPower;
  }
};

//#############################################################################
// ENTITY ACTORS / AI

Game.EntityMixin.WanderActor = {
  META: {
    mixinName: 'WanderActor',
    mixinGroup: 'Actor',
    stateNamespace: '_WanderActor_attr',
    stateModel:  {
      baseActionDuration: 1000,
      currentActionDuration: 1000
    },
    init: function (template) {
      Game.Scheduler.add(this,true, Game.util.randomInt(2,this.getBaseActionDuration()));
    }
  },
  getBaseActionDuration: function () {
    return this.attr._WanderActor_attr.baseActionDuration;
  },
  setBaseActionDuration: function (n) {
    this.attr._WanderActor_attr.baseActionDuration = n;
  },
  getCurrentActionDuration: function () {
    return this.attr._WanderActor_attr.currentActionDuration;
  },
  setCurrentActionDuration: function (n) {
    this.attr._WanderActor_attr.currentActionDuration = n;
  },
  getMoveDeltas: function () {
    return Game.util.positionsAdjacentTo({x:0,y:0}).random();
  },
  act: function () {
    Game.TimeEngine.lock();
    // console.log("begin wander acting");
    // console.log('wander for '+this.getName());
    var moveDeltas = this.getMoveDeltas();
    if (this.hasMixin('Walker')) { // NOTE: this pattern suggests that maybe tryWalk shoudl be converted to an event
      // console.log('trying to walk to '+moveDeltas.x+','+moveDeltas.y);
      this.tryWalk(this.getMap(), moveDeltas.x, moveDeltas.y);
    }
    Game.Scheduler.setDuration(this.getCurrentActionDuration());
    this.setCurrentActionDuration(this.getBaseActionDuration());
    this.raiseEntityEvent('actionDone');
    // console.log("end wander acting");
    Game.TimeEngine.unlock();
  }
};
