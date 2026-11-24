import { credentials, mockLogin, submitLogin } from '../support/auth';

describe('Sign in', () => {
  it('opens the student list after signing in', () => {
    const token = mockLogin();
    cy.intercept('GET', '/api/students', { body: [] }).as('students');

    cy.visit('/students');
    cy.location('pathname').should('eq', '/login');
    cy.contains('h1', 'Sign in').should('be.visible');
    submitLogin();

    cy.wait('@login').its('request.body').should('deep.equal', credentials);
    cy.wait('@students').its('request.headers.authorization').should('eq', `Bearer ${token}`);
    cy.location('pathname').should('eq', '/students');
    cy.contains('h1', 'Students').should('be.visible');
    cy.contains('No students.').should('be.visible');
  });

  it('protects the student list again after signing out', () => {
    mockLogin();
    cy.intercept('GET', '/api/students', { body: [] }).as('students');

    cy.visit('/login');
    submitLogin();
    cy.wait('@students');

    cy.contains('button', 'Sign out').click();
    cy.location('pathname').should('eq', '/login');
    cy.get('#login').should('be.visible');

    cy.go('back');
    cy.location('pathname').should('eq', '/login');
    cy.get('#password').should('be.visible');
  });
});
