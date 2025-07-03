# OSRS Dashboard App - Comprehensive Development List

## 🚨 CRITICAL CONSTRAINTS
- **DO NOT BREAK EXISTING FUNCTIONALITY** - Users are already using the app
- **DO NOT CHANGE CURRENT DESIGN** - Maintain existing UI/UX
- **DO NOT REMOVE ANY FEATURES** - Only add new functionality
- **DO NOT LOSE USER DATA** - Preserve all existing user inputs
- **MAINTAIN HIGH CODE QUALITY** - Refactor only if necessary and safe

---

## ✅ COMPLETED FEATURES

### 1. SAVE/LOAD TO CLOUD FUNCTIONALITY - COMPLETED ✅
- **Status**: FULLY WORKING
- **Completed Features**:
  - ✅ Characters (names, types, levels, stats, bank values, notes, isActive, platTokens)
  - ✅ Money making methods (all fields including isActive state)
  - ✅ Hours per day settings
  - ✅ Purchase goals
  - ✅ Bank data and imported items
  - ✅ User preferences and configurations
- **Tested**: Cloud save/load works correctly in anonymous browser sessions
- **Backend**: Supabase cloud function with proper data validation and error handling
- **Data Persistence**: All user data now properly persists across sessions and devices

---

## 🔥 CURRENT PRIORITIES

### 2. MONEY MAKING METHODS - DATA EXPANSION

### Priority: HIGH - Core Feature Enhancement
- **Current Issue**: Limited money making methods available
- **Data Source**: Pull from OSRS Wiki - https://oldschool.runescape.wiki/w/Money_making_guide
- **Include ALL Categories**: Combat, Skilling, Free-to-play, Collecting, etc.
- **Required Methods to Add**:
  - Mining amethyst
  - Smithing runite items (F2P method)
  - Killing green dragons
  - High alching
  - ALL other methods from OSRS wiki money making guide
- **Sync Requirement**: Keep data synced with reality/current OSRS economy
- **Data Source**: Use only open source data from OSRS wiki
- **Member vs F2P Distinction**: Ensure proper categorization for member and free-to-play methods

---

### 3. GOALS SECTION - ITEM EXPANSION

### Priority: HIGH - User Experience
- **Current State**: Displays items (working correctly)
- **Enhancement**: Add ALL items that players would commonly have as goals
- **Reference**: Use OSRS Wiki for comprehensive item list
- **Focus**: ALL items that OSRS players typically set as goals, not just popular ones
- **Missing High-Value Items to Include**:
  - **3rd Age Items**: 3rd age sword, 3rd age bow, 3rd age mage hat, 3rd age robe, etc.
  - **Gilded Items**: Gilded armor pieces, gilded weapons
  - Twisted bow, Dragon hunter crossbow, Bandos armor pieces
  - Virtus equipment, Masori armor, Justiciar armor
  - Primordial/Pegasian/Eternal boots
  - High-tier weapons (Ghrazi rapier, Sanguinesti staff, etc.)
  - Popular teleport items and utility gear
  - Rare pets, achievement diary rewards
- **Data Source**: OSRS Wiki has all items - use comprehensive item database
- **Member vs F2P**: Ensure proper distinction between member and F2P goal items

---

### 4. CHARACTER DATA FETCHING

### Priority: HIGH - Real Data Integration
- **Current Issue**: Character refresh shows "unreal" values when refreshing/adding
- **Data Sources**: OSRS wiki, TempleOSRS, or other open source APIs
- **Research**: Identify best open source data source for character stats
- **Priority Stats to Fetch**:
  - **Total Level** (highest priority - must work)
  - Combat Level (if fetchable)
- **Fallback**: Keep manual input as backup when API fails
- **Account Types**: Support proper OSRS account types (see section 8)
- **API Integration**: Implement robust error handling for API failures

---

### 5. PRICE REFRESH & HARD EDIT FUNCTIONALITY

### Priority: HIGH - User Control
- **Issue**: Refresh button doesn't always update prices correctly
- **Solution**: Implement "hard edit" capability for users
- **Use Case**: When refresh fails, users can manually correct prices
- **Scope**: Apply to both money making methods and goals sections
- **Implementation**: Add edit buttons/fields alongside refresh functionality

---

### 6. CSV IMPORT FUNCTIONALITY

### Priority: HIGH - RuneLite Integration
- **Format**: Support RuneLite "Data Exporter" plugin CSV format
- **Sample Formats**: Support both member and F2P account exports
- **Integration**: Must sync with existing features without breaking design/functionality
- **Location**: Bank importing section
- **User Instructions**: Add CSV import instructions to landing page
- **Critical**: Ensure imported items work with all existing app features

### Example CSV Formats to Support:

#### F2P Account Format:
```json
[
  {"id":8013,"quantity":50,"name":"Teleport to house (Members)"},
  {"id":995,"quantity":207558926,"name":"Coins"}
]
```

#### Member Account Format:
```json
[
  {"id":12791,"quantity":1,"name":"Rune pouch"},
  {"id":20997,"quantity":1,"name":"Twisted bow"},
  {"id":27235,"quantity":1,"name":"Masori mask (f)"},
  {"id":995,"quantity":100000000,"name":"Coins"}
]
```

- **Validation**: Ensure proper handling of both member and F2P items
- **Error Handling**: Graceful handling of unknown item IDs
- **Data Sync**: Imported items must integrate with price refresh and goals system

---

## 📋 MEDIUM PRIORITY FEATURES

### 7. THUMBNAILS IMPLEMENTATION

### Priority: MEDIUM - Visual Enhancement
- **Requirement**: Add thumbnails for items/methods
- **Data Source**: Pull from open source sources (OSRS wiki recommended)
- **Research**: Find best open source thumbnail sources
- **Application**: Apply to money making methods and goals
- **Format**: Ensure consistent sizing and loading performance

---

### 8. CHARACTER TYPES REFINEMENT

### Priority: MEDIUM - OSRS Accuracy
- **Current Issue**: "Alt" is not a native OSRS account type
- **Official OSRS Account Types**:
  - Regular account
  - Ironman
  - Ultimate Ironman
  - Hardcore Ironman
  - Group Ironman
- **"Alt" Handling**: 
  - Keep as internal type for user organization
  - Don't let it interfere with highscores/real character data fetching
  - Consider moving to separate category or removing from main character settings
- **Implementation**: Ensure account type affects data fetching appropriately

---

### 9. LANDING PAGE ENHANCEMENT

### Priority: MEDIUM - User Onboarding
- **Current Issue**: Only shows authentication
- **Enhancement**: Add comprehensive information about:
  - App functionality overview
  - Current features
  - Goals and vision
  - CSV import instructions (both F2P and member account formats)
  - How to use the tool effectively
  - RuneLite Data Exporter plugin setup guide
- **Target Users**: Both single account players and alt account managers
- **Content**: Make it clear this is primarily for alt account management

---

### 10. BANK VALUE HANDLING

### Priority: LOW - Clarification
- **Current State**: Bank value shown in characters section
- **Action**: Remove edit capability from characters section
- **Reason**: Bank value is handled elsewhere in the app
- **Keep**: Display only (no editing to prevent conflicts)
- **Note**: Bank value impossible to fetch automatically, handled in bank import section

---

## 🔄 ONGOING REQUIREMENTS

### 11. DATA SOURCE REQUIREMENTS

### Priority: ONGOING - Data Integrity
- **Mandate**: ALL data must come from open source sources
- **Primary Source**: OSRS Wiki
- **Secondary Sources**: TempleOSRS (for character data)
- **Prohibited**: No proprietary or closed-source data
- **Quality**: Ensure data accuracy and regular updates
- **Member Content**: Properly handle member vs F2P distinctions

---

### 12. TESTING & VALIDATION

### Priority: CRITICAL - Quality Assurance
- **Save/Load**: ✅ Cloud save/load tested and working
- **Data Refresh**: Verify all refresh buttons work correctly
- **CSV Import**: Test with actual RuneLite export data (both F2P and member accounts)
- **Character Fetching**: Validate real OSRS character data retrieval
- **Cross-Browser**: Ensure functionality works across browsers
- **User Flow**: Test complete user workflows without breaking
- **Member vs F2P**: Test all features with both account types

---

### 13. TODO TRACKING SYSTEM

### Priority: MEDIUM - Project Management
- **Current Issue**: Features keep being requested repeatedly
- **Solution**: Add items to existing todo.txt or todo.md file
- **Purpose**: Track features so we know what's been completed
- **Note**: If you keep getting asked for the same feature, it means it's not working properly
- **Maintenance**: Regular updates to reflect current development status

---

### 14. CODE MAINTENANCE

### Priority: ONGOING - Technical Debt
- **Refactoring**: Permitted only if:
  - Doesn't break existing functionality
  - Doesn't change design
  - Improves code quality
  - You're confident in the changes
  - You're done with your main task
- **Big Code**: Break down large code blocks if needed
- **Quality**: Maintain high code standards throughout
- **When to Refactor**: Only after completing main tasks and when confident

---

### 15. MEMBER VS F2P CONTENT HANDLING

### Priority: HIGH - Account Type Support
- **Issue**: Need to properly distinguish between member and F2P content
- **Implementation**: 
  - Flag items/methods as member-only or F2P
  - Filter content based on account type preferences
  - Handle CSV imports with mixed member/F2P items
- **Data Sources**: OSRS Wiki properly categorizes member vs F2P content
- **User Experience**: Clear indicators for member-only content

---

### 16. HIGH-VALUE ITEM INTEGRATION

### Priority: MEDIUM - Comprehensive Content
- **Enhancement**: Include ALL high-tier items that could be goals
- **Items to Prioritize**:
  - **3rd Age Items**: All 3rd age equipment (sword, bow, mage hat, robe, etc.)
  - **Gilded Items**: All gilded armor pieces and weapons
  - Twisted bow, Dragon hunter crossbow
  - Masori armor (f), Virtus equipment
  - Bandos armor, Justiciar armor
  - Primordial/Pegasian/Eternal boots
  - Max capes and achievement diary rewards
  - Rare pets and special items
- **Goal**: Make the app reflect actual comprehensive OSRS content from wiki
- **Integration**: Ensure these items work with price refresh and goal tracking

---

## 🎯 SUCCESS CRITERIA

The app should function as a comprehensive tool for OSRS players, particularly those managing multiple alt accounts, while serving single-account players effectively. All features must work reliably with real OSRS data integration and proper cloud persistence.

**Target Users:**
- OSRS players with multiple alt accounts (PRIMARY TARGET)
- OSRS players with single accounts (SECONDARY TARGET)

**Account Type Support:**
- Both member and F2P accounts
- Proper content filtering based on membership status
- Mixed account management (some alts F2P, some member)

## ⚠️ FAILURE CONDITIONS

- Breaking existing functionality
- Losing user data
- Changing current design
- Removing features users depend on
- Save/load not working properly (RESOLVED ✅)
- Features being requested repeatedly (means they're not implemented properly)
- Poor handling of member vs F2P content distinction

## 📊 CURRENT STATUS UPDATE

**What's Working:**
- ✅ Save to Cloud: ALL data (characters, methods, goals, bank, settings)
- ✅ Load from Cloud: ALL data persists correctly
- ✅ Money making methods: Basic functionality
- ✅ Character display and manual input
- ✅ Basic CSV import functionality
- ✅ Active/Inactive method states: Now saving and loading correctly

**What's Missing/Needs Enhancement:**
- ❌ Money making methods: Limited selection (need expansion from OSRS Wiki)
- ❌ Character data: Showing "unreal" values on refresh (need real API integration)
- ❌ Price refresh: Not working reliably (need hard edit functionality)
- ❌ Member vs F2P content distinction (need proper categorization)
- ❌ Goals missing: 3rd Age items, Gilded items, comprehensive item list
- ❌ Comprehensive CSV import (member accounts)
- ❌ Thumbnails and visual enhancements
- ❌ Landing page comprehensive information

## 🔄 DEVELOPMENT PRIORITIES

1. **HIGH**: Expand money making methods from OSRS Wiki
2. **HIGH**: Add ALL items to goals (including 3rd Age, Gilded, comprehensive wiki list)
3. **HIGH**: Implement character data fetching from open sources
4. **HIGH**: Add hard edit functionality for prices
5. **HIGH**: Enhance CSV import for member account format
6. **MEDIUM**: Add thumbnails and visual enhancements
7. **MEDIUM**: Improve landing page with comprehensive information
8. **MEDIUM**: Refine character types and bank value handling

---

*This comprehensive list maintains all original requirements while incorporating the latest status updates and clarifications about missing functionality and data completeness requirements. Cloud save/load functionality is now COMPLETE and working properly.*
