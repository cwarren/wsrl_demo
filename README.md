# wsrl_demo
Demonstration / reference code for the Rogue-like winter study course at Williams College.

Branches will be created at (hopefully) useful milestones in the development processes and these notes updated to indicate the specific things that branch achieves.

This branch focuses on the messages that are shown to a player. The dev messages about basic movement are gone and instead the player is told about bumping into non-walkable tiles, attacking things, killing things, and all that fun stuff. Rogue-likes have a very limited amount of info that's conveyed in the overhead map view, so text-based messages to the player are extremely important to the experience. E.g. when the avatar moves into another entity the player must be told whether the other entity is hit or not - in a game with a rich graphics system that might be shown as blood spatter or some such thing, but in a roguelike it's done with words. 

Messages have three states / buckets: fresh (alert player to what just happened, most important), stale (happened recently, less important), and archived (happened a long time ago and irrelevant unless the player specifically looks at it/them). When a message is sent to the player it starts out fresh, gets stale, and eventually is archived. One part of this milestone is making all that work.

Once the message system is working, the player needs to be given the relevant messages. For this the mixin system is used. There's a PlayerMessager mixin which listens for relevant events and sends the player informative messsages when those events happen. That mixin is an excellent demonstration of the power of event-driven communication - it was extremely simple and intuitive to build and will be very easy to extend.
