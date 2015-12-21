Game.ItemMixin = {};

Game.ItemMixin.Food = {
  META: {
    mixinName: 'Food',
    mixinGroup: 'Food',
    stateNamespace: '_Food_attr',
    stateModel:  {
      foodValue: 500
    },
    init: function (template) {
      this.attr._Food_attr.foodValue = template.foodValue || 500;
    },
    listeners: {
      'getStatsForDisplay': function(evtData) {
        return {'food value':this.getFoodValue()};
      }
    }
  },
  getFoodValue: function () {
    return this.attr._Food_attr.foodValue;
  },
  setFoodValue: function (v) {
    this.attr._Food_attr.foodValue = v;
  }
};

Game.ItemMixin.Container = {
  META: {
    mixinName: 'Container',
    mixinGroup: 'Container',
    stateNamespace: '_Container_attr',
    stateModel:  {
      itemIds: [],
      capacity: 1
    },
    init: function (template) {
      this.attr._Container_attr.itemIds   = template.itemIds || [];
      this.attr._Container_attr.capacity = template.capacity || 1;
    }
  },
  getCapacity: function () {
    return this.attr._Container_attr.capacity ;
  },
  setCapacity: function (c) {
    this.attr._Container_attr.capacity = c;
  },
  hasSpace: function () {
    return this.attr._Container_attr.capacity > this.attr._Container_attr.itemIds.length;
    // NOTE: early dev stuff here! simple placeholder functionality....
    // return this.attr._Container_attr.itemId === '';
  },
  addItems: function (items_or_ids) {
    var addItemStatus = {
      numItemsAdded:0,
      numItemsNotAdded:items_or_ids.length
    };
    if (items_or_ids.length < 1) {
      return addItemStatus;
    }

    for (var i = 0; i < items_or_ids.length; i++) {
      if (! this.hasSpace()) {
        if (i === 0) {
          return addItemStatus;
        } else {
          return addItemStatus;
        }
      }
      var itemId = items_or_ids[i];
      if (typeof itemId !== 'string') {
        itemId = itemId.getId();
      }
      this._forceAddItemId(itemId);
      addItemStatus.numItemsAdded++;
      addItemStatus.numItemsNotAdded--;
    }

    return addItemStatus;
  },
  _forceAddItemId: function (itemId) {
    this.attr._Container_attr.itemIds.push(itemId);
  },
  getItemIds: function () {
    return this.attr._Container_attr.itemIds;
  },
  extractItems: function (ids_or_idxs) {
    var idsOnly = JSON.parse(JSON.stringify(ids_or_idxs)); // clone so we're not accidentally mucking with the param array with is passed by reference
    // first convert indexes to ids - uniformity makes the rest of this easier
    // doing this in two passes so itemIds doesn't change mid-loop
    for (var i = 0; i < idsOnly.length; i++) {
      if (! isNaN(idsOnly[i])) {
        idsOnly[i] = this.attr._Container_attr.itemIds[idsOnly[i]];
      }
    }
    var ret = [];
    while (idsOnly.length > 0) {
      var curId = idsOnly.shift();
      var idIdx = this.attr._Container_attr.itemIds.indexOf(curId);
      if (idIdx > -1) {
        this.attr._Container_attr.itemIds.splice(idIdx,1);
        ret.push(Game.DATASTORE.ITEM[curId]);
      }
    }
    return ret;
  }
};
