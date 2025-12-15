# Phase 2 - Roadmap & Enhancements

**Planned Release:** Q1 2026  
**Status:** 📋 Planning  
**Focus:** Enhanced UX, Tour & Onboarding, and Team Collaboration

---

## 🎯 Phase 2 Features

### 1. **Enhanced Onboarding Tour** ✨
Comprehensive, intuitive walkthrough for new users with all sections covered.

#### Objectives:
- **Expand Coverage:** Currently covers 4 steps (Dashboard, Inventory, POS, IA); extend to 12+ steps covering:
  - Navigation & Sidebar (✅ Step 2)
  - Clientes section
  - Proveedores section
  - Ofertas & Promos section
  - Finanzas section
  - Equipo section
  - Seguridad & Backup section
  - Inteligencia Artificial details
  - Data Management section
  - System Config section

#### Implementation Details:
- Add `data-tour` attributes to all key sections in [Dashboard.tsx](../../components/Dashboard.tsx), [CustomerList.tsx](../../components/CustomerList.tsx), [SupplierList.tsx](../../components/SupplierList.tsx), [Promotions.tsx](../../components/Promotions.tsx), [FinancialAnalysis.tsx](../../components/FinancialAnalysis.tsx), etc.
- Improve [OnboardingTour.tsx](../../components/OnboardingTour.tsx) with:
  - Better highlight animations (pulsing effect)
  - Progress indicator (Step 2/12)
  - Keyboard navigation (arrow keys to advance)
  - Mobile-friendly tooltip positioning
  - Skip option to jump to end
  - Estimated tour duration (3-5 min)

#### First-Time User Detection:
- Add `isFirstVisit` flag in [userSettingsService.ts](../../services/userSettingsService.ts)
- Track user's first login timestamp
- On first Dashboard load, show non-intrusive notification:
  - Floating card/banner: **"Welcome! Take a quick tour to learn all features →"**
  - Small badge icon in header: **"🎓 Tutorial"**
  - Dismiss option that sets `isFirstVisit: false`
- Integrate with [Dashboard.tsx](../../components/Dashboard.tsx) render logic

#### UX Enhancements:
- Animated transitions between steps (fade + slide)
- Highlight now includes semi-transparent overlay of entire page
- Accessible: ARIA labels, focus traps during tour
- Pause/Resume tour functionality
- Save progress if user closes mid-tour (resume on next visit)

### 2. **First-Visit Onboarding Notification**
New component to guide fresh users.

**Deliverables:**
- New component: [FirstVisitBanner.tsx](../../components/FirstVisitBanner.tsx)
  - Appears only on first visit
  - Dismissible with "Got it!" or "Show Tour" button
  - Message: *"Welcome to Inventariando! Your all-in-one inventory & sales system. Start with a quick tour →"*
  - Auto-dismiss after 30 seconds if not interacted
  
- Integration points:
  - [Dashboard.tsx](../../components/Dashboard.tsx) - renders at the top conditionally
  - [App.tsx](../../App.tsx) - tracks first visit state

### 3. **Tour Enhancement Features** (Optional stretch goals)
- **Interactive scenarios:** Click buttons *during* tour to see effects (e.g., add a product while on Inventory step)
- **Video snippets:** 10-15 second clips showing each section in action
- **Hotspots:** On sections without explicit highlights, add numbered dots (1, 2, 3) to show clickable elements
- **Glossary:** Hover over terms like "Stock", "COGS", "Markup" to see brief definitions

---

## 📋 Implementation Plan

### Task 1: Expand Tour Steps (2-3 days)
- [ ] Identify missing sections
- [ ] Add `data-tour` attributes across components
- [ ] Update [OnboardingTour.tsx](../../components/OnboardingTour.tsx) `steps` array with 12+ entries
- [ ] Test navigation between all steps
- [ ] Verify highlight positioning on all screen sizes

### Task 2: First-Visit Banner (1-2 days)
- [ ] Create [FirstVisitBanner.tsx](../../components/FirstVisitBanner.tsx) component
- [ ] Implement `isFirstVisit` detection logic in [userSettingsService.ts](../../services/userSettingsService.ts)
- [ ] Integrate banner in [Dashboard.tsx](../../components/Dashboard.tsx)
- [ ] Style with wave animation or gradient

### Task 3: Tour UX Improvements (1-2 days)
- [ ] Add progress bar (Step X / 12)
- [ ] Implement keyboard navigation
- [ ] Enhance highlight animations (pulse effect)
- [ ] Mobile-responsive tooltip adjustments
- [ ] Add skip option

### Task 4: Testing & Polish (1 day)
- [ ] Test on desktop, tablet, mobile
- [ ] Verify tour persists correctly across sections
- [ ] Check accessibility (screen reader support)
- [ ] Performance: ensure tour doesn't block app interactions

---

## 🎨 Design Notes

### First-Visit Banner
```
┌─────────────────────────────────────────────────────────────┐
│  🎓 Bienvenido a Inventariando                         ✕    │
│  Tu sistema integral de inventario y ventas.               │
│  ┌──────────────────┐  ┌────────────────────────┐          │
│  │   Conocer Más    │  │      Comenzar Ahora    │          │
│  └──────────────────┘  └────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Tour Progress Bar
```
Step 3 / 12 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 25%
```

---

## 🔄 Integration with Existing Code

### Modified Files:
1. **[OnboardingTour.tsx](../../components/OnboardingTour.tsx)**
   - Expand `steps` array from 4 to 12+
   - Add progress indicator
   - Add keyboard handlers
   - Improve tooltip animations

2. **[Dashboard.tsx](../../components/Dashboard.tsx)**
   - Add FirstVisitBanner component render
   - Add `data-tour="dashboard-header"` (already exists)
   - Add `data-tour="new-sale-btn"` (already exists)

3. **[userSettingsService.ts](../../services/userSettingsService.ts)**
   - Add `getFirstVisitStatus()` - returns `isFirstVisit: boolean`
   - Add `markFirstVisitComplete()` - sets `isFirstVisit: false`
   - Store in encrypted localStorage or user profile

4. **[App.tsx](../../App.tsx)**
   - Track first visit at root level (already tracks tour state)
   - Pass state to Dashboard component

### New Files:
- **[FirstVisitBanner.tsx](../../components/FirstVisitBanner.tsx)** (80-120 lines)
  - Conditionally render based on `isFirstVisit` state
  - Buttons: "Conocer Más" (start tour), "Empezar Ahora" (dismiss)
  - Auto-dismiss after 30 seconds

---

## 🔗 Related Documentation

### Phase 1 Releases
- [Phase 1 - Beta.1 Release Notes](./PHASE-1-BETA.1.md)
- [Phase 1 - Beta.2 Release Notes](./PHASE-1-BETA.2.md)
- [Phase 1 - Beta.3 Release Notes](./PHASE-1-BETA.3.md)

### Project Roadmap
- [General Roadmap](../../Fases%20de%20la%20App/Roadmap-app.md)

---

## ⏱️ Estimated Effort
- **Total:** 6-8 days development + 1-2 days QA
- **Resources:** 1 frontend developer
- **Blockers:** None

---

## 📊 Success Metrics
- ✅ 100% of sections covered in tour (12+ steps)
- ✅ First-visit banner displayed correctly on new users
- ✅ Tour completion rate tracked (analytics)
- ✅ Zero regression in existing features
- ✅ Mobile tour UX score (mobile-friendly tooltips)

---

## 🚀 Future Enhancements (Post-Phase 2)
- Interactive product creation during tour
- Video tutorials per section
- Contextual tooltips (hover hints throughout app)
- Tour history/analytics (which steps users visit most)
- Multi-language tour content
- Accessibility audit & improvements

---

**Last Updated:** December 15, 2025  
**Owner:** Inventariando Team  
**Status:** 📋 Ready for Sprint Planning
