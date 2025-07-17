# AscendOSRS - Simplified MVP Roadmap 🚀

## Philosophy: "Working First, Pretty Later"

### Realistic Principles
- **Critical Bugs First**: If it doesn't work, it's worthless
- **1 Environment Only**: Production working 100%
- **Functional MVP**: User pays → gets access → stays happy
- **No Over-Engineering**: Simple solutions that work
- **Vibe Coding**: MCP + Cursor AI decisions, well-documented code
- **No CMS/Admin Panel**: Direct database management for MVP

### ⚠️ Important Constraints
- **No Test Environment**: All testing on prod with Stripe sandbox
- **No CMS/Admin Panel**: Direct database operations for user management
- **GitHub Commits**: Primary rollback method
- **Supabase Backups**: Database recovery system
- **MCP Connected**: Cursor AI with full database visibility
- **Well Documented**: Code must be self-explanatory for vibe coding

---

## 🔴 PHASE 1: FIX WHAT'S BROKEN
**Duration: 2-3 weeks**
**Objective**: Payment system working + critical bugs resolved

### Sprint 1: Stripe & Payments (Week 1)
**Priority: CRITICAL - REVENUE LOSS**

- [ ] **FIRST: Configure MCP + Cursor Integration**
  - Follow tutorial: https://youtu.be/6eUL1Wo9ZRc?t=1621
  - Connect Cursor to Supabase database
  - Test if you can read tables and structure
  - Verify you can see user data, payment status, etc.
  - **WITHOUT THIS = BLIND DEVELOPMENT**

- [ ] **Configure Stripe Integration**
  - Set up Stripe account for AscendOSRS
  - Use Stripe Sandbox for testing (live prod environment)
  - Implement webhook for payment confirmation
  - Test: Buy plan → receive access → correct time
  - Automatic conversion: purchases → premium status

- [ ] **Document Payment System Architecture**
  - Database schema for user plans
  - Payment flow documentation
  - Stripe webhook handling
  - **Critical for vibe coding without CMS**

- [ ] **Implement Payment Plans**
  - Monthly: $10/month
  - 3 months: $25 (17% discount)
  - 6 months: $45 (25% discount)
  - Yearly: $80 (33% discount)
  - Lifetime: $299 (limited time)

- [ ] **Payment Status Dashboard**
  - User can see current plan
  - Days remaining counter
  - Payment history
  - Renewal/upgrade options

### Sprint 2: User Management & Documentation (Week 2)
**Priority: HIGH**

- [ ] **Gmail OAuth Integration**
  - Google Sign-In as primary auth method
  - Secure user session management
  - Profile creation on first login
  - **Document OAuth flow for AI assistance**

- [ ] **Premium Status System**
  - Database schema for user plans
  - Plan expiration tracking
  - Automatic downgrade to Free when expired
  - Visual indicators in dashboard
  - **Well-documented for manual database operations**

- [ ] **Manual User Management System**
  - Direct database queries for user management
  - Documented SQL scripts for common operations
  - Grant premium access via database updates
  - **No CMS needed - MCP + documentation approach**

### Sprint 3: Core Stability & Backup Systems (Week 3)
**Priority: HIGH**

- [ ] **Fix Save/Load System**
  - Preserve user data across sessions
  - Cloud backup system working
  - No data loss on updates
  - Manual save protection (keep last 3 saves)
  - **Document save/load architecture for AI**

- [ ] **Backup & Recovery Systems**
  - Configure Supabase automatic backups
  - Document recovery procedures
  - Test rollback via GitHub commits
  - **Critical for no-test-environment approach**

- [ ] **Code Documentation Standards**
  - Inline comments for complex logic
  - Function documentation
  - Database schema documentation
  - **Essential for vibe coding with AI assistance**

---

## 🟡 PHASE 2: IMPROVE EXISTING UX
**Duration: 3-4 weeks**
**Objective**: Users can use the app without confusion

### Sprint 4: Core Functionality Polish (Week 4)
**Priority: HIGH**

- [ ] **Character Management**
  - Add/remove characters working perfectly
  - OSRS API integration stable
  - Manual stats input as fallback
  - Character refresh without data loss

- [ ] **Bank Value Calculation**
  - Platinum tokens + gold logic working
  - Multi-character summation accurate
  - Manual price overrides functioning

### Sprint 5: Goals & Items System (Week 5-6)
**Priority: MEDIUM-HIGH**

- [ ] **Essential Goals Database**
  - Top 20 most requested items (Twisted Bow, Scythe, etc.)
  - 3rd Age items working
  - Gilded armor sets
  - Manual goal addition

- [ ] **Goal Progress Tracking**
  - Visual progress bars
  - Time-to-completion calculations
  - Priority system (S+, S, A)
  - Goal completion notifications

### Sprint 6: RuneLite Integration (Week 7)
**Priority: MEDIUM**

- [ ] **CSV Import Basic**
  - RuneLite Data Exporter format support
  - Basic error handling
  - Manual item addition as fallback
  - Import validation

---

## 🔵 PHASE 3: ONE NEW FEATURE AT A TIME
**Duration: 4-6 weeks**
**Objective**: Add value without breaking existing functionality

### Sprint 7: Money Making Methods (Week 8-9)
**Priority: MEDIUM-HIGH**

- [ ] **Basic GP/hr Tracking**
  - Manual GP/hr input per character
  - Simple method assignment
  - Basic time-to-goal calculations
  - No complex automation

### Sprint 8: AI Insights (Week 10-11)
**Priority: MEDIUM**

- [ ] **Simple AI Recommendations**
  - "You can afford X now"
  - Next best upgrade suggestions
  - Rate limiting by plan tier
  - Basic OpenAI integration

### Sprint 9: Polish & Preparation (Week 12)
**Priority: LOW**

- [ ] **Business Preparation**
  - SEO optimization
  - Landing page conversion optimization
  - User onboarding flow
  - Documentation for scaling

---

## 📊 Realistic Success Metrics

### Phase 1 - Stabilization
- [ ] ✅ Payment system: 0 critical bugs
- [ ] ✅ User buys plan → gets access (100% success rate)
- [ ] ✅ Premium status visible in dashboard
- [ ] ✅ Days remaining counter accurate
- [ ] ✅ Admin can grant access manually

### Phase 2 - Core UX
- [ ] ✅ Character management without data loss
- [ ] ✅ Bank calculation accurate
- [ ] ✅ Goals system functional
- [ ] ✅ CSV import working for basic cases

### Phase 3 - Value Addition
- [ ] ✅ GP/hr tracking functional
- [ ] ✅ AI gives basic recommendations
- [ ] ✅ System stable for growth

---

## 🔧 Manual User Management (No CMS Approach)

### Database Operations Documentation
```sql
-- Grant premium access to user
UPDATE user_premium_status 
SET plan_type = 'monthly', 
    end_date = NOW() + INTERVAL '1 month',
    status = 'active'
WHERE user_id = 'user_email@gmail.com';

-- Check user payment status
SELECT * FROM user_premium_status 
WHERE user_id = 'user_email@gmail.com';

-- View all active premium users
SELECT u.email, ups.plan_type, ups.end_date 
FROM users u 
JOIN user_premium_status ups ON u.id = ups.user_id 
WHERE ups.status = 'active';
```

### Testing Without CMS
- **Stripe Sandbox**: All payment testing on live prod
- **Manual Database**: Direct SQL for user management
- **MCP Monitoring**: Real-time database visibility
- **GitHub Rollbacks**: Primary revert method

### Recovery Procedures
1. **Code Issues**: Git revert to last working commit
2. **Database Issues**: Supabase point-in-time recovery
3. **Payment Issues**: Stripe dashboard + manual database fix
4. **User Issues**: Direct database queries via MCP

---

## 🚨 WHAT WE WON'T DO (FOR NOW)

### ❌ Complex Infrastructure
- Separate test environment (GitHub commits for rollbacks)
- CMS/Admin panel (Direct database operations)
- Complex CI/CD (Single prod environment)
- Microservices architecture
- Advanced caching

### ❌ Advanced Features
- Real-time price updates
- Complex AI analysis
- Mobile app
- Advanced analytics
- Leaderboards

### ❌ Over-Engineering
- Complex database optimization
- Advanced security measures
- Multi-region deployment
- Performance optimization

---

## 🎯 Immediate Next Steps

### This Week
1. **🔥 FIRST: Configure MCP + Cursor** - Without this = blind development
2. **Document current architecture** - Essential for vibe coding
3. **Set up Stripe Sandbox** - Test payments on live prod
4. **Map database structure** - Understand current data schema
5. **Create backup procedures** - GitHub + Supabase recovery

### Next Week
1. **Fix 1 critical bug per day**
2. **Test fixes as user** - Use your own app
3. **No new features** - Focus only on bugs

### Next Month
1. **Payment system 100% functional**
2. **Users can buy and use premium**
3. **Admin tools working**
4. **No data loss incidents**

---

## 💡 Golden Rules

### ✅ DO
- Fix bugs before new features
- Test yourself as user (Stripe sandbox on prod)
- Simple solutions that work
- Document everything for AI assistance
- Use MCP for database visibility
- Manual database operations when needed

### ❌ DON'T
- Build CMS/admin panel for MVP
- Create test environments
- Add unnecessary complexity
- Features nobody asked for
- Premature optimization

---

## 🚀 Long-term Vision

**After stable MVP:**
- Then consider test environment + CMS
- Then migrate to better infrastructure
- Then advanced features
- Then hire developers

**But first:** MVP that works, users paying, zero critical bugs, well-documented code.

---

## 📝 Development Priority Order

### Week 1: Foundation Setup
1. **MCP + Cursor Integration** (Day 1-2)
2. **Database structure mapping** (Day 3)
3. **Stripe account setup** (Day 4-5)
4. **Current bug documentation** (Day 6-7)

### Week 2-3: Revenue Critical
1. Stripe integration
2. Payment plans
3. Premium status system
4. Admin dashboard

### Week 4-7: User Experience
1. Character management stability
2. Bank calculations accuracy
3. Basic goals system
4. RuneLite import

### Week 8-12: Value Addition
1. GP/hr tracking
2. AI recommendations
3. Polish and optimization
4. Preparation for scaling

---

## 🔧 Technical Debt Management

### Allowed Technical Debt
- Manual price updates
- Basic error handling
- Simple UI components
- No advanced testing

### Not Allowed Technical Debt
- Payment system bugs
- Data loss issues
- Security vulnerabilities
- User authentication problems

---

## 📈 Success Validation

### Revenue Metrics
- Monthly Recurring Revenue (MRR)
- Payment success rate
- Plan upgrade rate
- Churn rate

### User Metrics
- Daily active users
- Goal completion rate
- Character addition rate
- Support ticket volume

---

**Total Timeline:** 12 weeks for stable, revenue-generating MVP
**After:** Organic growth based on real user feedback