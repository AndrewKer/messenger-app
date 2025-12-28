/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    login(): Chainable<string>;
    authenticatedRequest(
      method: string,
      url: string,
      body?: any
    ): Chainable<Response<any>>;
  }
}