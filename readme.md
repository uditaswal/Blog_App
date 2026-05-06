# BlogApp

A full-stack blog application with a Vue/Vite frontend and an Express/MongoDB backend. The backend supports user authentication, role-based admin access, profile image uploads, and protected blog creation with cover image uploads.

## Tech Stack

- Frontend: Vue 3, Vite
- Backend: Node.js, Express 5, MongoDB, Mongoose
- Auth: JWT stored in an HTTP-only cookie
- Uploads: Multer
- Logging: Winston with daily rotate file support

## Project Structure

```text
.
+-- backend
|   +-- app.js                  # Express app, middleware, and route mounting
|   +-- index.js                # Server startup and MongoDB connection
|   +-- config                  # Environment config
|   +-- controllers             # Route handlers
|   +-- middleware              # Auth middleware
|   +-- models                  # Mongoose models
|   +-- routes                  # Express routers
|   +-- utils                   # Auth, validation, upload, and logger helpers
|   +-- public                  # Static files and uploaded images
+-- frontend
|   +-- src                     # Vue application source
|   +-- public                  # Frontend static assets
|   +-- vite.config.js
+-- api_doc.md                  # API notes and sample payloads
+-- structure.md                # Older structure notes
+-- readme.md
```

## Prerequisites

- Node.js
- npm
- MongoDB connection string

## Environment Setup

Create a backend environment file from the example:

```bash
cd backend
cp .env.example .env
```

Update `backend/.env` with your own values:

```env
NODE_ENV=test
PORT=8000
ENDPOINT=http://localhost:

test_dbURI=<mongoDBURL>
test_dbAppName=test-blog-app

prod_dbURI=<mongoDBURL>
prod_dbAppName=prod-blog-app

JWT_SECRET=<jwt_secret>
ADMIN_PASSWORD=<admin_signup_password>

test_frontEndOrigin=http://localhost:5173
prod_frontEndOrigin=http://localhost:5173
```

The backend chooses the database and frontend origin based on `NODE_ENV`. Use `production` for production values; any other value uses the test values.

## Installation

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Running Locally

Start the backend API:

```bash
cd backend
npm run dev
```

The backend defaults to:

```text
http://localhost:8000
```

Start the frontend:

```bash
cd frontend
npm run dev
```

The frontend Vite dev server usually runs at:

```text
http://localhost:5173
```

## Backend Scripts

Run from `backend/`:

```bash
npm run dev      # Start with nodemon
npm start        # Start with node
npm test         # Placeholder test script
```

## Frontend Scripts

Run from `frontend/`:

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## API Overview

Base backend URL:

```text
http://localhost:8000
```

### Health and Root

| Method | Route | Description |
| --- | --- | --- |
| GET | `/` | Basic server response |
| GET | `/test` | Health check response |

### Authentication

| Method | Route | Description |
| --- | --- | --- |
| POST | `/auth/signup` | Register a user |
| POST | `/auth/signin` | Sign in with email or username |

Successful signin sets a `token` cookie. Protected routes read this cookie through the auth middleware.

Example signup body:

```json
{
  "fullName": "Example User",
  "username": "exampleuser",
  "email": "user@example.com",
  "password": "P@ssword123"
}
```

Admin signup requires the configured admin password:

```json
{
  "fullName": "Admin User",
  "username": "adminuser",
  "email": "admin@example.com",
  "password": "P@ssword123",
  "role": "ADMIN",
  "adminPassword": "<admin_signup_password>"
}
```

Example signin body:

```json
{
  "loginId": "user@example.com",
  "password": "P@ssword123"
}
```

### Users

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/user/userList` | Admin | Fetch user list |
| POST | `/user/profileImg` | User | Upload profile image |
| DELETE | `/user/profileImg` | User | Reset profile image to default |

Profile image upload expects `multipart/form-data` with a `profileImage` file field.

### Blogs

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| POST | `/blog/new` | User | Create a new blog post |

Blog creation expects `multipart/form-data`:

| Field | Type | Required |
| --- | --- | --- |
| `title` | Text | Yes |
| `body` | Text | Yes |
| `coverImage` | File | Yes |

## Validation Rules

- Password must contain at least one lowercase letter, one uppercase letter, one number, one special character, and be at least 8 characters long.
- Email must match a basic email format.
- Username must be more than 6 characters and less than 20 characters.
- Uploaded files must be images.
- Upload file size limit is 10 MB.

## Logging Reference

Backend logs use Winston and include `operation` and `action` fields for easier filtering. New logs should follow this shape:

```js
logger.info({
  operation: "update_user_data",
  action: "completed",
  message: "User data updated successfully"
});
```

Common operations:

| Operation | Area | Typical actions |
| --- | --- | --- |
| `http_request` | Express request lifecycle | `received`, `completed`, `not_found`, `failed` |
| `start_logger` | Logger startup | `completed` |
| `start_server` | Server startup | `completed`, `failed` |
| `connect_database` | MongoDB connection | `completed`, `retry` |
| `authenticate_request` | Auth middleware | `token_missing`, `token_invalid` |
| `signup` | User registration | `received`, `normalized_input`, `duplicate_check`, `duplicate_email`, `duplicate_username`, `invalid_admin_password`, `validation_failed`, `created`, `failed` |
| `signin` | User login | `received`, `validation_failed`, `user_not_found`, `invalid_password`, `token_generated`, `token_generation_failed`, `failed` |
| `signout` | User logout | `completed`, `failed` |
| `get_users_list` | Admin user list | `received`, `auth_missing`, `unauthorized`, `not_found`, `completed`, `failed` |
| `get_user_data` | Admin user detail | `received`, `auth_missing`, `user_id_missing`, `unauthorized`, `not_found`, `completed`, `failed` |
| `update_user_data` | Profile update | `received`, `auth_missing`, `invalid_fields`, `required_fields_missing`, `normalized_input`, `duplicate_check`, `duplicate_username`, `validation_failed`, `not_found`, `fetched_current_user`, `failed` |
| `delete_user_data` | User deletion | `received`, `auth_missing`, `user_id_missing`, `unauthorized`, `not_found`, `admin_delete_blocked`, `fetched`, `failed` |
| `update_profile_image` | Profile image upload | `received`, `user_id_missing`, `file_missing`, `completed`, `failed` |
| `delete_profile_image` | Profile image reset | `received`, `user_id_missing`, `completed`, `failed` |
| `create_blog` | Blog creation | `received`, `required_fields_missing`, `validation_failed`, `completed`, `failed` |
| `upload_file` | Multer upload flow | `invalid_file_type`, `directory_created`, `directory_create_failed`, `filename_created`, `filename_create_failed` |
| `hash_user_password` | User model password hook | `completed`, `failed` |
| `validate_password` | Password validation utility | `failed` |
| `validate_email` | Email validation utility | `failed` |

## Notes

- Uploaded blog covers are saved under `backend/public/uploads/blogs/<userId>/`.
- Uploaded profile images are saved under `backend/public/uploads/user_avatars/`.
- The default profile image is `backend/public/image/defaultImage.png`.
- Request and response logs are written through the Winston logger.
- `api_doc.md` contains additional sample responses, though some route names there may be older than the current code.
