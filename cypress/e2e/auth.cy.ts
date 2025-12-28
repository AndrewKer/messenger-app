describe('Authentication', () => {
  it('should generate a valid JWT token', () => {
    cy.request('GET', `${Cypress.env('apiUrl')}/test/generate-token`)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('token');
        expect(response.body.token).to.be.a('string');
        expect(response.body.token.length).to.be.greaterThan(0);
      });
  });

  it('should reject requests without token', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/messages`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.error).to.eq('Unauthorized - Missing token');
    });
  });

  it('should reject requests with invalid token', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/messages`,
      headers: {
        Authorization: 'Bearer invalid.token.here',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.error).to.eq('Unauthorized - Invalid or expired token');
    });
  });
});