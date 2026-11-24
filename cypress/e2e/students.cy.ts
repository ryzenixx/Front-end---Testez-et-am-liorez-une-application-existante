import { mockLogin, submitLogin } from '../support/auth';

const student = {
  id: 42,
  firstName: 'Camille',
  lastName: 'Martin',
  email: 'camille.martin@example.org',
};

describe('Students', () => {
  beforeEach(() => {
    mockLogin();
    cy.intercept('GET', '/api/students', { body: [student] }).as('students');
    cy.intercept('GET', '/api/students/42', { body: student }).as('student');

    cy.visit('/login');
    submitLogin();
    cy.wait('@students');
  });

  it('displays a student from the list', () => {
    cy.contains('tr', 'Camille Martin').should('contain.text', student.email);
    cy.contains('a', 'Camille Martin').click();

    cy.wait('@student');
    cy.location('pathname').should('eq', '/students/42');
    cy.contains('h1', 'Student details').should('be.visible');
    cy.contains('dd', student.firstName).should('be.visible');
    cy.contains('dd', student.lastName).should('be.visible');
    cy.contains('dd', student.email).should('be.visible');
  });

  it('adds a student and opens their details', () => {
    const details = {
      firstName: 'Morgan',
      lastName: 'Bernard',
      email: 'morgan.bernard@example.org',
    };
    const created = { id: 43, ...details };
    cy.intercept('POST', '/api/students', { statusCode: 201, body: created }).as('createStudent');
    cy.intercept('GET', '/api/students/43', { body: created }).as('createdStudent');

    cy.contains('a', 'Add student').click();
    cy.contains('h1', 'Add student').should('be.visible');
    cy.get('#first-name').type(details.firstName);
    cy.get('#last-name').type(details.lastName);
    cy.get('#student-email').type(details.email);
    cy.contains('button', 'Add student').click();

    cy.wait('@createStudent').its('request.body').should('deep.equal', details);
    cy.wait('@createdStudent');
    cy.location('pathname').should('eq', '/students/43');
    cy.contains('h1', 'Student details').should('be.visible');
    cy.contains('dd', details.email).should('be.visible');
  });

  it('edits an existing student', () => {
    const details = {
      firstName: student.firstName,
      lastName: student.lastName,
      email: 'camille.durand@example.org',
    };
    const updated = { id: student.id, ...details };
    cy.intercept('PUT', '/api/students/42', { body: updated }).as('updateStudent');

    cy.contains('a', 'Camille Martin').click();
    cy.wait('@student');
    cy.contains('a', 'Edit').click();
    cy.wait('@student');
    cy.contains('h1', 'Edit student').should('be.visible');
    cy.get('#first-name').should('have.value', student.firstName);
    cy.get('#last-name').should('have.value', student.lastName);
    cy.get('#student-email').should('have.value', student.email);

    cy.intercept('GET', '/api/students/42', { body: updated }).as('updatedStudent');
    cy.get('#student-email').clear().type(details.email);
    cy.contains('button', 'Save changes').click();

    cy.wait('@updateStudent').its('request.body').should('deep.equal', details);
    cy.wait('@updatedStudent');
    cy.location('pathname').should('eq', '/students/42');
    cy.contains('dd', details.email).should('be.visible');
  });

  it('deletes a student after confirmation', () => {
    cy.intercept('DELETE', '/api/students/42', { statusCode: 204 }).as('deleteStudent');

    cy.contains('a', 'Camille Martin').click();
    cy.wait('@student');
    cy.contains('button', /^Delete$/).click();
    cy.contains('Delete this student?').should('be.visible');

    cy.intercept('GET', '/api/students', { body: [] }).as('emptyList');
    cy.contains('button', 'Delete student').click();

    cy.wait('@deleteStudent');
    cy.wait('@emptyList');
    cy.location('pathname').should('eq', '/students');
    cy.contains('No students.').should('be.visible');
  });
});
