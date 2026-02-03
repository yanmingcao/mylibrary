# Cypress E2E Testing Setup

This document describes the Cypress end-to-end testing setup for the Community Library System.

## Overview

Cypress is configured for testing critical user flows in the community library application:
- User registration and login
- Family creation
- Book search
- Book request workflow
- Borrowing approval flow
- Book returns and history

## Installation

Cypress is already installed as a dev dependency. To verify:

```bash
npm list cypress
```

## Configuration

### cypress.config.ts

The main Cypress configuration file includes:
- **baseUrl**: `http://localhost:3000` - The application URL
- **viewportWidth**: 1280px
- **viewportHeight**: 720px
- **defaultCommandTimeout**: 10 seconds
- **requestTimeout**: 10 seconds
- **responseTimeout**: 10 seconds

### Support Files

- **cypress/support/commands.ts** - Custom Cypress commands for common operations
- **cypress/support/e2e.ts** - Global E2E test setup

## Test Files

### 1. Authentication Tests (`cypress/e2e/auth.cy.ts`)

Tests for user registration, login, and session management:

**User Registration:**
- Display registration page
- Register new user successfully
- Validate password matching
- Validate email format
- Navigation to login page

**User Login:**
- Display login page
- Login with valid credentials
- Show error for invalid credentials
- Show error for empty fields
- Loading state during submission
- Navigation to registration page

**Session Management:**
- Persist session after login
- Maintain authentication across page reloads

### 2. Borrowing Workflow Tests (`cypress/e2e/borrowing-workflow.cy.ts`)

Tests for the complete borrowing lifecycle:

**Family Creation:**
- Display family creation option
- Create new family
- Validate required fields

**Book Search:**
- Display search functionality
- Search by title
- Search by author
- Handle no results
- Clear search results

**Book Request Workflow:**
- Display request button on book details
- Request book successfully
- Handle unavailable books
- Display queue position

**Borrowing Approval Flow:**
- Display pending requests
- Approve book requests
- Reject book requests
- Display approved books in user library
- Show due dates for borrowed books
- Return borrowed books
- Track status changes

**Borrowing History:**
- Display borrowing history
- Show book details in history

## Running Tests

### Open Cypress Test Runner (Interactive Mode)

```bash
npm run cypress:open
# or
npm run test:e2e:watch
```

This opens the Cypress Test Runner where you can:
- View all test files
- Run individual tests
- Watch tests execute in real-time
- Debug test failures

### Run All Tests (Headless Mode)

```bash
npm run cypress:run
# or
npm run test:e2e
```

This runs all tests in headless mode and outputs results to the terminal.

### Run Tests with Browser Visible

```bash
npm run cypress:run:headed
```

### Run Tests in Chrome Browser

```bash
npm run cypress:run:chrome
```

## Test Execution Requirements

Before running tests, ensure:

1. **Development server is running:**
   ```bash
   npm run dev
   ```
   The app must be accessible at `http://localhost:3000`

2. **Database is set up:**
   - Prisma migrations are applied
   - Firebase is configured (if using Firebase auth)

3. **Environment variables are configured:**
   - `.env` file is properly set up with required credentials

## Custom Commands

The following custom commands are available in tests:

```typescript
// Register a new user
cy.registerUser(email, password);

// Login with credentials
cy.loginUser(email, password);

// Logout user
cy.logoutUser();

// Check if user is authenticated
cy.checkAuthenticated();

// Check if user is not authenticated
cy.checkNotAuthenticated();
```

## Test Data Selectors

Tests use the following selectors to interact with the application:

### Form Inputs
- `input[name="email"]` - Email input field
- `input[name="password"]` - Password input field
- `input[name="confirm-password"]` - Confirm password field
- `input[name="familyName"]` - Family name input
- `input[placeholder*="search" i]` - Search input

### Buttons
- `button[type="submit"]` - Form submission button
- `button[data-testid="logout-btn"]` - Logout button
- `button[aria-label*="clear" i]` - Clear button

### Data Test IDs
- `[data-testid="book-item"]` - Book list item
- `[data-testid="pending-request"]` - Pending request item
- `[data-testid="borrowed-book"]` - Borrowed book item
- `[data-testid="history-item"]` - History item

## Best Practices

1. **Use data-testid attributes** - Add `data-testid` to important UI elements for reliable test selectors
2. **Wait for elements** - Use Cypress's built-in waiting mechanisms
3. **Test user flows** - Focus on critical user journeys
4. **Keep tests isolated** - Each test should be independent
5. **Use meaningful assertions** - Make test failures clear and actionable

## Debugging Tests

### View Test Logs

```bash
npm run cypress:run -- --spec "cypress/e2e/auth.cy.ts"
```

### Debug in Browser

1. Open Cypress Test Runner: `npm run cypress:open`
2. Click on a test to run it
3. Use the browser DevTools (F12) to inspect elements
4. Use `cy.debug()` in tests to pause execution

### View Network Requests

In the Cypress Test Runner, click the "Network" tab to see all API calls made during tests.

## Continuous Integration

To run Cypress in CI/CD pipelines:

```bash
# Install dependencies
npm ci

# Build the application
npm run build

# Start the application
npm run start &

# Wait for app to be ready
sleep 5

# Run tests
npm run cypress:run
```

## Troubleshooting

### Tests timeout
- Increase `defaultCommandTimeout` in `cypress.config.ts`
- Ensure the development server is running
- Check network connectivity

### Element not found
- Verify the selector is correct
- Use `cy.debug()` to pause and inspect
- Check if element is visible/enabled

### Authentication fails
- Verify Firebase/auth credentials in `.env`
- Check if user registration is working
- Review auth context implementation

### Tests pass locally but fail in CI
- Ensure environment variables are set in CI
- Check for timing issues (use explicit waits)
- Verify database state is clean before tests

## File Structure

```
cypress/
├── e2e/
│   ├── auth.cy.ts                 # Authentication flow tests
│   └── borrowing-workflow.cy.ts    # Borrowing workflow tests
├── support/
│   ├── commands.ts                # Custom Cypress commands
│   └── e2e.ts                     # Global E2E setup
└── cypress.config.ts              # Cypress configuration
```

## Next Steps

1. **Add more test coverage** - Add tests for edge cases and error scenarios
2. **Implement page objects** - Create page object models for better maintainability
3. **Add visual regression tests** - Use Cypress plugins for visual testing
4. **Set up CI/CD integration** - Integrate Cypress with GitHub Actions or other CI tools
5. **Add performance tests** - Monitor application performance during tests

## Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Testing Library Selectors](https://testing-library.com/docs/queries/about)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
