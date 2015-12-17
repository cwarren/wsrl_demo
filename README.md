# wsrl_demo
Demonstration / reference code for the Rogue-like winter study course at Williams College.

Branches will be created at (hopefully) useful milestones in the development processes and these notes updated to indicate the specific things that branch achieves.

This step lays the groundwork for a rich item system. The mixin and event functionaly that was used for entities has been pulled into a class that sites between Entity and Symbol - the new class is SymbolActive. So, part of this milestone was just doing all that refactoring and making sure nothing that was working before got broken. Item then inherits from SymbolActive so it can do all the fun event and mixin stuff too. There's also an item generator that's parallel to the entity generator.

Once a very simple item was working (i.e. able to be created without crashing things) the focus turned to the map. One of the big distinctions between items and entities is that items don't block movement and there can be more than one item at a time on a given tile. At a high level the kinds of operations the map has to support (addItem, getItems, extractItem) parallel the entity-related map commands, but the implementation of them is different. Then the rendering has to be fixed to support items, and we need a way to represent multiple items on a tile.

Once that was done actually putting items on the map was very simple. The avatar can't interact with them in any way yet, but the player can see them. Picking up and dropping items will happen in items-part2. This milestone (items-part1) is relatively small, but folding it in with items-part2 would have made it way too big.
