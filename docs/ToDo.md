# OSRS Dashboard App - Comprehensive Development Roadmap

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

### 2. BANK SUMMATION & INTERFACE - COMPLETED ✅
- **Status**: FULLY WORKING
- **Issue Fixed**: Bank sum was only calculating ONE character instead of all characters
- **Interface Cleanup**: Removed unnecessary categories, item counts, character sums
- **Solution**: Fixed calculations to include all characters + all gold + all platinum tokens
- **Current State**: Bank sum correctly shows combined wealth across all characters
- **Navbar Integration**: Bank Sum and Gold Sum now properly synchronized

### 3. BANK VALUE MANAGEMENT - COMPLETED ✅
- **Status**: FULLY WORKING
- **Manual Editing**: Users can now edit bank values and they persist correctly
- **Gold Input Format**: M/B/K format working (1000m → 1b display)
- **Update Prices**: Native "Update Prices" button for bulk price updates
- **Bank Item Toggle**: Items properly toggleable with valuable items display when collapsed

---

## 🔄 ONGOING IMPROVEMENTS

### 4. PRICE FETCHING ACCURACY - CONTINUOUS IMPROVEMENT 🔄
- **Current State**: Most items fetch prices correctly, minor discrepancies exist
- **Known Limitation**: Some items may not fetch current/accurate prices from APIs
- **Impact**: Character bank values may be slightly lower than reality (acceptable variance)
- **User Control**: Manual price editing available for immediate corrections
- **Approach**: Continuous refinement without breaking existing functionality
- **Priority**: LOW - Ongoing optimization as data sources improve
- **Future Enhancements**: Better API integration, multiple data source fallbacks

---

## 🔥 CURRENT HIGH PRIORITIES

### 5. GOALS SECTION - ITEM DATABASE EXPANSION

#### Priority: CRITICAL - Core Feature Enhancement
- **Current Issue**: Limited item selection, missing comprehensive goal items
- **Missing High-Value Items**:
  - **3rd Age Items**: 3rd age sword, 3rd age bow, 3rd age mage hat, 3rd age robe, etc.
  - **Gilded Items**: Gilded armor pieces, gilded weapons
  - **High-Tier Weapons**: Twisted bow, Dragon hunter crossbow, Ghrazi rapier, Sanguinesti staff
  - **Armor Sets**: Bandos, Virtus, Masori, Justiciar armor pieces
  - **Boots**: Primordial/Pegasian/Eternal boots
  - **Utility Items**: Popular teleport items, achievement diary rewards
  - **Rare Pets**: All obtainable pets
- **Data Source**: OSRS Wiki comprehensive item database
- **Member vs F2P**: Ensure proper categorization for member and free-to-play items
- **Integration**: Must work with existing price refresh and goal tracking systems

### 6. GOALS SECTION - THUMBNAILS IMPLEMENTATION

#### Priority: HIGH - User Experience Enhancement
- **Current Issue**: No thumbnails/images for items in goals section
- **Impact**: Poor visual experience for goal setting
- **Data Source**: OSRS Wiki item images or similar open source
- **Requirements**: Consistent sizing, fast loading, proper fallbacks
- **Application**: All goal items must have visual representation

### 7. MONEY MAKING METHODS - DATA EXPANSION

#### Priority: HIGH - Core Feature Enhancement  
- **Current Issue**: Limited money making methods available
- **Data Source**: OSRS Wiki Money Making Guide - https://oldschool.runescape.wiki/w/Money_making_guide
- **Required Methods to Add**:
  - **Combat Methods**: Killing green dragons, Vorkath, Zulrah, etc.
  - **Skilling Methods**: Mining amethyst, High alching, Smithing runite items
  - **F2P Methods**: All free-to-play money making options
  - **Collecting Methods**: Various gathering activities
  - **ALL Categories**: Combat, Skilling, Free-to-play, Collecting, etc.
- **Member vs F2P**: Proper categorization for different account types
- **Data Sync**: Keep synced with current OSRS economy

### 8. CHARACTER DATA FETCHING

#### Priority: HIGH - Real Data Integration
- **Current Issue**: Character refresh shows "unreal" values
- **Data Sources**: OSRS Hiscores, TempleOSRS, or other open source APIs
- **Priority Stats to Fetch**:
  - **Total Level** (highest priority - must work)
  - **Combat Level** (if fetchable)
  - **Individual Skills** (if API supports)
- **Account Types**: Support proper OSRS account types (Regular, Ironman, etc.)
- **Error Handling**: Robust API failure handling with manual input fallback
- **API Integration**: Research and identify best open source data sources

---

## 🚀 NEW HIGH PRIORITY FEATURES

### 9. LANDING PAGE OVERHAUL & SUBSCRIPTION PLANS

#### Priority: HIGH - Business Model & User Experience
- **Landing Page Review**: Comprehensive review and redesign of landing page
- **Subscription Tiers**: Implement tiered pricing structure
  - **Monthly Plan**: Standard monthly subscription
  - **3-Month Plan**: Quarterly subscription with discount
  - **6-Month Plan**: Semi-annual subscription with better discount
  - **Yearly Plan**: Annual subscription with significant discount
  - **Lifetime Plan**: Founder-exclusive lifetime access option
- **Free Trial**: 30-day free trial for all first-time users
- **Demo Accounts**: Automated demo account creation with trial period
- **Pricing Display**: Clear pricing comparison and feature breakdown
- **Call-to-Action**: Optimized conversion flows for subscriptions

### 10. PREMIUM CODE MANAGEMENT SYSTEM

#### Priority: HIGH - Admin Control & Automation
- **Admin Dashboard**: Full admin control panel for myself (manera@gmail.com)
- **Premium Code Generation**: Auto-generate premium codes for all subscription tiers
- **Code Management**: Create, edit, disable, and track premium codes
- **Automated Control**: Auto-apply codes and manage subscription periods
- **Bulk Operations**: Mass code generation for promotions and giveaways
- **Usage Analytics**: Track code usage, conversion rates, and user acquisition
- **Founder Codes**: Special lifetime codes for early adopters/founders
- **Integration**: Seamless integration with payment system and user accounts

### 11. DARK MODE IMPLEMENTATION

#### Priority: HIGH - User Experience & Accessibility
- **Dark Theme**: Complete dark mode implementation across all components
- **Theme Toggle**: User-controlled theme switching (light/dark)
- **System Preference**: Auto-detect user's system theme preference
- **Persistent Settings**: Save user's theme preference to cloud/local storage
- **Accessibility**: Ensure WCAG compliance for both light and dark modes
- **OSRS Styling**: Maintain OSRS aesthetic in both themes
- **Smooth Transitions**: Implement smooth theme switching animations

### 12. BRAND REDESIGN & NAMING

#### Priority: HIGH - Brand Identity
- **Name Review**: Evaluate current app name and consider rebranding
- **Logo Design**: Create professional logo design for the app
- **Brand Identity**: Establish consistent brand colors, fonts, and styling
- **Visual Consistency**: Apply new branding across all pages and components
- **Marketing Materials**: Update all marketing and documentation materials
- **Domain Strategy**: Consider domain name alignment with new branding
- **User Communication**: Plan communication strategy for brand transition

---

## 📋 MEDIUM PRIORITY FEATURES

### 13. ENHANCED CSV IMPORT FUNCTIONALITY

#### Priority: MEDIUM - RuneLite Integration
- **Current State**: Basic CSV import working
- **Enhancement**: Full RuneLite "Data Exporter" plugin CSV format support
- **Sample Formats**: Support both member and F2P account exports
- **Integration**: Must sync with existing features without breaking design
- **User Instructions**: Add comprehensive CSV import guide to landing page

#### Example CSV Formats to Support:
**F2P Account Format:**
```json
[
  {"id":8013,"quantity":50,"name":"Teleport to house (Members)"},
  {"id":995,"quantity":207558926,"name":"Coins"}
]
```

**Member Account Format:**
```json
[
  {"id":12791,"quantity":1,"name":"Rune pouch"},
  {"id":20997,"quantity":1,"name":"Twisted bow"},
  {"id":27235,"quantity":1,"name":"Masori mask (f)"},
  {"id":995,"quantity":100000000,"name":"Coins"}
]
```

### 14. CHARACTER TYPES REFINEMENT

#### Priority: MEDIUM - OSRS Accuracy
- **Current Issue**: "Alt" is not a native OSRS account type
- **Official OSRS Account Types**:
  - Regular account
  - Ironman
  - Ultimate Ironman  
  - Hardcore Ironman
  - Group Ironman
- **"Alt" Handling**: Keep as internal organizational type but don't let it interfere with hiscores
- **Implementation**: Ensure account type affects data fetching appropriately

### 15. ORIGINAL LANDING PAGE ENHANCEMENT

#### Priority: MEDIUM - User Onboarding
- **Current State**: Only shows authentication
- **Enhancement Requirements**:
  - App functionality overview
  - Current features and capabilities
  - Goals and vision statement
  - CSV import instructions (F2P and member formats)
  - RuneLite Data Exporter plugin setup guide
  - Effective usage tutorials
- **Target Audience**: Both single account players and alt account managers
- **Content Focus**: Clarity that this is primarily for alt account management

---

## 🎯 UPCOMING PREMIUM FEATURES

### 16. AUTHENTICATION & ADMIN SYSTEM

#### Priority: HIGH - Business Logic
- **Admin Access**: Add admin privileges to manera@gmail.com
- **Password Reset**: Allow users to reset passwords in auth system
- **Trial System**: 30-day trial for demo accounts
- **Subscription Tiers**: 
  - Lifetime
  - Monthly
  - 3/6/12 month periods
  - 2/3/5 year periods
- **Admin CMS**: Backend control panel (Ctrl+Shift+E) accessible to admin only
- **Coupon System**: Admin-controlled coupon codes for all subscription periods
- **Payment Integration**: Controlled by payments system

### 17. AUTOMATED DATA UPDATES

#### Priority: MEDIUM - Data Integrity
- **OSRS Wiki Integration**: Daily automated item price updates via batch script
- **Price Refresh Enhancement**: Improve reliability of price update systems
- **Hard Edit Capability**: Allow manual price corrections when API fails
- **Data Validation**: Ensure data accuracy and regular updates
- **Multiple Data Sources**: Implement fallback systems for price accuracy

---

## 🔄 ONGOING REQUIREMENTS

### 18. DATA SOURCE COMPLIANCE

#### Priority: ONGOING - Data Integrity
- **Mandate**: ALL data must come from open source sources
- **Primary Source**: OSRS Wiki
- **Secondary Sources**: TempleOSRS (for character data)
- **Prohibited**: No proprietary or closed-source data
- **Member Content**: Properly handle member vs F2P distinctions

### 19. QUALITY ASSURANCE & TESTING

#### Priority: CRITICAL - System Reliability
- **Save/Load**: ✅ Cloud save/load tested and working
- **Bank Calculations**: ✅ Bank summation tested and working
- **Price Accuracy**: ✅ Acceptable variance with manual override capability
- **Data Refresh**: Verify all refresh buttons work correctly
- **CSV Import**: Test with actual RuneLite export data
- **Character Fetching**: Validate real OSRS character data retrieval
- **Cross-Browser**: Ensure functionality works across browsers
- **Member vs F2P**: Test all features with both account types

### 20. CODE MAINTENANCE

#### Priority: ONGOING - Technical Excellence
- **Refactoring Guidelines**: Only when:
  - Doesn't break existing functionality
  - Doesn't change design
  - Improves code quality
  - High confidence in changes
  - Main tasks are completed
- **Code Quality**: Maintain high standards throughout
- **Documentation**: Keep comprehensive development records

---

## 🎯 SUCCESS CRITERIA

### Primary Goals
- **Comprehensive Tool**: Complete solution for OSRS players managing multiple accounts
- **Data Accuracy**: All calculations and displays reflect real OSRS data (with acceptable variance)
- **User Experience**: Intuitive interface with all necessary features
- **Reliability**: Stable cloud persistence and data management

### Target User Support
- **OSRS players with multiple alt accounts** (PRIMARY TARGET)
- **OSRS players with single accounts** (SECONDARY TARGET)
- **Account Type Support**: Both member and F2P accounts
- **Content Filtering**: Proper filtering based on membership status
- **Mixed Management**: Some alts F2P, some member

### Realistic Expectations
- **Price Accuracy**: Minor variances acceptable with manual override options
- **Data Completeness**: Comprehensive databases with ongoing expansion
- **User Control**: Manual input available when automated systems have limitations

---

## ⚠️ FAILURE CONDITIONS TO AVOID

- Breaking existing functionality
- Losing user data
- Changing current design without user request
- Removing features users depend on
- Poor handling of member vs F2P content distinction
- Features being requested repeatedly (indicates poor implementation)

---

## 📊 CURRENT STATUS OVERVIEW

### ✅ WORKING EXCELLENTLY
- **Core Calculations**: Bank summation across all characters
- **Data Persistence**: Save/load to cloud with all data types
- **User Interface**: Clean, organized, and functional
- **Bank Management**: Value editing, item toggling, price updates
- **Input Formats**: M/B/K format parsing for gold values

### 🔄 WORKING WELL (Minor Improvements Ongoing)
- **Price Fetching**: Most items accurate, some minor variances (acceptable)
- **Value Calculations**: Realistic accuracy with manual override options
- **API Integration**: Basic functionality with room for enhancement

### 🔄 NEEDS IMMEDIATE ATTENTION
- **Goals Database**: Missing comprehensive item selection
- **Method Database**: Limited money making methods
- **Visual Elements**: Item thumbnails and images
- **API Integration**: Character level fetching

### 🏗️ FUTURE DEVELOPMENT
- **Premium Features**: Admin system, subscriptions, advanced analytics
- **Advanced Integrations**: Real-time data feeds, automated updates
- **Enhanced UX**: Advanced filtering, sorting, analytics

---

## 🎉 DEVELOPMENT ACHIEVEMENTS

The app has evolved into a robust, reliable tool for OSRS wealth management. Recent fixes have resolved critical calculation issues and interface problems, creating a solid foundation for database expansion and premium feature development.

**Key Accomplishments:**
- ✅ Resolved multi-character bank summation
- ✅ Cleaned up interface complexity
- ✅ Established reliable cloud persistence
- ✅ Created flexible input systems
- ✅ Built scalable architecture
- ✅ Implemented realistic expectations for price accuracy

**Current State**: The app provides excellent functionality with minor price variances that are acceptable and manageable through manual overrides.

**Next Phase Focus**: Content database expansion while maintaining excellent existing functionality and gradually improving price accuracy through better API integration.

---

*This roadmap maintains all original requirements while reflecting current status and organizing priorities for efficient development progression. Price accuracy is acknowledged as an ongoing improvement area with realistic expectations.*
