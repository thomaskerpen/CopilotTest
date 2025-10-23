describe('Todo App E2E', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should show the login form', () => {
    cy.contains('Login');
  cy.get('input[placeholder="Username"]').should('exist');
  cy.get('input[placeholder="Password"]').should('exist');
  });

  it('should login, add and complete a todo', () => {
    const username = 'Thomas';
    const password = '12345';
    // Login
    cy.get('input[placeholder="Username"]').type(username);
    cy.get('input[placeholder="Password"]').type(password);
    cy.get('button[type="submit"]').contains(/login/i).click();
    // Add todo
    cy.get('input[placeholder="Add a new todo"]').type('Cypress Aufgabe');
    cy.get('input[type="date"]').type('2025-12-31');
    cy.get('button[type="submit"]').contains(/add/i).click();
    cy.contains('Cypress Aufgabe');
    // Complete todo
    cy.contains('Cypress Aufgabe')
      .closest('li')
      .find('input[type="checkbox"]')
      .check({ force: true })
      .should('be.checked');
  });

  it('complete login', function() {
    cy.get('#root input[type="text"]').type('Thomas');
    cy.get('#root input[type="password"]').type('12345');
    cy.get('#root button').click();
    cy.get('#root input[type="text"]').click();
    cy.get('#root input[type="text"]').clear();
    cy.get('#root input[type="text"]').type('Hello Task 1');
    cy.get('#root input[type="date"]').click();
    cy.get('#root input[type="date"]').click();
    cy.get('#root button[type="submit"]').click();
  });
});
