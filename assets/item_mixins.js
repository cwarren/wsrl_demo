Game.ItemMixin = {};

Game.ItemMixin.Container = {
  META: {
    mixinName: 'Container',
    mixinGroup: 'Container',
    stateNamespace: '_Container_attr',
    stateModel:  {
      itemId: ''
    },
    init: function (template) {
      this.attr._Container_attr.itemId = template.itemId || '';
    }
  },
  hasSpace: function () {
    // NOTE: early dev stuff here! simple placeholder functionality....
    return this.attr._Container_attr.itemId === '';
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
    // NOTE: early dev stuff here! simple placeholder functionality....
    this.attr._Container_attr.itemId = itemId;
  },
  getItemIds: function () {
    if (this.attr._Container_attr.itemId) {
      return [this.attr._Container_attr.itemId];
    }
    return [];
  },
  extractItems: function (ids_or_idxs) {
    // NOTE: early dev stuff here! simple placeholder functionality....
    var ret = [this.attr._Container_attr.itemId];
    this.attr._Container_attr.itemId = '';
    return ret;
  }
};
