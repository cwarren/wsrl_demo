# wsrl_demo
Demonstration / reference code for the Rogue-like winter study course at Williams College.

Branches will be created at (hopefully) useful milestones in the development processes and these notes updated to indicate the specific things that branch achieves.

This milestone introduces more dangerous mobs - a new mixin lets a mob chase down the avatar. It's actually very similar (i.e. largely identical) to the basic WanderActor, but in the move-choosing section it checks to see if the avatar is in sight and moves towards it if so. There's a whole bunch of complciated, fun AI work that can be done, but that's being set aside for now. AI can be revisited once the rest of the game basics are in place. For now a simple cut-and-paste is sufficient. Making 'step towards the avatar' work was actually surprisingly complicated for all that it's a very simple concept. I used the ROT.Path.AStar tools to do the heavy lifting.

With mobs chasing and attacking the player this seemed like a good time also to extend the melee combat system a bit. Just running into a mob is no longer sufficient to damage it. There's now a check for whether the melee attack hits, and if it does hit then the damage may be mitigated. This was all handled by the addition of a new mixin (MeleeDefender) and by heavy use of events that returned values. I established a protocol of naming event listeners calcSomthingOrOther for listeners that are primarily used to calculate values. A couple of utility functions to compact arrays of values into a single value make it pretty easy to process/use the results of calc events.

Finally, since players can lose by the avatar being killed it seems only fair to give them a way to win as well. Victory may be achieved by killing 3 (or more, though currently there's no way to kill more than one at a time) attack slugs.
