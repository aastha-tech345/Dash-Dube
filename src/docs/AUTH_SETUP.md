# Authentication System

## Overview
This application now includes a complete authentication system with login functionality and route protection.

## Features
- Login page with form validation
- API integration with the provided endpoint
- JWT token storage in localStorage
- Route protection - no pages accessible without login
- Logout functionality in the top bar
- Loading states during authentication checks

## API Integration
- **Endpoint**: `https://thegtrgroup.com/api/auth/login`
- **Method**: POST
- **Request**: `{ tenantId, email, password }`
- **Response**: `{ token, roles, modules }`

## Usage
1. User must login first at `/login`
2. After successful login, user is redirected to dashboard
3. All routes are protected and require authentication
4. User can logout using the dropdown in the top bar
5. Token and user data are stored in localStorage for persistence

## Files Created/Modified
- `src/types/auth.ts` - Type definitions
- `src/lib/auth.ts` - API calls and token management
- `src/contexts/AuthContext.tsx` - Authentication context
- `src/components/auth/ProtectedRoute.tsx` - Route protection
- `src/pages/Login.tsx` - Login page
- `src/components/ui/loading.tsx` - Loading component
- `src/App.tsx` - Updated with auth routing
- `src/components/layout/TopBar.tsx` - Added logout functionality