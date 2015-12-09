# wsrl_demo
Demonstration / reference code for the Rogue-like winter study course at Williams College.

Branches will be created at (hopefully) useful milestones in the development processes and these notes updated to indicate the specific things that branch achieves.

This milestone tackles the issue of key bindings. That is, making explicit the link between the keys the player presses and the commands they're telling the game to execute. Prior to this point all the input processing was handled directly in the ui modes. Now there's a separate system to deal with that, and to make explicit the commands that are supported and the keys that are used to access those commands. This offers a number of advantages:
* centralized input processing reduces errors
* ui mode handleInput code is greatly streamlined and easier to read and understand
* potential to automatically generate help info (probably in the next milestone, actually)
* much easier to add new commands
It also provides vital functionality that was not otherwise available - the ability to swap key bindings. For example: By default the number pad is used for the movement commands, but that's not viable on a laptop keyboard. So, an alternate option is 'waxd' (really qwe-asd-zxc, which corresponds to 789-456-123). With the ability to define and easily swap around key bindings we can support a wide variety of input options.

Also, we can set up mode-specific inputs. For example, game persistence relly wants 's' to mean 'save', but with a waxd keybinding that 's' becomes one of the movement keys. To get around that I set up a 'persist' key binding that's not in the normal rotation but is automatically used when in uimode.gamepersistence. The 'persist' key binding can claim 's' for save, and then restore the game play key binding when persistence is done.

Now that the key binding work is done I'm comfortable with adding new commands.

During the course of this work I also discovered a bug in map persistence. It turned out to be very similar to a bug I'd already fixed for entity persistence - newly created maps need the option of using a preset id (i.e. the persisted one) instead of creating a new one. Related to this, I took this opportunity to improve the id system I was using - instead of just using a random string I implemented a uniqueId utility method which will (should) guarantee no id collisions.


