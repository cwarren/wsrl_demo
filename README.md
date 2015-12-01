# wsrl_demo
Demonstration / reference code for the Rogue-like winter study course at Williams College.

Branches will be created at (hopefully) useful milestones in the development processes and these notes updated to indicate the specific things that branch achieves.

The extremely simple avatar position info stored direclty in gamePlay has been replaced by a robust entity system. Entities have their own location state, as well as being able to have mixins to extend their functionality. The avatar is now an entity with WalkableCorporeal (i.e. can move but can't walk through walls), Chronicle (track turns taken), and HitPoints mixins. The persistence system correctly saves and restores the avatar (including its mixins state data).

The end-user experience changes only a little with this step, but the under-the-hood work is quite significant, especially the mixin system.

This sets the stage for having other entities in play (e.g monsters). That will involve a timing engine, entity controllers (player and AI), and of course re-visiting persistence to handle additional entities.
