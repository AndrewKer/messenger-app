/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to generate and store JWT token
       * @example cy.login()
       */
      login(): Chainable<string>;

      /**
       * Custom command to make authenticated API request
       * @example cy.authenticatedRequest('GET', '/api/messages')
       */
      authenticatedRequest(
        method: string,
        url: string,
        body?: any
      ): Chainable<Response<any>>;
    }
  }
}

// Custom command to login and get JWT token
Cypress.Commands.add("login", () => {
  return cy
    .request({
      method: "GET",
      url: `${Cypress.env("apiUrl")}/test/generate-token`,
      failOnStatusCode: false,
    })
    .then((response) => {
      expect(response.status).to.eq(200);
      const token = response.body.token;
      Cypress.env("authToken", token);
      return token;
    });
});

// Custom command for authenticated requests
Cypress.Commands.add("authenticatedRequest", (method, url, body = null) => {
  const token = Cypress.env("authToken");

  return cy.request({
    method,
    url: `${Cypress.env("apiUrl")}${url}`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
    failOnStatusCode: false,
  });
});

export {};
