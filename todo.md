# Login and Signup Testing

## Issues Found

### 1. Storage Inconsistency in AuthContext
- `getFromStorages()` prefers sessionStorage over localStorage for reading
- `getActiveStorage()` returns sessionStorage if auth token exists there, otherwise localStorage
- This can cause onboarding flag to be set in one storage but read from another

### 2. Pending Verify Logic in AppRouter
- `pendingVerify` checks localStorage only for EMAIL_VERIFIED, but user data could be in sessionStorage
- Inconsistent storage access between signup (sets in localStorage) and login (uses getActiveStorage)

### 3. Signup Flow Issues
- Signup sets EMAIL_VERIFIED="false" in localStorage, but doesn't clear it properly
- After email verification, the flag is set in localStorage but context might be using sessionStorage

### 4. TypeScript Errors in authService
- Error messages are typed as specific strings but functions return different strings
- Need to update ERROR_MESSAGES type or make it more flexible

## Fixes Needed

- [x] Fix storage consistency in AuthContext initialization
- [x] Update pendingVerify logic to check both storages
- [x] Ensure signup/login use consistent storage
- [x] Fix TypeScript errors in authService
- [ ] Test complete login/signup/onboarding flow
