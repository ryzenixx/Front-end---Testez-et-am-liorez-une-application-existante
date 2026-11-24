import { credentials } from '../support/auth';

describe('Registration', () => {
  it('registers a library agent', () => {
    const agent = {
      firstName: 'Alex',
      lastName: 'Durand',
      ...credentials,
    };

    cy.intercept('POST', '/api/register', { statusCode: 201 }).as('register');
    cy.visit('/register', {
      onBeforeLoad(window) {
        cy.stub(window, 'alert').as('registrationNotice');
      },
    });

    cy.get('input[formcontrolname="firstName"]').type(agent.firstName);
    cy.get('input[formcontrolname="lastName"]').type(agent.lastName);
    cy.get('input[formcontrolname="login"]').type(agent.login);
    cy.get('input[formcontrolname="password"]').type(agent.password);
    cy.contains('button', 'Register').click();

    cy.wait('@register').its('request.body').should('deep.equal', agent);
    cy.get('@registrationNotice').should('have.been.calledWith', 'SUCCESS!! :-)');
  });

  it('clears the registration form when cancelled', () => {
    cy.visit('/register');
    cy.get('input[formcontrolname="firstName"]').type('Alex');
    cy.get('input[formcontrolname="login"]').type(credentials.login);

    cy.contains('button', 'Cancel').click();

    cy.get('input[formcontrolname="firstName"]').should('have.value', '');
    cy.get('input[formcontrolname="login"]').should('have.value', '');
  });
});
