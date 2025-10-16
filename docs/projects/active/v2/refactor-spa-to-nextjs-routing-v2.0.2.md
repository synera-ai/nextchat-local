# SPA to Next.js Routing Refactor v2.0.2

## Metadata

```yaml
projectId: refactor-spa-to-nextjs-routing
title: "SPA to Next.js Routing Refactor - Architectural Fix"
type: refactor
stage: plan
version: v2.0.2
createdDate: 2025-10-16
lastUpdated: 2025-10-16
assignedAgents: [claude-3.5-sonnet]
estimatedCompletion: 2025-10-16
priority: CRITICAL
tags: [refactor, architecture, routing, nextjs, spa, client-side]
relatedProjects:
  - bugfix-client-router-routing-issue-v2.0.1.md
  - feature-page-config-tabs-v2.1.0.md
```

## Project Overview

**Critical Issue**: The application has a fundamental architectural mismatch between SPA (Single Page Application) design using React Router and Next.js App Router expectations. This is causing complete application failure.

## Problem Statement

### Root Cause Analysis
- **Architecture Mismatch**: App designed as SPA with client-side routing
- **Framework Conflict**: Built on Next.js which expects file-based routing
- **Component Issue**: `home.tsx` uses React Router (`Route`, `Routes`, `useLocation`)
- **Routing Conflict**: React Router conflicts with Next.js App Router
- **Result**: Complete application failure (404 errors)

### Impact
- **Critical**: Application completely non-functional
- **Blocking**: Cannot test any features (PageContainer, Settings, etc.)
- **User Experience**: Complete application failure
- **Development**: All work blocked until resolved

## Current Architecture (BROKEN)

### SPA Design with React Router
```typescript
// home.tsx - SPA approach
import { Route, Routes, useLocation } from "react-router-dom";

function Screen() {
  const location = useLocation();
  
  return (
    <Routes>
      <Route path={Path.Home} element={<Chat />} />
      <Route path={Path.Settings} element={<Settings />} />
      <Route path={Path.Masks} element={<MaskPage />} />
      // ... more routes
    </Routes>
  );
}
```

### Next.js App Router Structure
```
app/
├── page.tsx          # Only route file
├── layout.tsx        # Root layout
└── components/       # Components (not routes)
```

## Solution Options

### Option 1: Convert to Next.js File-Based Routing (RECOMMENDED)
- **Approach**: Create proper Next.js route files for each page
- **Structure**: 
  ```
  app/
  ├── page.tsx           # Home/Chat
  ├── settings/page.tsx  # Settings
  ├── masks/page.tsx     # Masks
  ├── plugins/page.tsx   # Plugins
  └── layout.tsx         # Shared layout
  ```
- **Benefits**: 
  - Follows Next.js conventions
  - Better SEO and performance
  - Proper SSR/SSG support
  - No routing conflicts
- **Effort**: Medium - need to restructure routing

### Option 2: Keep SPA with Proper Router Setup
- **Approach**: Fix React Router integration with Next.js
- **Requirements**: 
  - Proper router provider setup
  - Handle Next.js routing conflicts
  - Maintain SPA behavior
- **Benefits**: 
  - Keep existing architecture
  - Minimal changes to components
- **Effort**: Low - just fix router setup
- **Risk**: High - may still have conflicts

### Option 3: Hybrid Approach
- **Approach**: Use Next.js routing for main pages, SPA for sub-routes
- **Structure**: Mix of file-based and client-side routing
- **Benefits**: 
  - Best of both worlds
  - Gradual migration possible
- **Effort**: High - complex implementation
- **Risk**: Medium - architectural complexity

## Recommended Solution

**Option 2: Keep SPA with Proper Router Setup**

### Rationale
- **Minimal Disruption**: Keep existing component architecture
- **Quick Fix**: Fastest path to working application
- **Preserve Work**: Don't lose PageContainer system work
- **Risk Management**: Lower risk than major refactor

### Implementation Plan

#### Phase 1: Fix Router Setup
1. **Add Router Provider**: Wrap app with proper React Router provider
2. **Fix Router Type**: Use `BrowserRouter` instead of `HashRouter`
3. **Handle Next.js**: Ensure compatibility with Next.js
4. **Test Basic Routing**: Verify main routes work

#### Phase 2: Verify Functionality
1. **Test All Routes**: Settings, Masks, Plugins, etc.
2. **Test PageContainer**: Verify v2.1.0 work still functions
3. **Test Navigation**: Sidebar, menu, etc.
4. **Test State**: Ensure state management works

#### Phase 3: Cleanup
1. **Remove Conflicts**: Clean up any remaining issues
2. **Document Solution**: Update project documentation
3. **Test Edge Cases**: Error handling, etc.

### Technical Implementation

#### Step 1: Add Router Provider
```typescript
// app/layout.tsx or app/page.tsx
import { BrowserRouter } from "react-router-dom";

export default function RootLayout() {
  return (
    <html>
      <body>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </body>
    </html>
  );
}
```

#### Step 2: Verify Router Setup
- Ensure `BrowserRouter` wraps the entire app
- Remove any conflicting Next.js routing
- Test that `useLocation` and `useNavigate` work

#### Step 3: Test All Routes
- Home/Chat: `/`
- Settings: `/settings`
- Masks: `/masks`
- Plugins: `/plugins`
- etc.

## Testing Plan

### Pre-Implementation Testing
- [ ] Confirm current broken state
- [ ] Document all failing routes
- [ ] Identify specific error messages

### Post-Implementation Testing
- [ ] Application loads at `http://localhost:3000`
- [ ] All main routes accessible
- [ ] Settings page works (PageContainer system)
- [ ] Masks page works (PageContainer system)
- [ ] Navigation between routes works
- [ ] No console errors
- [ ] State management works

### Regression Testing
- [ ] PageContainer system still functions
- [ ] All existing features work
- [ ] No new issues introduced

## Progress Log

- **2025-10-16** - **claude-3.5-sonnet**: Identified architectural mismatch
  - Stage: plan
  - Files Changed: [refactor-spa-to-nextjs-routing-v2.0.2.md]
  - Issue: SPA design conflicts with Next.js App Router
  - Impact: Complete application failure

## Blockers

- **BLOCKER-001**: Application completely non-functional
  - Status: open
  - Priority: CRITICAL
  - Assigned To: claude-3.5-sonnet
  - Created: 2025-10-16
  - Impact: Cannot test any functionality, blocking all development

## Dependencies

- **bugfix-client-router-routing-issue-v2.0.1**: Must be resolved first
- **feature-page-config-tabs-v2.1.0**: Blocked until routing works
- **All other projects**: Blocked until application loads

## Success Criteria

- [ ] Application loads successfully at `http://localhost:3000`
- [ ] All main routes accessible (Settings, Masks, Plugins, etc.)
- [ ] PageContainer system works (v2.1.0)
- [ ] No console errors
- [ ] Navigation works properly
- [ ] State management preserved

## Risk Assessment

### High Risk
- **Complete Application Failure**: Currently non-functional
- **Development Blocked**: Cannot test any features
- **User Impact**: Complete service outage

### Medium Risk
- **Architectural Changes**: May require significant refactoring
- **Component Dependencies**: Many components depend on routing

### Low Risk
- **Router Setup**: Should be straightforward fix
- **Existing Components**: Should work once routing fixed

## Next Steps

1. **IMMEDIATE**: Implement proper React Router setup
2. **URGENT**: Test that application loads
3. **CRITICAL**: Verify all routes work
4. **BLOCKING**: Resume v2.1.0 PageContainer testing

---

**Project Status**: 🔴 CRITICAL - Application Completely Broken  
**Last Updated**: 2025-10-16  
**Next Action**: Implement proper React Router setup
