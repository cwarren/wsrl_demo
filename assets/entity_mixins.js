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
        Game.Message.ageMessages();
      },
      'killed': function(evtData) {
        Game.Message.send('you were killed by the '+evtData.killedBy.getName());
        Game.renderDisplayMessage();
        Game.Message.ageMessages();
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
        this.setCurrentActionDuration(this.getBaseActionDuration()+Game.util.randomInt(-5,5));
        setTimeout(function() {Game.TimeEngine.unlock();},1); // NOTE: this tiny delay ensures console output happens in the right order, which in turn means I have confidence in the turn-taking order of the various entities
        Game.renderDisplayMessage();
        // console.log("end player acting");
      },
      'killed': function(evtData) {
        //Game.TimeEngine.lock();
        Game.switchUiMode("gameLose");
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
    //Game.refresh();
    Game.renderDisplayMain();
    Game.renderDisplayAvatar();
    Game.TimeEngine.lock();
    // console.log("player post-lock engine lock state is "+Game.TimeEngine._lock);
    this.isActing(false);
  }
};

Game.EntityMixin.WalkerCorporeal = {
  META: {
    mixinName: 'WalkerCorporeal',
    mixinGroup: 'Walker',
    listeners: {
      'adjacentMove': function(evtData) {
          // console.log('listener adjacentMove');
          // console.dir(JSON.parse(JSON.stringify(evtData)));
          var map = this.getMap();
          var dx=evtData.dx,dy=evtData.dy;
          // var targetX = Math.min(Math.max(0,this.getX() + dx),map.getWidth()-1);
          // var targetY = Math.min(Math.max(0,this.getY() + dy),map.getHeight()-1);
          var targetX = this.getX() + dx;
          var targetY = this.getY() + dy;
          if ((targetX < 0) || (targetX >= map.getWidth()) || (targetY < 0) || (targetY >= map.getHeight())) {
            this.raiseEntityEvent('walkForbidden',{target:Game.Tile.nullTile});
            return {madeAdjacentMove:false};
          }

          if (map.getEntity(targetX,targetY)) { // can't walk into spaces occupied by other entities
            this.raiseEntityEvent('bumpEntity',{actor:this,recipient:map.getEntity(targetX,targetY)});
            // NOTE: should bumping an entity always take a turn? might have to get some return data from the event (once event return data is implemented)
            return {madeAdjacentMove:true};
          }
          var targetTile = map.getTile(targetX,targetY);
          if (targetTile.isWalkable()) {
            this.setPos(targetX,targetY);
            var myMap = this.getMap();
            if (myMap) {
              myMap.updateEntityLocation(this);
            }
            return {madeAdjacentMove:true};
          } else {
            this.raiseEntityEvent('walkForbidden',{target:targetTile});
          }
          return {madeAdjacentMove:false};
      }
    }
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
      attackPower: 1,
      attackActionDuration: 1000
    },
    init: function (template) {
      this.attr._MeleeAttacker_attr.attackPower = template.attackPower || 1;
      this.attr._MeleeAttacker_attr.attackActionDuration = template.attackActionDuration || 1000;
    },
    listeners: {
      'bumpEntity': function(evtData) {
        // console.log('MeleeAttacker bumpEntity');
        evtData.recipient.raiseEntityEvent('attacked',{attacker:evtData.actor,attackPower:this.getAttackPower()});
        this.setCurrentActionDuration(this.attr._MeleeAttacker_attr.attackActionDuration);
      }
    }
  },
  getAttackPower: function () {
    return this.attr._MeleeAttacker_attr.attackPower;
  }
};

Game.EntityMixin.Sight = {
  META: {
    mixinName: 'Sight',
    mixinGroup: 'Sense',
    stateNamespace: '_Sight_attr',
    stateModel:  {
      sightRadius: 3
    },
    init: function (template) {
      this.attr._Sight_attr.sightRadius = template.sightRadius || 3;
    },
    listeners: {
      'senseForEntity': function(evtData) {
        // console.log('Sight lookForEntity');
        return {entitySensed:this.canSeeEntity(evtData.senseForEntity)};
      }
    }
  },
  getSightRadius: function () {
    return this.attr._Sight_attr.sightRadius;
  },
  setSightRadius: function (n) {
    this.attr._Sight_attr.sightRadius = n;
  },

  canSeeEntity: function(entity) {
      // If not on the same map or on different maps, then exit early
      if (!entity || this.getMapId() !== entity.getMapId()) {
          return false;
      }
      return this.canSeeCoord(entity.getX(),entity.getY());
  },
  canSeeCoord: function(x_or_pos,y) {
    var otherX = x_or_pos,otherY=y;
    if (typeof x_or_pos == 'object') {
      otherX = x_or_pos.x;
      otherY = x_or_pos.y;
    }

    // If we're not within the sight radius, then we won't be in a real field of view either.
    if (Math.max(Math.abs(otherX - this.getX()),Math.abs(otherY - this.getY())) > this.attr._Sight_attr.sightRadius) {
      return false;
    }

    var inFov = this.getVisibleCells();
    return inFov[otherX+','+otherY] || false;
  },
  getVisibleCells: function() {
      var visibleCells = {'byDistance':{}};
      for (var i=0;i<=this.getSightRadius();i++) {
          visibleCells.byDistance[i] = {};
      }
      this.getMap().getFov().compute(
          this.getX(), this.getY(),
          this.getSightRadius(),
          function(x, y, radius, visibility) {
              visibleCells[x+','+y] = true;
              visibleCells.byDistance[radius][x+','+y] = true;
          }
      );
      return visibleCells;
  },
  canSeeCoord_delta: function(dx,dy) {
      return this.canSeeCoord(this.getX()+dx,this.getY()+dy);
  }
};


Game.EntityMixin.MapMemory = {
  META: {
    mixinName: 'MapMemory',
    mixinGroup: 'MapMemory',
    stateNamespace: '_MapMemory_attr',
    stateModel:  {
      mapsHash: {}
    },
    init: function (template) {
      this.attr._MapMemory_attr.mapsHash = template.mapsHash || {};
    }
  },
  rememberCoords: function (coordSet,mapId) {
    var mapKey=mapId || this.getMapId();
    if (! this.attr._MapMemory_attr.mapsHash[mapKey]) {
      this.attr._MapMemory_attr.mapsHash[mapKey] = {};
    }
    for (var coord in coordSet) {
      if (coordSet.hasOwnProperty(coord) && (coord != 'byDistance')) {
        this.attr._MapMemory_attr.mapsHash[mapKey][coord] = true;
      }
    }
  },
  getRememberedCoordsForMap: function (mapId) {
    var mapKey=mapId || this.getMapId();
    return this.attr._MapMemory_attr.mapsHash[mapKey] || {};
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
      this.attr._WanderActor_attr.baseActionDuration = template.wanderActionDuration || 1000;
      this.attr._WanderActor_attr.currentActionDuration = this.attr._WanderActor_attr.baseActionDuration;
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
    this.raiseEntityEvent('adjacentMove',{dx:moveDeltas.x,dy:moveDeltas.y});
    Game.Scheduler.setDuration(this.getCurrentActionDuration());
    this.setCurrentActionDuration(this.getBaseActionDuration()+Game.util.randomInt(-10,10));
    this.raiseEntityEvent('actionDone');
    // console.log("end wander acting");
    Game.TimeEngine.unlock();
  }
};

// NOTE: could be a good route to extract the move chooser into a separate mixin - that's left as an exercise for the reader....
Game.EntityMixin.WanderChaserActor = {
  META: {
    mixinName: 'WanderChaserActor',
    mixinGroup: 'Actor',
    stateNamespace: '_WanderChaserActor_attr',
    stateModel:  {
      baseActionDuration: 1000,
      currentActionDuration: 1000
    },
    init: function (template) {
      Game.Scheduler.add(this,true, Game.util.randomInt(2,this.getBaseActionDuration()));
      this.attr._WanderChaserActor_attr.baseActionDuration = template.wanderChaserActionDuration || 1000;
      this.attr._WanderChaserActor_attr.currentActionDuration = this.attr._WanderChaserActor_attr.baseActionDuration;
    }
  },
  getBaseActionDuration: function () {
    return this.attr._WanderChaserActor_attr.baseActionDuration;
  },
  setBaseActionDuration: function (n) {
    this.attr._WanderChaserActor_attr.baseActionDuration = n;
  },
  getCurrentActionDuration: function () {
    return this.attr._WanderChaserActor_attr.currentActionDuration;
  },
  setCurrentActionDuration: function (n) {
    this.attr._WanderChaserActor_attr.currentActionDuration = n;
  },
  getMoveDeltas: function () {
    var avatar = Game.getAvatar();
    var senseResp = this.raiseEntityEvent('senseForEntity',{senseForEntity:avatar});
    if (Game.util.compactBooleanArray_or(senseResp.entitySensed)) {

      // build a path instance for the avatar
      var source = this;
      var map = this.getMap();
      var path = new ROT.Path.AStar(avatar.getX(), avatar.getY(), function(x, y) {
          // If an entity is present at the tile, can't move there.
          var entity = map.getEntity(x, y);
          if (entity && entity !== avatar && entity !== source) {
              return false;
          }
          return map.getTile(x, y).isWalkable();
      }, {topology: 8});

      // compute the path from here to there
      var count = 0;
      var moveDeltas = {x:0,y:0};
      path.compute(this.getX(), this.getY(), function(x, y) {
          if (count == 1) {
              moveDeltas.x = x - source.getX();
              moveDeltas.y = y - source.getY();
          }
          count++;
      });

      return moveDeltas;
    }
    return Game.util.positionsAdjacentTo({x:0,y:0}).random();
  },
  act: function () {
    Game.TimeEngine.lock();
    // console.log("begin wander acting");
    // console.log('wander for '+this.getName());
    var moveDeltas = this.getMoveDeltas();
    this.raiseEntityEvent('adjacentMove',{dx:moveDeltas.x,dy:moveDeltas.y});
    Game.Scheduler.setDuration(this.getCurrentActionDuration());
    this.setCurrentActionDuration(this.getBaseActionDuration()+Game.util.randomInt(-10,10));
    this.raiseEntityEvent('actionDone');
    // console.log("end wander acting");
    Game.TimeEngine.unlock();
  }
};
