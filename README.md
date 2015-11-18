# wsrl_demo
Demonstration / reference code for the Rogue-like winter study course at Williams College.

Branches will be created at (hopefully) useful milestones in the development processes and these notes updated to indicate the specific things that branch achieves.

At this point wsrl is a very simple game with some basic UI strucutres in place:
* multiple display areas (one for the avatar, one main display, and one for messages)
* a concept of ui modes and switching between them (game start, playing the game, game end win, game end lose)
* rendering systems for each mode, input handling (capturing events and passing them to the current ui mode)
* displaying messages to the player
* a very simple game (press enter to win or escape to lose)

All the parts need to be seriously extended and refined and many more new parts must be created, but this is a foundation on which the real game can be built. 

The next step is to add a very tiny bit of game state and then get persistence (save and restore games) working.
