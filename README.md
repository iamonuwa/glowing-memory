# Driver Tracking Application

A real-time driver tracking application built with Next.js, Redux, and Mapbox GL. This application provides a modern interface for monitoring driver locations, statuses, and estimated arrival times.

## Features

- Real-time driver location tracking
- Interactive map with driver markers and routes
- Driver status management (delivering, idle, paused)
- Search and sort functionality for driver list
- Responsive design
- Comprehensive test coverage

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide Icons
- **Type Safety**: TypeScript
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Mapbox access token

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd demo
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file in the root directory and add your Mapbox token:
```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

4. Start the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

Run the test suite:
```bash
pnpm test
```

## Architecture Decisions

### State Management
- Used Redux Toolkit for predictable state management
- Implemented optimistic updates for better UX
- Centralized driver state management with proper TypeScript types

### Map Implementation
- Chose Mapbox GL for its performance and customization capabilities
- Implemented custom markers and popups for driver information
- Added route visualization for selected drivers

### UI/UX Design
- Split-screen layout for better information hierarchy
- Real-time updates with minimal UI disruption
- Responsive design with mobile considerations
- Dark mode support for better accessibility

### Testing Strategy
- Unit tests for components and utilities
- Integration tests for complex features
- Mock implementations for external services
- Test coverage for critical paths

### Performance Optimizations
- Implemented memoization for expensive computations
- Used proper React hooks for side effects
- Optimized map rendering with proper cleanup

## Design Trade-offs

1. **Real-time Updates vs Performance**
   - Chose 2-second intervals for updates to balance real-time feel and performance
   - Implemented optimistic updates to improve perceived performance

2. **State Management**
   - Selected Redux over Context API for better debugging and middleware support
   - Trade-off: Slightly more boilerplate code

3. **Map Implementation**
   - Used Mapbox GL instead of Google Maps for better customization
   - Trade-off: Requires API key management

4. **Testing Approach**
   - Used Vitest for faster test execution and better ESM support
   - Trade-off: Less community support compared to Jest

## Known Limitations

1. **Performance**
   - Large number of drivers (>100) might impact performance
   - Map markers could be optimized with clustering

2. **Features**
   - No offline support
   - Limited route history visualization
   - No driver assignment functionality

3. **Technical**
   - No error boundaries implemented
   - Limited test coverage for edge cases
   - No PWA support

## Future Improvements

1. **Performance**
   - Implement marker clustering for better performance
   - Add virtual scrolling for driver list
   - Optimize map rendering

2. **Features**
   - Add driver assignment functionality
   - Implement route optimization
   - Add offline support
   - Add real-time notifications

3. **Technical**
   - Add comprehensive error handling
   - Expand test coverage for edge cases
   - Add PWA support
   - Implement proper loading states
   - Add end-to-end tests with Cypress