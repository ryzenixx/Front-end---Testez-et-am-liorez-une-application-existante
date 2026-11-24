export const credentials = {
  login: 'agent.e2e',
  password: 'test-password',
};

export function mockLogin(): string {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).replace(/=+$/, '');
  const token = `header.${payload}.signature`;

  cy.intercept('POST', '/api/login', {
    statusCode: 200,
    headers: { 'content-type': 'text/plain' },
    body: token,
  }).as('login');

  return token;
}

export function submitLogin(): void {
  cy.get('#login').type(credentials.login);
  cy.get('#password').type(credentials.password);
  cy.contains('button', 'Sign in').click();
}
