Context: 
- App for OSRS players
- Objective: Track their wealth progress between characters and manage goals (mainly items). Wealth is tracked between characters. Each character has their inventory divided in Gold, Platinum Tokens and Bank Items. Bank items can be imported via CSV or JSON. And only their "gold" value (which is platinum tokens + gold) is used to count against their goals. (Items). The app asks how many time users plays so it can calculate their time to complete their goals.

Most functionality should be fetching from real values and using OSRS APIs... (free) but if that doesnt work, we still have to find the most apropriate way. And while it doenst work with real data, we have to still maintain the functionality by allowing users to manually input the values on most things...

Problems ->
@Goals
Goals(items) -> Ireal
Goals(items) -> Not showing lots of items.
-> Not showing thumbnails of items. (images)

@Characters
- Not real lvl value (not fetching properly upon refresh) <-- not that I care a lot, but would be nice
- 


@Methods
- Still a lot of methods to be added.

@Bank
Bank items - (when user importcs csv or json) -> It works crystal clear but the values are always 0. I asked you to allow us to change their value, ok. But I want users to also be able to change the SUM of those items (manually, even though its not the best way to do it). But  since we can't fetch those values at the moment, and changing the values manually is a pain, it's best to "hardcode" allowing users to change the SUM of those items. (So we tried "Set All Prices" button but that's not exactly what we need.)

Also @bank, Imported items should be "toggleable" with a ">" so users dont really have to see ALL of their items cause it can be huge huge list. Of course, would be great if we can display the most valuable items when its toggled off. For example, if user has a lot of items, we only display their most valuable in the "off toggle" like twisted bow and other mega rares. But when they toggle it on, we display all of their items.



Works well ->
@Navbar [ Bank Sum (all banks+gold+plat tokens) ]
       [ Gold Sum (gold tokens) ]

@Save to cloud
Working well, mostly.
