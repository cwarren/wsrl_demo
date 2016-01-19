# wsrl_demo
Demonstration / reference code for the Rogue-like winter study course at Williams College.

Branches will be created at (hopefully) useful milestones in the development processes and these notes updated to indicate the specific things that branch achieves.

This milestone introduces the concept of targeting something - having a cursor independent of the avatar which moves around and the player gets detailed info about whatever the cursor is over. To do the cursor movement the player must use the movement keys, which are tied to numpad or waxd key bindings, but also has additional actions (ACT_ON_TARGET, and maybe more later). Rather than implement a full key binding stack I added just a concept of a base binding, which is mainly tied to movement key stuff. I may later have to upgrade that to a full binding stack analagous to the ui mode stack, but this is good enough for now.

Thinking ahead there are probaly many situations in whicht he player wants to target something, so I may refactor this to use a base UI mode similar to the way the item listing ui modes work.
