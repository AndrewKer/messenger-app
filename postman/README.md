# Postman Collection for Messages API

This collection contains all the endpoints for testing the Messages API with JWT authentication.

## Setup Instructions

### 1. Import the Collection

1. Open Postman
2. Click **Import** button
3. Select `messages-api.postman_collection.json`
4. Click **Import**

### 2. Configure Environment (Optional)

The collection uses variables that you can customize:

- `base_url`: Default is `http://localhost:3000`
- `jwt_token`: Automatically set after generating a token

To change the base URL:
1. Click on the collection name
2. Go to **Variables** tab
3. Update `base_url` value

### 3. Generate a JWT Token

**Important:** Run this first before testing other endpoints!

1. Expand **Authentication** folder
2. Run **Generate Test Token** request
3. The token will be automatically saved to the collection variable
4. All subsequent requests will use this token

### 4. Test the Endpoints

The collection includes:

#### Authentication
- **Generate Test Token** - Get a JWT token for testing

#### Messages
- **Get All Messages** - Retrieve all messages with default pagination
- **Get Messages with Pagination** - Custom page and limit
- **Search Messages by User** - Filter by username
- **Search Messages by Content** - Filter by message content
- **Search with Multiple Filters** - Combine filters and pagination
- **Test Invalid Pagination** - Validate error handling
- **Test Unauthorized (No Token)** - Test without authentication
- **Test Invalid Token** - Test with invalid token

## Quick Start

1. **Start your Next.js server:**
   ```bash
   npm run dev