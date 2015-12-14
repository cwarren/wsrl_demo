# wsrl_demo
Demonstration / reference code for the Rogue-like winter study course at Williams College.

Branches will be created at (hopefully) useful milestones in the development processes and these notes updated to indicate the specific things that branch achieves.

This branch was originally going to be mostly about mobs attacking the player, but I got side tracked into map stuff in the process.

This introduces a new, dangerous mob that wanders around and attacks the avatar if it happens to bump into it. This was VERY simple to implement using the mixin system. Then while looking into making a more dangerous, smarter entity (one that would chase the player if it could see the player) I ended up filling in a lot more of the map visibility stuff. Smarter mobs have been pushed to a bit later (probably the next batch of work).

Now the avatar (and potentially other mobs) have a limited sight radius. The avatar remembers the map it's seen those remembered cells and shown in dark grey while the areas that are visible are fully rendered (will likely have to revisit that whole system later - currently not suited to maps that can be altered outside the player's view, and there's no LoS checking for things that are 'visible' but have an opaque tile in the way). NOTE: this does NOT use a lighting system - a more flexible model might be to have the avatar have a light source and then the various vision-based checks would rely on light levels and LoS rather than a flat light radius.

So, the avatar can explore the caves and can encounter mobs that can damage and kill it. This means that avatar death has to be handled. Doing so was just a matter of adding a 'killed' listener on the playeractor mixin and then locking the timing engine when entering the game lose and game win uimodes.
