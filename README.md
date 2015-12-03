# wsrl_demo
Demonstration / reference code for the Rogue-like winter study course at Williams College.

Branches will be created at (hopefully) useful milestones in the development processes and these notes updated to indicate the specific things that branch achieves.

The player can now kill moss. In the process of implementing combat and death the way that entity mixins use each other's functionality was radically overhauled. Previously, one mixin would directly call a function of another (e.g. WalkerCorporeal would check if the current entity had the Chronicle mixin and if so would call the trackTurn method). This is seriously sub-optimal because it means that each mixin potentially has to know whether any other mixin cares about any given action, and adding a new mixin means goign back and reviewing each existing mixin. This was fixed by switching to an event-based system. Mixins have listeners for the events they care about, and raise events at appropriate points. Now mixins can use functionality of other mixins at appropriate times without worrying about which mixins exactly are invoked nor what exactly they do. This makes mixins much more flexible, powerful, and robust.

Events are currently limited just to causing actions, but future work will expand them to being able to return data, and so mixins that raise events will be able to react to what those events return.
