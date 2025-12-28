/* eslint-disable @typescript-eslint/no-explicit-any */
describe('Messages API', () => {
  before(() => {
    // Generate token before all tests
    cy.login();
  });

  describe('POST /api/add-message', () => {
    it('should create a new message', () => {
      const messageData = {
        user: 'cypress_user',
        message: 'Test message from Cypress',
      };

      cy.authenticatedRequest('POST', '/add-message', messageData)
        .then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body.success).to.be.true;
          expect(response.body.data).to.have.property('id');
          expect(response.body.data).to.have.property('user', messageData.user);
          expect(response.body.data).to.have.property('message', messageData.message);
          expect(response.body.data).to.have.property('timestamp');
          expect(response.body).to.have.property('totalMessages');
        });
    });

    it('should fail when user is missing', () => {
      cy.authenticatedRequest('POST', '/add-message', {
        message: 'Message without user',
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.eq('User and message are required');
      });
    });

    it('should fail when message is missing', () => {
      cy.authenticatedRequest('POST', '/add-message', {
        user: 'test_user',
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.eq('User and message are required');
      });
    });

    it('should fail with empty body', () => {
      cy.authenticatedRequest('POST', '/add-message', {})
        .then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.error).to.eq('User and message are required');
        });
    });

    it('should fail without authentication', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/add-message`,
        body: {
          user: 'test_user',
          message: 'Test message',
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.eq('Unauthorized - Missing token');
      });
    });
  });
});