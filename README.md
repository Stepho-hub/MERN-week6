# User Management Application

A full-stack user management application built with React (frontend) and Express.js (backend), featuring comprehensive testing coverage.

## Features

- User creation and management
- Real-time user list updates
- Form validation and error handling
- Responsive UI with Tailwind CSS
- SQLite database for data persistence

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Testing Library
- **Backend**: Express.js, SQLite with better-sqlite3
- **Testing**: Jest, React Testing Library, Supertest, Playwright
- **Build**: Vite with Babel

## Testing Strategy

This project employs a comprehensive testing strategy to ensure code quality and reliability:

### Unit Testing
- **Framework**: Jest with jsdom for DOM simulation
- **Coverage Goal**: >=70% statement coverage (currently 87.36%)
- **Scope**: Individual functions, components, and utilities
- **Tools**: React Testing Library for component testing, Supertest for API testing

### Test Categories
1. **Component Tests**: Test React components in isolation with mocked dependencies
2. **Hook Tests**: Test custom React hooks (useCounter, useLocalStorage)
3. **Utility Tests**: Test pure functions in utils directories
4. **API Tests**: Test server endpoints with mocked database
5. **Integration Tests**: Test component interactions and data flow
6. **Accessibility Tests**: Ensure UI components are accessible
7. **Performance Tests**: Monitor rendering performance and API response times
8. **End-to-End Tests**: Full user workflows with Playwright

### Running Tests

```bash
# Run all unit tests with coverage
npm run test -- --coverage

# Run client-side tests only
npm run test:client

# Run server-side tests only
npm run test:server

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run performance tests
npm run test -- --testPathPattern=performance
```

### Coverage Report
Coverage reports are generated in the `coverage/` directory with detailed HTML reports. The project maintains high coverage across:
- Statements: 87.36%
- Branches: 82.14%
- Functions: 95.12%
- Lines: 87.5%

### Test Organization
- `src/**/*.test.js` - Client-side unit and integration tests
- `server/**/*.test.js` - Server-side unit tests
- `src/__tests__/` - Specialized tests (accessibility, performance, user workflows)
- `e2e/` - End-to-end tests with Playwright

### Mocking Strategy
- Fetch API is globally mocked in test setup
- Database operations use in-memory SQLite for testing
- External dependencies are mocked to isolate units under test
- Network requests are mocked with proper Response objects

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start backend server
node server/index.js

# Build for production
npm run build

# Preview production build
npm run preview
```

## Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run all Jest tests
- `npm run test:e2e` - Run Playwright e2e tests
- `npm run lint` - Run ESLint

## Project Structure

```
testing/
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── __tests__/     # Specialized tests
│   └── setupTests.js  # Test configuration
├── server/
│   ├── middleware/    # Express middleware
│   └── utils/         # Server utilities
├── e2e/               # End-to-end tests
├── coverage/          # Test coverage reports
└── jest.config.js     # Jest configuration
```
