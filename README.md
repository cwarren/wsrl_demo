# wsrl_demo
Demonstration / reference code for the Rogue-like winter study course at Williams College.

Branches will be created at (hopefully) useful milestones in the development processes and these notes updated to indicate the specific things that branch achieves.

With the addition of symbols, tiles, and maps it's beginning to look like a game! This branch introduces a basic model for a map and sets up the map rendering framework. The latter supports the concept of a camera location, which allows display of a display-sized subsection of a large map.

The map is built on the concepts of Tiles (i.e. a single space on the map), and Symbols (i.e. a character that can be shown on a rot.js console (a game display)).

This branch also has a very basic implementation of an avatar (with movement using the number pad), which the camera tracks when the avatar is moved.

With the addition of meaningful state in the gamePlay UIMode (avatar position and camera position) the persistence system needed to be extended to support saving and restoring that state.
