# wsrl_demo
Demonstration / reference code for the Rogue-like winter study course at Williams College.

Branches will be created at (hopefully) useful milestones in the development processes and these notes updated to indicate the specific things that branch achieves.

This first, and small/simple, part of this milestone is showing better avatar info. Instead of the position of the avatar we now show combat stats, life, a bit of chronicled info (turns and kills), and (after the second part of this milestone was done) hunger status. Currently this is implemented directly in the renderAvatarInfo method of the gamePlay ui mode. At some point that may want to be pulled out to a separate function / method somewhere, but that particular work is delayed until it becomes necessary (i.e. until we need to access/show that stat block from anywhere else in the code) - it will be a simple refactor when the time comes.

The second part of this milestone is much more interesting. There's now a second kind of item and it has a new mixin - Food. There's a corresponding new entity mixin - FoodConsumer. I had some questions about whether that should be implemented as a mixin or else directly in the PlayerActor since I don't expect any other entities will be food consumers, but after some thought I decided to do it as a separate mixin. There were two main reasons for this. First, since I don't have all the future details of everything fully worked out it would be nice to have the option of making other entities food consumers. Second, the mixin framework is robust and simple at this point, and it would be no harder (and maybe even easier) to implement that functionality as a separate mixin rather than modifying the PlayerActor mixin.

With the capabilities of food items providing nutrition and entities being able to consume food I then needed to add the ui elements to let the player make that happen. The process for that is pretty standard now
1) add key binding entries for the new command
2) add code to pick up the action in gamePlay handleInput and any other relevant input handlers
3) if necessary, add new UIMode to implement the action
4) tweak player messaging and any other user experience pieces as needed
5) verify/extend persistence as needed
