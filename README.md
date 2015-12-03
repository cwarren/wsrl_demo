# wsrl_demo
Demonstration / reference code for the Rogue-like winter study course at Williams College.

Branches will be created at (hopefully) useful milestones in the development processes and these notes updated to indicate the specific things that branch achieves.

From the end-user perspective the changes for this milestone are minimal - there are now blobs of green moss on the map in addition to the avatar, though one can't even interact with them. However, this is a MAJOR overhaul for the code under the hood. Simply adding more, new entities and populating the map with them is actually very simple. Having all those entities saved and loaded correctly required significant changes to the way entities, maps, and object relations are handled.

This introduces the idea of a datastore, which provides two things. First, it's a single, central object to process for almost all of the persistence work that needs to be done. Centralizing this and decoupling it from the object relation hierarchy (e.g. game contains map contains entities) GREATLY simplifies both initial persistence implementation and extension going forward. Second, it enables all object relations to be tracked via a string ID rather than direct object assignment. This means that all relationship data can easily be kept in the persisted data/state hashes that each object uses (typically called 'attr').

The second part required a lot of refactoring to bring all the old code up to spec.

Also, this adds a framework for more flexible map generation. In this particular branch it's a true refactoring - code is reorganized but outcome is unchanged. Having this framework in place lets the map track which system was using in its generation, and that information is then persisted.

--------------------

Deciding what to do when is a major challenge for larger projects. Refactoring a bunch of stuff to switch to using datastore and object id's was on the complicated side, but I think that this is pretty much the earliest / simplest stage of the project where switching to that approach makes sense and can be reasonably tested. So, despite the all the re-working involved I'm pretty happy with the timing of this chunk of work.
