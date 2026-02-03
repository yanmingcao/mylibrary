/// <reference types="cypress" />

/**
 * Custom Cypress commands for the community library system
 */

// Register a new user
Cypress.Commands.add("registerUser", (email: string, password: string) => {
  cy.visit("/register");
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('input[name="confirm-password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Login with email and password
Cypress.Commands.add("loginUser", (email: string, password: string) => {
  cy.visit("/login");
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Logout user
Cypress.Commands.add("logoutUser", () => {
  cy.get('button[data-testid="logout-btn"]').click();
});

// Check if user is authenticated
Cypress.Commands.add("checkAuthenticated", () => {
  cy.visit("/");
  cy.get('button[data-testid="logout-btn"]').should("exist");
});

// Check if user is not authenticated
Cypress.Commands.add("checkNotAuthenticated", () => {
  cy.visit("/");
  cy.get('a[href="/login"]').should("exist");
});

declare global {
  namespace Cypress {
    interface Chainable {
      registerUser(email: string, password: string): Chainable<void>;
      loginUser(email: string, password: string): Chainable<void>;
      logoutUser(): Chainable<void>;
      checkAuthenticated(): Chainable<void>;
      checkNotAuthenticated(): Chainable<void>;
    }
  }
}

export {};
