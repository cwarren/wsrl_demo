# wsrl_demo
Demonstration / reference code for the Rogue-like winter study course at Williams College.

Branches will be created at (hopefully) useful milestones in the development processes and these notes updated to indicate the specific things that branch achieves.

This is a big milestone. It has two major sub-pieces: an inventory mixin so the avatar (and other entities) can carry items, and ui modes for seeing the inventory and picking up and dropping items. 

The first sub piece started with a very simple entity mixin and command support for picking up and dropping a single item. Once that was working I extended the entity mixin to being able to hold multiple items (and the commands would still pick up and drop all items possible). Rather than putting the item holding capability directly in the mixin I created it as an item mixin and used an instance of an item with that mixin in the entity inventory mixin. I took this approach because I expect I'll eventually want to have items that can contain other items (e.g. chests, sacks, etc.).

The second piece is allowing the player to decide which items to pickup or drop. The specific ability to pick up and drop chosen items is good, but the really key piece of this step is the creation of a general item listing framework, both conceptually and in code. Essentially, there are a lot of situation in which the player is going to be shown a lit of items, select one or more of them, and then do something with the given selection - dropping and picking up items are just two very basic examples. So, we set up a general object for itemListing which we can then instantiate with a given template to handle specific actions.

The pieces needed for an item-liting screen are:
* a list of items (or item IDs)
* a label / caption saying what the action/interaction is
* a key-binding set
* a way to filter the items available for action from a larger set (this could be put before the call to the given ui mode, but putting it here keeps related code together)
* a function to process any selected items
* a way to show and select items
* a few flags about what actions are available (e.g. can select, can select multiple, etc.)
* handling of case where there are more items than screen space (i.e. data navigation)
 
The the inventory list, drop, and pickup commands are then implemented as UI layers than instantiated the basic item listing model and use a template to configure it appropriately (e.g. the processing function of the drop ui calls dropItems with any items that were selected).
