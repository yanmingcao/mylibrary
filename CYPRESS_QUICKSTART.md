# Cypress E2E Testing - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Step 2: Open Cypress Test Runner

In a new terminal:

```bash
npm run cypress:open
```

This opens the Cypress Test Runner where you can:
- See all available tests
- Run tests interactively
- Watch tests execute in real-time
- Debug failures

### Step 3: Run Tests

**Interactive Mode (Recommended for Development):**
```bash
npm run cypress:open
# or
npm run test:e2e:watch
```

**Headless Mode (CI/CD):**
```bash
npm run cypress:run
# or
npm run test:e2e
```

**With Browser Visible:**
```bash
npm run cypress:run:headed
```

## 📋 Available Test Suites

### 1. Authentication Tests (`auth.cy.ts`)
Tests user registration, login, and session management:
- ✅ User registration flow
- ✅ User login flow
- ✅ Session persistence
- ✅ Error handling

**Run only auth tests:**
```bash
npx cypress run --spec "cypress/e2e/auth.cy.ts"
```

### 2. Borrowing Workflow Tests (`borrowing-workflow.cy.ts`)
Tests the complete book borrowing lifecycle:
- ✅ Family creation
- ✅ Book search
- ✅ Book request workflow
- ✅ Borrowing approval flow
- ✅ Book returns
- ✅ Borrowing history

**Run only borrowing tests:**
```bash
npx cypress run --spec "cypress/e2e/borrowing-workflow.cy.ts"
```

## 🎯 Common Commands

```bash
# Open Cypress Test Runner (interactive)
npm run cypress:open

# Run all tests (headless)
npm run cypress:run

# Run tests with browser visible
npm run cypress:run:headed

# Run tests in Chrome
npm run cypress:run:chrome

# Run specific test file
npx cypress run --spec "cypress/e2e/auth.cy.ts"

# Run tests with specific browser
npx cypress run --browser firefox
```

## 📁 Project Structure

```
cypress/
├── e2e/
│   ├── auth.cy.ts                 # Authentication tests
│   └── borrowing-workflow.cy.ts    # Borrowing workflow tests
├── support/
│   ├── commands.ts                # Custom commands
│   └── e2e.ts                     # Global setup
├── tsconfig.json                  # TypeScript config
└── cypress.config.ts              # Main config (root)
```

## 🔧 Configuration

**cypress.config.ts** (root directory):
- Base URL: `http://localhost:3000`
- Viewport: 1280x720
- Timeouts: 10 seconds

## ✨ Custom Commands

Use these in your tests:

```typescript
// Register a new user
cy.registerUser("email@example.com", "password123");

// Login
cy.loginUser("email@example.com", "password123");

// Logout
cy.logoutUser();

// Check if authenticated
cy.checkAuthenticated();

// Check if not authenticated
cy.checkNotAuthenticated();
```

## 🐛 Debugging

### View Test Logs
```bash
npm run cypress:run -- --spec "cypress/e2e/auth.cy.ts"
```

### Debug in Browser
1. Open Cypress: `npm run cypress:open`
2. Click a test to run it
3. Press F12 to open DevTools
4. Use `cy.debug()` in tests to pause execution

### Common Issues

**Tests timeout:**
- Ensure dev server is running: `npm run dev`
- Check network connectivity
- Increase timeout in `cypress.config.ts`

**Element not found:**
- Verify selector is correct
- Use `cy.debug()` to inspect
- Check if element is visible

**Authentication fails:**
- Verify `.env` file is configured
- Check Firebase credentials
- Ensure auth context is working

## 📊 Test Coverage

### Authentication (auth.cy.ts)
- User registration with validation
- User login with error handling
- Session persistence
- Password matching validation
- Email format validation

### Borrowing Workflow (borrowing-workflow.cy.ts)
- Family creation
- Book search (title, author)
- Book request workflow
- Request approval/rejection
- Book returns
- Borrowing history
- Due date tracking

## 🎓 Next Steps

1. **Add test data selectors** - Add `data-testid` attributes to UI elements
2. **Expand test coverage** - Add more edge cases and error scenarios
3. **Set up CI/CD** - Integrate with GitHub Actions or similar
4. **Add visual tests** - Use Cypress plugins for visual regression testing
5. **Performance monitoring** - Track test execution times

## 📚 Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [API Reference](https://docs.cypress.io/api/table-of-contents)

## ⚡ Pro Tips

1. **Use `cy.debug()`** to pause tests and inspect state
2. **Use `cy.pause()`** to step through tests manually
3. **Use `cy.log()`** to add custom messages to test logs
4. **Use `cy.screenshot()`** to capture test state
5. **Use `cy.intercept()`** to mock API responses

## 🚨 Troubleshooting

### Port 3000 already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

### Clear Cypress cache
```bash
rm -rf ~/.cache/Cypress
# or
npx cypress cache clear
```

### Update Cypress
```bash
npm install --save-dev cypress@latest
```

---

**Happy Testing! 🎉**
