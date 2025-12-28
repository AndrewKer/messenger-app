/* eslint-disable @typescript-eslint/no-explicit-any */
describe('Full Integration Test', () => {
  it('should complete a full workflow', () => {
    // 1. Generate token
    cy.login();

    // 2. Create multiple messages
    const users = ['alice', 'bob', 'charlie'];
    users.forEach((user) => {
      cy.authenticatedRequest('POST', '/add-message', {
        user,
        message: `Hello from ${user}`,
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });

    // 3. Retrieve all messages
    cy.authenticatedRequest('GET', '/messages')
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.length).to.be.greaterThan(0);
      });

    // 4. Search for specific user
    cy.authenticatedRequest('GET', '/messages?user=alice')
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.length).to.be.greaterThan(0);
        response.body.data.forEach((msg: any) => {
          expect(msg.user).to.eq('alice');
        });
      });

    // 5. Test pagination
    cy.authenticatedRequest('GET', '/messages?page=1&limit=2')
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.pagination.page).to.eq(1);
        expect(response.body.pagination.limit).to.eq(2);
      });
  });
});