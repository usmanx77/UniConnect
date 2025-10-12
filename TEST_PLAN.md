Comprehensive Test Plan — Auth & Onboarding

Scope
- Pages: `src/components/SignupPage.tsx`, `LoginPage.tsx`, `VerifyEmailPage.tsx`, `OnboardingPage.tsx`
- Routing: `src/components/AppRouter.tsx`
- Services/State: `src/contexts/AuthContext.tsx`, `src/lib/services/authService.ts`, `src/lib/constants.ts`, `src/lib/utils/validation.ts`

Prerequisites
- Env: `.env` configured with working Supabase URL/key (already present).
- DB: Supabase tables from `supabase/migrations` applied (profiles, university_domains, etc.).
- Test users: None required; flows create and authenticate users via Supabase.
- Browser: Use a modern Chromium-based browser for manual QA.

Notes on State/Persistence
- Persistence choice for auth token is controlled by `STORAGE_KEYS.AUTH_PERSIST` set on the Login page based on “Remember me”.
- User and flags stored under:
  - `uniconnect_auth_token`, `uniconnect_user_data`
  - `uniconnect_onboarding_complete`, `uniconnect_email_verified`
  - For pending verification, `AppRouter` checks these to route to `VerifyEmailPage` even if not authenticated.

How To Run (manual QA)
1) `npm install`
2) `npm run dev`
3) Open the served URL in the browser.
4) Use DevTools Application tab to observe LocalStorage/SessionStorage changes during tests.

Test Matrix

Signup Page
1. Render & Layout
   - Navigate to `/signup` route; verify the page renders with username, email, password, confirm fields, terms checkbox, and submit button.
   - Expected: Submit disabled state only while submitting. Password visibility toggles work.

2. Username validation (client)
   - Input invalid usernames: `ab`, `a*b`, `too_long_username_over_20_chars`.
   - Expected: Error “Usernames must be 3-20 characters using letters, numbers, or underscores.”

3. Username availability (service)
   - Enter a valid username, pause >400ms to trigger check.
   - Expected: Loading hint then success “available” or “already taken” based on `authService.checkUsernameAvailability` response.

4. Email validation (format + domain)
   - Try invalid emails: `user`, `user@`, `user@domain.com`.
   - Expected: Error “Please enter a valid university email (.edu.pk)”.

5. Email availability (service)
   - Enter a valid `.edu.pk` email; pause >400ms.
   - Expected: Loading hint then “available” or “already in use” based on `authService.checkEmailAvailable`.

6. Password requirements
   - Enter password shorter than 8 chars.
   - Expected: Error from `validators.password` and unmet checklist items.

7. Confirm password mismatch
   - Enter different confirm password.
   - Expected: Error “Passwords do not match”.

8. Terms agreement required
   - Leave terms unchecked and submit.
   - Expected: Error “You must agree to the Terms to continue”.

9. Successful signup path
   - Valid username, unique `.edu.pk` email, valid password, terms checked.
   - Submit.
   - Expected: `authService.signUp` called; toast “Account created! Check your email to verify.”; redirect to `/`.
   - Storage: `uniconnect_email_verified` set to `false`, `uniconnect_user_data` set with email.
   - Router: `AppRouter` routes to `VerifyEmailPage` (pending verify): shows email sent UI.

10. Supabase error surfacing
    - Force an error (e.g., duplicate email).
    - Expected: Toast shows the Supabase error message returned by `authService.signUp`.

Login Page
1. Render & Layout
   - Navigate to `/` when unauthenticated; expect `LoginPage`.
   - Fields: identifier (username or email), password, remember me, forgot password dialog.

2. Identifier validation
   - Try invalid username (e.g., `a*`) and invalid email (`user@domain.com`).
   - Expected: Username error from `validators.username` or email error “Please use a valid .edu.pk university email”.

3. Password validation
   - Enter password < 8 chars.
   - Expected: Error from `validators.password`.

4. Caps Lock hint
   - With Caps Lock on, focus password field and type.
   - Expected: “Caps Lock is on” message appears.

5. Password visibility toggle
   - Toggle Eye/EyeOff button.
   - Expected: Password input type toggles between `password` and `text`.

6. Remember me persistence
   - Toggle Remember me on.
   - Submit valid credentials.
   - Expected: App sets `uniconnect_auth_persist` to `local`; token/user go to LocalStorage; SessionStorage cleared of auth keys.
   - Repeat with Remember me off: token/user go to SessionStorage; LocalStorage cleared of auth keys.

7. Successful login
   - Provide correct `.edu.pk` email and password.
   - Expected: Toast “Welcome back!”; `AuthContext` sets `isAuthenticated: true` and populates user; next routing step depends on verification/onboarding flags.

8. Invalid credentials
   - Provide wrong password.
   - Expected: Toast “Invalid email or password.”

9. Forgot password flow
   - Open dialog; enter invalid email (non `.edu.pk`).
   - Expected: Error “Please enter a valid .edu.pk email”.
   - Enter valid `.edu.pk`; click send.
   - Expected: `authService.requestPasswordReset` called; success message “If an account exists, a reset email was sent.”; errors surface if Supabase returns an error.

Verify Email Page
1. Pending verification routing
   - After signup, ensure unauthenticated but storage has `uniconnect_user_data` and `uniconnect_email_verified = false`.
   - Expected: `AppRouter` returns `VerifyEmailPage`.

2. Resend timer behavior
   - On mount, timer starts at 30s; button disabled until 0.
   - After 30s, click Resend.
   - Expected: `authService.sendVerificationEmail` called; shows “Sent!”; timer resets to 30.

3. Mark verified
   - Click “I clicked the email, continue”.
   - Expected: Sets `uniconnect_email_verified = true` and reloads page; `AppRouter` proceeds to onboarding if not onboarded.

Onboarding Page
1. Routing preconditions
   - With `isAuthenticated: true` and `isEmailVerified: true` but `uniconnect_onboarding_complete !== true`, expect `OnboardingPage`.

2. Step gating
   - Verify Next is disabled until `canProceed()` per-step returns true:
     - Step 1: choose a batch.
     - Step 2: choose a department.
     - Step 3: enter a bio (free text); confirm reasonable length acceptance.
     - Step 4: select 2–5 interests.
     - Step 5: select 1–5 societies.
     - Step 6: summary; submit enabled.

3. Completion
   - Click Get Started / complete.
   - Expected: `authService.completeOnboarding` invoked; on success sets `uniconnect_onboarding_complete = true` and updates user in storage; router navigates to main layout.

4. Error handling
   - Simulate service error (e.g., remove domain from `university_domains`).
   - Expected: Toast “Failed to complete onboarding. Please try again.”; state remains on onboarding.

Routing & State Transitions
1. AppRouter logic
   - Unauthenticated -> LoginPage
   - Unauthenticated + pending verify storage -> VerifyEmailPage
   - Authenticated + !isEmailVerified -> VerifyEmailPage
   - Authenticated + isEmailVerified + !onboarded -> OnboardingPage
   - Authenticated + isEmailVerified + onboarded -> MainLayout

2. Refresh mid-flow
   - During pending verify (unauthenticated), refresh.
   - Expected: Still on VerifyEmailPage due to storage flags.
   - During onboarding, refresh.
   - Expected: Still on OnboardingPage; state restored from `AuthContext` + storage.

3. Logout
   - From any authenticated state, logout.
   - Expected: All auth storage keys cleared; returns to LoginPage.

Accessibility
- Inputs provide `aria-invalid` and `aria-describedby` when errors are present.
- Error messages have `role="alert"` with `aria-live="polite"`.
- Check focus order and keyboard operability of dialogs (Forgot Password) and toggles.

Observations / Potential Issues To Watch
- `OnboardingPage` textual step descriptions in `canProceed` comment differ from current UI step order; ensure `canProceed` aligns with the displayed steps.
- `src/lib/constants.ts` includes some icon strings that appear corrupted; not user-facing for auth, but worth cleaning.

Optional: Automate
- Recommended: Add Playwright for E2E (auth flows, storage assertions) and MSW (mock Supabase if needed). Example dev setup:
  - `npm i -D @playwright/test msw`
  - Add `e2e/` specs for Signup, Login, Verify, Onboarding.
  - Configure service worker to intercept Supabase auth endpoints or inject a mocked `supabase` client during tests.

