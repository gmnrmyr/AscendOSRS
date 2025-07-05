Context: 
- App for OSRS players
- Objective: Track their wealth progress between characters and manage goals (mainly items). Wealth is tracked between characters. Each character has their inventory divided in Gold, Platinum Tokens and Bank Items. Bank items can be imported via CSV or JSON. And only their "gold" value (which is platinum tokens + gold) is used to count against their goals. (Items). The app asks how many time users plays so it can calculate their time to complete their goals.

Most functionality should be fetching from real values and using OSRS APIs... (free) but if that doesnt work, we still have to find the most apropriate way. And while it doenst work with real data, we have to still maintain the functionality by allowing users to manually input the values on most things...



Works well ->
Navbar [ Bank Sum (all banks+gold+plat tokens) ]
       [ Gold Sum (gold tokens) ]





Problems ->

Goals 
Goals(items) -> Ireal
Goals(items) -> Not showing lots of items.


Characters ->
- Not real lvl value (not fetching properly upon refresh) <-- not that I care a lot, but would be nice
- 





