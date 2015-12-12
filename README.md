# wsrl_demo
Demonstration / reference code for the Rogue-like winter study course at Williams College.

Branches will be created at (hopefully) useful milestones in the development processes and these notes updated to indicate the specific things that branch achieves.

This milestone tackles three main things: a text-reading uimode, generating help text for given key binding sets, and enhancing the way uimodes are tracked from a single state to a stack.

The first part, the text reading ui mode, is pretty straight forward. It looks very similar to the other basic ui modes, with an attribute for the text to show, getter and setter for that attribute, and a couple of simple, focused commands it supports (scroll up, scroll down, and exit). The challenge comes from the larger context - when this mode is exited the user should go back to whatever mode thay came from.

For the second part I added functionality to the KeyBinding system. Whenever a key binding is set it generates the help text for that binding set. The implementation was a little fussy, but conceptually this was very simple.

Lastly, I changed the way that the game tracks the current mode. Up to this point a single, simple variable was sufficient. Now that there's more mode state to care about I need a more complex data structure. Thinking about this in general, I want to be able to layer one mode on top of another (e.g. game play, with inventory on that, with help text on that) and be able to clear each one when done to get back to the one beneath it. This is a natural pattern for a stack (though I implemented it as a reverse stack (on and off the front instead of the back) to make other parts of the code easier). In thinking through this a bit more I decided to differentiate between uimodes that could be layered and those that would require a full switch. The main difference is that entering a new layer does NOT cause the lower layer to fire its 'exit' code (the player is still 'in' the lower layer), and there's a removeUiMode game method that exits the current layer and drops back to the one beneath (without calling the 'enter' code of the lower one).

With these pieces in place I know that I can freely add new commands and they'll automatically appear in the help screen, and I have a way to show a lot of text if needed (e.g. if/when I implement a way for the player to view the game message archives). Plus, when I add more ui modes to support particular areas of game play (e.g. inventory listing) I have a framework in which to do that.

