/* eslint-disable @typescript-eslint/no-explicit-any */
describe('Messages API', () => {
  before(() => {
    // Generate token before all tests
    cy.login();
  });

  describe('GET /api/messages', () => {
    beforeEach(() => {
      // Create test messages
      const messages = [
        { user: 'alice', message: 'Hello from Alice' },
        { user: 'bob', message: 'Hello from Bob' },
        { user: 'alice', message: 'Another message from Alice' },
      ];

      messages.forEach((msg) => {
        cy.authenticatedRequest('POST', '/add-message', msg);
      });
    });

    it('should get all messages with default pagination', () => {
      cy.authenticatedRequest('GET', '/messages')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.success).to.be.true;
          expect(response.body.data).to.be.an('array');
          expect(response.body.pagination).to.have.property('page', 1);
          expect(response.body.pagination).to.have.property('limit', 10);
          expect(response.body.pagination).to.have.property('total');
          expect(response.body.pagination).to.have.property('totalPages');
        });
    });

    it('should paginate messages correctly', () => {
      cy.authenticatedRequest('GET', '/messages?page=1&limit=2')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.data.length).to.be.at.most(2);
          expect(response.body.pagination.page).to.eq(1);
          expect(response.body.pagination.limit).to.eq(2);
        });
    });

    it('should filter messages by user', () => {
      cy.authenticatedRequest('GET', '/messages?user=alice')
        .then((response) => {
          expect(response.status).to.eq(200);
          response.body.data.forEach((msg: any) => {
            expect(msg.user.toLowerCase()).to.include('alice');
          });
        });
    });

    it('should filter messages by content', () => {
      cy.authenticatedRequest('GET', '/messages?message=hello')
        .then((response) => {
          expect(response.status).to.eq(200);
          response.body.data.forEach((msg: any) => {
            expect(msg.message.toLowerCase()).to.include('hello');
          });
        });
    });

    it('should combine multiple filters', () => {
      cy.authenticatedRequest('GET', '/messages?user=alice&message=hello')
        .then((response) => {
          expect(response.status).to.eq(200);
          response.body.data.forEach((msg: any) => {
            expect(msg.user.toLowerCase()).to.include('alice');
            expect(msg.message.toLowerCase()).to.include('hello');
          });
        });
    });

    it('should reject invalid pagination parameters', () => {
      cy.authenticatedRequest('GET', '/messages?page=0&limit=-5')
        .then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body.error).to.eq('Page and limit must be greater than 0');
        });
    });
  });
});