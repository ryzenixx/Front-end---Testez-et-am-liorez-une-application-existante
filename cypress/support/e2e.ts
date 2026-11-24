import '@cypress/code-coverage/support';

afterEach(() => {
  cy.window().should('have.property', '__coverage__');
});
