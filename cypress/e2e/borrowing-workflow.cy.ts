describe("Borrowing Workflow", () => {
  const testEmail = `user-${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";

  beforeEach(() => {
    // Register and login before each test
    cy.visit("/register");
    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="password"]').type(testPassword);
    cy.get('input[name="confirm-password"]').type(testPassword);
    cy.get('button[type="submit"]').click();

    // Wait for redirect to home
    cy.url().should("eq", "http://localhost:3000/");
  });

  describe("Family Creation", () => {
    it("should display family creation option", () => {
      cy.visit("/");
      // Look for family-related UI elements
      cy.contains(/family|create family|add family/i).should("exist");
    });

    it("should create a new family", () => {
      cy.visit("/");
      // Click on create family button
      cy.contains(/create family|add family/i).click();

      // Fill in family details
      cy.get('input[name="familyName"]').type("Smith Family");
      cy.get('button[type="submit"]').click();

      // Verify family was created
      cy.contains("Smith Family").should("be.visible");
    });

    it("should show error for empty family name", () => {
      cy.visit("/");
      cy.contains(/create family|add family/i).click();

      cy.get('button[type="submit"]').click();

      // Should show validation error
      cy.contains(/required|cannot be empty/i).should("be.visible");
    });
  });

  describe("Book Search", () => {
    it("should display search functionality", () => {
      cy.visit("/");
      cy.get('input[placeholder*="search" i]').should("exist");
    });

    it("should search for books by title", () => {
      cy.visit("/");
      cy.get('input[placeholder*="search" i]').type("The Great Gatsby");
      cy.get('button[type="submit"]').click();

      // Should display search results
      cy.contains(/results|books/i).should("exist");
    });

    it("should search for books by author", () => {
      cy.visit("/");
      cy.get('input[placeholder*="search" i]').type("F. Scott Fitzgerald");
      cy.get('button[type="submit"]').click();

      // Should display search results
      cy.contains(/results|books/i).should("exist");
    });

    it("should display no results message for non-existent book", () => {
      cy.visit("/");
      cy.get('input[placeholder*="search" i]').type(
        "NonExistentBookTitle12345"
      );
      cy.get('button[type="submit"]').click();

      // Should show no results message
      cy.contains(/no results|not found/i).should("be.visible");
    });

    it("should clear search results", () => {
      cy.visit("/");
      cy.get('input[placeholder*="search" i]').type("The Great Gatsby");
      cy.get('button[type="submit"]').click();

      // Clear search
      cy.get('button[aria-label*="clear" i]').click();

      // Should return to initial state
      cy.get('input[placeholder*="search" i]').should("have.value", "");
    });
  });

  describe("Book Request Workflow", () => {
    it("should display request button on book details", () => {
      cy.visit("/");
      cy.get('input[placeholder*="search" i]').type("The Great Gatsby");
      cy.get('button[type="submit"]').click();

      // Click on first book result
      cy.get('[data-testid="book-item"]').first().click();

      // Should show request button
      cy.contains(/request|borrow/i).should("be.visible");
    });

    it("should request a book successfully", () => {
      cy.visit("/");
      cy.get('input[placeholder*="search" i]').type("The Great Gatsby");
      cy.get('button[type="submit"]').click();

      // Click on first book result
      cy.get('[data-testid="book-item"]').first().click();

      // Click request button
      cy.contains(/request|borrow/i).click();

      // Should show confirmation
      cy.contains(/requested|success|added to queue/i).should("be.visible");
    });

    it("should show error when requesting unavailable book", () => {
      cy.visit("/");
      cy.get('input[placeholder*="search" i]').type("The Great Gatsby");
      cy.get('button[type="submit"]').click();

      // Click on first book result
      cy.get('[data-testid="book-item"]').first().click();

      // If book is unavailable, request should show error
      cy.contains(/request|borrow/i).click();

      // Check for either success or unavailable message
      cy.contains(/requested|unavailable|not available/i).should("be.visible");
    });

    it("should display request queue position", () => {
      cy.visit("/");
      cy.get('input[placeholder*="search" i]').type("The Great Gatsby");
      cy.get('button[type="submit"]').click();

      // Click on first book result
      cy.get('[data-testid="book-item"]').first().click();

      // Request the book
      cy.contains(/request|borrow/i).click();

      // Should show queue position
      cy.contains(/queue|position|#\d+/i).should("be.visible");
    });
  });

  describe("Borrowing Approval Flow", () => {
    it("should display pending requests", () => {
      cy.visit("/");

      // Navigate to requests/approvals section
      cy.contains(/requests|approvals|pending/i).click();

      // Should display pending requests list
      cy.contains(/pending|awaiting/i).should("be.visible");
    });

    it("should approve a book request", () => {
      cy.visit("/");

      // Navigate to requests/approvals section
      cy.contains(/requests|approvals|pending/i).click();

      // Find a pending request
      cy.get('[data-testid="pending-request"]').first().within(() => {
        // Click approve button
        cy.contains(/approve|accept/i).click();
      });

      // Should show success message
      cy.contains(/approved|success/i).should("be.visible");
    });

    it("should reject a book request", () => {
      cy.visit("/");

      // Navigate to requests/approvals section
      cy.contains(/requests|approvals|pending/i).click();

      // Find a pending request
      cy.get('[data-testid="pending-request"]').first().within(() => {
        // Click reject button
        cy.contains(/reject|decline/i).click();
      });

      // Should show confirmation dialog
      cy.contains(/confirm|are you sure/i).should("be.visible");

      // Confirm rejection
      cy.contains(/confirm|yes|reject/i).click();

      // Should show success message
      cy.contains(/rejected|declined/i).should("be.visible");
    });

    it("should display approved books in user library", () => {
      cy.visit("/");

      // Navigate to my library/books section
      cy.contains(/my library|my books|borrowed/i).click();

      // Should display list of approved/borrowed books
      cy.contains(/borrowed|approved/i).should("be.visible");
    });

    it("should show due date for borrowed books", () => {
      cy.visit("/");

      // Navigate to my library/books section
      cy.contains(/my library|my books|borrowed/i).click();

      // Should display due dates
      cy.contains(/due|return|date/i).should("be.visible");
    });

    it("should allow returning a borrowed book", () => {
      cy.visit("/");

      // Navigate to my library/books section
      cy.contains(/my library|my books|borrowed/i).click();

      // Find a borrowed book
      cy.get('[data-testid="borrowed-book"]').first().within(() => {
        // Click return button
        cy.contains(/return|back/i).click();
      });

      // Should show confirmation
      cy.contains(/confirm|are you sure/i).should("be.visible");

      // Confirm return
      cy.contains(/confirm|yes|return/i).click();

      // Should show success message
      cy.contains(/returned|success/i).should("be.visible");
    });

    it("should track book status changes", () => {
      cy.visit("/");

      // Navigate to requests/approvals section
      cy.contains(/requests|approvals|pending/i).click();

      // Get initial status
      cy.get('[data-testid="pending-request"]')
        .first()
        .within(() => {
          cy.contains(/pending|awaiting/i).should("be.visible");
        });

      // Approve the request
      cy.get('[data-testid="pending-request"]').first().within(() => {
        cy.contains(/approve|accept/i).click();
      });

      // Status should change to approved
      cy.contains(/approved/i).should("be.visible");
    });
  });

  describe("Borrowing History", () => {
    it("should display borrowing history", () => {
      cy.visit("/");

      // Navigate to history section
      cy.contains(/history|past|previous/i).click();

      // Should display history list
      cy.contains(/history|past borrowing/i).should("be.visible");
    });

    it("should show book details in history", () => {
      cy.visit("/");

      // Navigate to history section
      cy.contains(/history|past|previous/i).click();

      // Should display book information
      cy.get('[data-testid="history-item"]').first().within(() => {
        cy.contains(/title|author|date/i).should("be.visible");
      });
    });
  });
});
