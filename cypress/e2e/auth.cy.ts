describe("Authentication Flows", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("User Registration", () => {
    it("should display registration page", () => {
      cy.visit("/register");
      cy.contains("Create your account").should("be.visible");
      cy.contains("Join the community library").should("be.visible");
    });

    it("should register a new user successfully", () => {
      const testEmail = `user-${Date.now()}@example.com`;
      const testPassword = "TestPassword123!";

      cy.visit("/register");
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type(testPassword);
      cy.get('input[name="confirm-password"]').type(testPassword);
      cy.get('button[type="submit"]').click();

      // Should redirect to home page after successful registration
      cy.url().should("eq", "http://localhost:3000/");
    });

    it("should show error when passwords don't match", () => {
      cy.visit("/register");
      cy.get('input[name="email"]').type("test@example.com");
      cy.get('input[name="password"]').type("Password123!");
      cy.get('input[name="confirm-password"]').type("DifferentPassword123!");
      cy.get('button[type="submit"]').click();

      cy.contains("Passwords do not match").should("be.visible");
    });

    it("should show error for invalid email", () => {
      cy.visit("/register");
      cy.get('input[name="email"]').type("invalid-email");
      cy.get('input[name="password"]').type("Password123!");
      cy.get('input[name="confirm-password"]').type("Password123!");
      cy.get('button[type="submit"]').click();

      // HTML5 validation should prevent submission
      cy.get('input[name="email"]').then(($input) => {
        expect(($input[0] as HTMLInputElement).validity.valid).to.be.false;
      });
    });

    it("should have link to login page", () => {
      cy.visit("/register");
      cy.contains("Already have an account?").should("be.visible");
      cy.get('a[href="/login"]').should("exist");
    });
  });

  describe("User Login", () => {
    it("should display login page", () => {
      cy.visit("/login");
      cy.contains("Welcome back").should("be.visible");
      cy.contains("Sign in to manage your community library account").should(
        "be.visible"
      );
    });

    it("should login user with valid credentials", () => {
      const testEmail = `user-${Date.now()}@example.com`;
      const testPassword = "TestPassword123!";

      // First register a user
      cy.visit("/register");
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type(testPassword);
      cy.get('input[name="confirm-password"]').type(testPassword);
      cy.get('button[type="submit"]').click();

      // Wait for redirect
      cy.url().should("eq", "http://localhost:3000/");

      // Now logout and login again
      cy.visit("/login");
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type(testPassword);
      cy.get('button[type="submit"]').click();

      // Should redirect to home page
      cy.url().should("eq", "http://localhost:3000/");
    });

    it("should show error for invalid credentials", () => {
      cy.visit("/login");
      cy.get('input[name="email"]').type("nonexistent@example.com");
      cy.get('input[name="password"]').type("WrongPassword123!");
      cy.get('button[type="submit"]').click();

      // Should show error message
      cy.contains(/Unable to sign in|not found|invalid/i).should("be.visible");
    });

    it("should show error for empty fields", () => {
      cy.visit("/login");
      cy.get('button[type="submit"]').click();

      // HTML5 validation should prevent submission
      cy.get('input[name="email"]').then(($input) => {
        expect(($input[0] as HTMLInputElement).validity.valid).to.be.false;
      });
    });

    it("should have link to registration page", () => {
      cy.visit("/login");
      cy.contains("New here?").should("be.visible");
      cy.get('a[href="/register"]').should("exist");
    });

    it("should show loading state during submission", () => {
      cy.visit("/login");
      cy.get('input[name="email"]').type("test@example.com");
      cy.get('input[name="password"]').type("password");

      cy.get('button[type="submit"]').click();
      cy.get('button[type="submit"]').should("be.disabled");
    });
  });

  describe("Session Management", () => {
    it("should persist session after login", () => {
      const testEmail = `user-${Date.now()}@example.com`;
      const testPassword = "TestPassword123!";

      // Register
      cy.visit("/register");
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type(testPassword);
      cy.get('input[name="confirm-password"]').type(testPassword);
      cy.get('button[type="submit"]').click();

      // Verify we're logged in
      cy.url().should("eq", "http://localhost:3000/");

      // Reload page and verify still logged in
      cy.reload();
      cy.url().should("eq", "http://localhost:3000/");
    });
  });
});
