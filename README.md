# Viceversa | Software Engineer Interview Challenge

## General pointers
We are looking for an experienced engineer who found the sweet spot between pragmatism and idealism.
Your challenge will be evaluated on:
 * Architectural decisions (also implied ones)
 * Test coverage 
 * Adherence to instructions  
 * Cost of further upgrades
 * Cost of maintenance
 * Readability
 * Commit history
 

**Please #1:** make it easy for us to try your project on our machines 🙏  
**Please #2:** if you start with a boilerplate/starter project make it the first commit separated from your contributions 🙏

> **Note:** To balance the need to best show what you can do and the precious time you are dedicating to us: if you want to add something that you would have included it in a real project but you can't do it in the test time constraints, feel free to mock it instead. Beats not letting us know you know 😁


## Requirements

You're building a simple messenger service.

We would like you to implement:

- a POST endpoint `/add-message` with body as follows, that adds this information to an in-memory store.  
As a **side effect**, when a message is successfully added, an event should be triggered that sends an email
 > you can mock the email sending by adding a console log "email sent to \${user} with \${message}" with a timeout of 1 second.  
You have freedom to design the `Message` object however you see fit.

**Bonus:** Generally we would like to prevent duplicate sending, but sometimes it makes sense to send a message with the same text to the same user. How can you handle this situation?

```javascript
{
    user: string,
    message: string,
}
```
example:
```javascript
{
    user: "123@email.com"
    message: "Lorem Ipsum"
}
```

- a GET endpoint `/messages` that returns the full list of user/messages, with filters by user, message body and pagination  

Note: In the future we expect more events to be triggered, of different kind (ex. event that sends an sms)! think about it

- add any kind of API authentication, explaining your choice 

- don't forget the tests!

- Please include a postman export in the repo to try your project

The requirements are very purposefully very easy so you can space and prove your competence however you see fit. Good luck! 😄

# General Information

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

This application has two main functionalities:

### Messenger App (UI)
User interface that displays the message history and a message input. This helps to visualize the potential user interactions in a user friendly interface. Socket.IO helps capture the userconnections and responds to the events.

### API Endpoints
- a POST endpoint `/add-message`: adds a message to be stored in-memory
- a GET endpoint `/messages`: fetch in-memory stored messages
- a test GET endpoint `/test/generate-token`: generates a valid token for testing in dev

### Future Improvements
This application can scale in different ways like:
- the implementation of the send email placeholder
- the implementation of the demo UI with the available services
- a DELETE endpoint to remove messages
- a database (based on current scope a relational database would suffice)
- additional body properties when adding messages (ex. sending images/files)
- a user login into the UI to use that user instead of the socket id
- a collection of events to be triggered on specific steps (ex. sending sms)

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication (JWT)

API authentication system using JSON Web Tokens (JWT) with environment variables for secret storage.

JWT is chosen because of the following factors:
- Security: JWT tokens are cryptographically signed and cannot be tampered with
- Statelessness: No need to store session data on the server
- Standardization: JWT is a widely adopted standard
- Flexibility: Can include user claims and expiration
- Scalability: Works well in distributed systems


## API Testing

This project includes a Postman collection for easy API testing.

### Quick Start with Postman

1. Import the collection from `postman/messages-api.postman_collection.json`
2. Run "Generate Test Token" to get a JWT token
3. Test all endpoints with automatic authentication

See [postman/README.md](postman/README.md) for detailed instructions.

### Available Endpoints

- `GET /api/messages` - Get all messages (with pagination and filters)
- `GET /api/test/generate-token` - Generate JWT token (dev only)

### Query Parameters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `user` - Filter by username
- `message` - Filter by message content