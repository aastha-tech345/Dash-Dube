# Ware House - Warehouse Management System

A modern warehouse management system built with React, TypeScript, and Tailwind CSS.

## Project Features

- **Authentication System**: Secure login with JWT tokens
- **Inventory Management**: Track and manage warehouse inventory
- **Infrastructure Management**: Manage warehouses and zones
- **Stock Operations**: Handle stock in/out operations
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Theme switching capability

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Technology Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: React Query, Context API
- **Routing**: React Router
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite

## Authentication

The application uses JWT-based authentication with the following endpoint:
- **Login**: `https://thegtrgroup.com/api/auth/login`

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── contexts/      # React contexts
├── lib/           # Utility functions
├── types/         # TypeScript type definitions
└── hooks/         # Custom React hooks
```