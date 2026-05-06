# BlogApp API Documentation

## Base Routes

Routes are mounted in `backend/app.js`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | No | Health/root response |
| GET | `/test` | No | Test response |
| POST | `/auth/signup` | No | Register a user or admin |
| POST | `/auth/signin` | No | Sign in with email or username |
| POST | `/blog/new` | Yes | Create a new blog with a cover image |
| GET | `/user/userList` | Yes, admin | Get all users |
| GET | `/user/:id` | Yes, admin | Get one user by MongoDB ObjectId |
| DELETE | `/user/:id` | Yes, admin | Delete one user by MongoDB ObjectId |
| POST | `/user/profileImg` | Yes | Upload/update current user's profile image |
| DELETE | `/user/profileImg` | Yes | Delete/reset current user's profile image |

> Note: `DELETE /user/profileImg` is currently declared after `DELETE /user/:id` in `backend/routes/user.routes.js`. With the current order, Express will match `/user/profileImg` as `/:id` first and return `Invalid user ID`. Move the `/profileImg` delete route above `/:id` if you want it to work.

## Common Response Shape

All controllers use `sendResponse(res, statusCode, message, data)`.

```json
{
  "success": true,
  "message": "Message text",
  "data": {}
}
```

`success` is `true` for status codes `200` through `399`; otherwise it is `false`. The `data` property is omitted when no data is passed.

## Logging Reference

Backend logs are structured with `operation` and `action` fields. Use `operation` for the API or system flow, and `action` for the specific event inside that flow.

```js
logger.info({
  operation: "delete_user_data",
  action: "received",
  message: "Request received to delete user data"
});
```

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

## Validation Rules

```js
passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]:;"'<>,.?\/\\|`~]).{8,}$/;
emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
```

Username length must be greater than `6` and less than `20` characters after trimming/lowercasing.

## Authentication

Protected routes require a valid `token` cookie. The token is created by `POST /auth/signin`, is HTTP-only, and expires after 7 days.

Common auth errors:

```json
{
  "success": false,
  "message": "unauthorized"
}
```

```json
{
  "success": false,
  "message": "Invalid Token"
}
```

## GET /

Returns a root server response.

### Success: 200

```json
{
  "success": true,
  "message": "Hello from Server"
}
```

## GET /test

Returns a test response.

### Success: 200

```json
{
  "success": true,
  "message": "OK"
}
```

## POST /auth/signup

Registers a new user. Set `role` to `ADMIN` and provide a valid `adminPassword` to create an admin user.

### Request Body

```json
{
  "fullName": "Example User",
  "username": "example_user",
  "email": "example@gmail.com",
  "password": "P@ssword123"
}
```

### Admin Request Body

```json
{
  "fullName": "Admin User",
  "username": "admin_user",
  "email": "admin@gmail.com",
  "password": "P@ssword123",
  "role": "ADMIN",
  "adminPassword": "configured-admin-password"
}
```

### Success: 201

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "69ea440c3b5a53963e54dc71",
      "fullName": "Example User",
      "email": "example@gmail.com",
      "username": "example_user"
    }
  }
}
```

### Possible Errors

| Status | Message |
| --- | --- |
| 400 | `All fields are required` |
| 400 | `Password should contain - one lowercase,one uppercase,one number,one special character,minimum 8 chars` |
| 400 | `Invalid Email Address` |
| 400 | `username should be either more than 6 digit and less than 20 digit long` |
| 400 | `Email already registered. Please sign in.` |
| 400 | `Username already taken.` |
| 400 | `Admin password is incorrect` |
| 500 | `Internal Server Error` |

## POST /auth/signin

Signs in with either email or username. On success, the API sets a `token` cookie.

### Request Body

```json
{
  "loginId": "example@gmail.com",
  "password": "P@ssword123"
}
```

```json
{
  "loginId": "example_user",
  "password": "P@ssword123"
}
```

### Success: 200

In non-production, `data.token` contains the JWT. In production, it contains `"Generated Successfully"`.

```json
{
  "success": true,
  "message": "Sign successful",
  "data": {
    "fullName": "Example User",
    "username": "example_user",
    "email": "example@gmail.com",
    "id": "69ea440c3b5a53963e54dc71",
    "role": "USER",
    "token": "jwt-or-generated-successfully"
  }
}
```

### Possible Errors

| Status | Message |
| --- | --- |
| 400 | `Mandatory field missing for signin` |
| 400 | `Password should contain - one lowercase,one uppercase,one number,one special character,minimum 8 chars` |
| 400 | `Invalid Email Address` |
| 400 | `Sign in failed - User does not exist` |
| 400 | `Sign in failed - Incorrect Password` |
| 500 | `Internal Server Error` |
| 500 | `Error occurred while creating token` |

## POST /blog/new

Creates a new blog post. Requires a valid `token` cookie.

### Request Body

Content type: `multipart/form-data`

| Key | Type | Required | Example | Description |
| --- | --- | --- | --- | --- |
| `title` | Text | Yes | `My First Blog` | Blog title |
| `body` | Text | Yes | `Hello World` | Blog content/body |
| `coverImage` | File | Yes | `cover.jpg` | Blog cover image |

Only image file uploads are accepted. Upload size limit is `10 MB`.

### Success: 201

```json
{
  "success": true,
  "message": "Blog Created Successfully",
  "data": {
    "title": "My First Blog",
    "createdBy": "69ea440c3b5a53963e54dc71"
  }
}
```

### Possible Errors

| Status | Message |
| --- | --- |
| 400 | `Mandatory field missing` |
| 400 | `Title and Body should be more than 1 character long` |
| 400 | `Only image files are allowed` |
| 401 | `unauthorized` |
| 401 | `Invalid Token` |
| 500 | `Error while creating new blog` |

## GET /user/userList

Returns all users. Requires a valid `token` cookie for an admin user.

### Success: 200

```json
{
  "success": true,
  "message": "User list fetched successfully",
  "data": {
    "users": []
  }
}
```

### Possible Errors

| Status | Message |
| --- | --- |
| 400 | `Authentication failed, Sign in Again` |
| 400 | `ADMIN privilege is required to fetch user list` |
| 401 | `unauthorized` |
| 401 | `Invalid Token` |
| 404 | `No users not found` |
| 500 | `Error while fetching user data` |

## GET /user/:id

Returns one user by MongoDB ObjectId. Requires a valid `token` cookie for an admin user.

### Path Params

| Param | Required | Description |
| --- | --- | --- |
| `id` | Yes | MongoDB ObjectId of the user |

### Success: 200

```json
{
  "success": true,
  "message": "User data fetched successfully",
  "data": {
    "users": {
      "_id": "69ea440c3b5a53963e54dc71",
      "fullName": "Example User",
      "username": "example_user",
      "email": "example@gmail.com",
      "profileImageURL": "public/image/defaultImage.png",
      "role": "USER"
    }
  }
}
```

### Possible Errors

| Status | Message |
| --- | --- |
| 400 | `Authentication failed, Sign in Again` |
| 400 | `user id token is not present in request` |
| 400 | `Invalid user ID` |
| 400 | `ADMIN privilege is required to fetch user list` |
| 401 | `unauthorized` |
| 401 | `Invalid Token` |
| 404 | `User not found` |
| 500 | `Error while fetching user data` |

## DELETE /user/:id

Deletes one user by MongoDB ObjectId. Requires a valid `token` cookie for an admin user.

### Path Params

| Param | Required | Description |
| --- | --- | --- |
| `id` | Yes | MongoDB ObjectId of the user |

### Success: 200

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "users": {
      "_id": "69ea440c3b5a53963e54dc71",
      "fullName": "Example User",
      "username": "example_user",
      "email": "example@gmail.com",
      "profileImageURL": "public/image/defaultImage.png",
      "role": "USER"
    }
  }
}
```

### Possible Errors

| Status | Message |
| --- | --- |
| 400 | `Authentication failed, Sign in Again` |
| 400 | `user id token is not present in request` |
| 400 | `Invalid user ID` |
| 400 | `ADMIN privilege is required to fetch user list` |
| 401 | `unauthorized` |
| 401 | `Invalid Token` |
| 404 | `User not found` |
| 500 | `Error while deleting user data` |

## POST /user/profileImg

Uploads or replaces the signed-in user's profile image. Requires a valid `token` cookie.

### Request Body

Content type: `multipart/form-data`

| Key | Type | Required | Example | Description |
| --- | --- | --- | --- | --- |
| `profileImage` | File | Yes | `avatar.png` | New profile image |

Only image file uploads are accepted. Upload size limit is `10 MB`.

### Success: 200

```json
{
  "success": true,
  "message": "Profile Image uploaded successfully"
}
```

### Possible Errors

| Status | Message |
| --- | --- |
| 400 | `Picture not found, please upload again` |
| 400 | `Only image files are allowed` |
| 401 | `unauthorized` |
| 401 | `Invalid Token` |
| 403 | `Please sign in again` |
| 500 | `Error while uploading profile image` |

## DELETE /user/profileImg

Resets the signed-in user's profile image to the configured default image. Requires a valid `token` cookie.

### Success: 200

```json
{
  "success": true,
  "message": "Profile Picture deleted successfully"
}
```

### Possible Errors

| Status | Message |
| --- | --- |
| 401 | `unauthorized` |
| 401 | `Invalid Token` |
| 403 | `Authentication failed, Signin Again` |
| 500 | `Error while deleting profileImage` |

> Current behavior note: because of the router order mentioned above, this request currently returns `Invalid user ID` unless the route is moved before `DELETE /user/:id`.

## 404 Response

Any unknown route returns:

```json
{
  "success": false,
  "message": "Page Not Found"
}
```
