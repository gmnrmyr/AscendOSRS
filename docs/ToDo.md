ToDo & Fixes.

---

## Methods (Money Making) ✅ UPDATED
- ✅ Integrate real OSRS Wiki money making methods
- ✅ Use OSRS Wiki API for realistic profit rates
- ✅ Add comprehensive money makers (Theatre of Blood, Nex, TOA, etc.)
- ✅ Support both high-level PvM and skilling methods
- MPH (methods per hour) and all existing method data are kept and updated as before.

## Goals (Items) ✅ UPDATED  
- ✅ Integrate OSRS Wiki real-time prices API
- ✅ Add more popular goal items (high-value PvM drops, expensive gear)
- ✅ Add manual price editing for users
- ✅ Add item thumbnails from OSRS Wiki

## Characters ✅ UPDATED
- ✅ Integrate real OSRS hiscores API 
- ✅ Use TempleOSRS for more accurate data
- ✅ Improve refresh functionality with real player stats

## Cloud Save/Load ✅ FIXED
- ✅ Fixed database constraint issues
- ✅ All data types now save/load correctly
- ✅ Enhanced validation and error handling
- ✅ Auto-load from cloud when user logs in (works in anonymous tabs)

## Characters
- Some characters may still not fetch combat level and total level correctly on reload or import. This is a known, low-priority issue under review.
- The bank value input has been removed from the character add/edit page. Bank value is now managed elsewhere in the app.
- Users should be able to directly edit both gold and platinum token values for each character's bank, regardless of CSV import status. This edit should be available in the main character panel, not a separate modal.
- A link to view the full bank should be provided in the character panel for easy reference.
- All edits should be accessible in one panel without losing context or requiring navigation away.

## Goals & Items
- Item autocomplete and fetching for goals/items should use open sources (OSRS Wiki, Grand Exchange, etc.).
- Everywhere items are displayed (except for the bank, which is handled separately), real item images from the wiki or open sources should be used or fetched.

## Bank Import & Updates
- When importing a bank CSV, if a bank already exists, the app should prompt the user to update the existing bank instead of duplicating data.
- If the user confirms, the bank should be updated to prevent duplication or data issues.

## General
- All features and design must be maintained or improved; no features should be removed or broken.
- All changes must ensure robust functionality and a seamless user experience.
- Redundancy in documentation and features should be avoided.

---

**Note:**
- Manual bank value edits for characters must be fully supported and work as intended.
- All changes must be made with the goal of not breaking any existing features or design.
- Keep great design and functionality without removing or breaking any features.
- Do not break anything; show full details, please.
