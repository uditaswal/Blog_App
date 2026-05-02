## Configured Regex List:

`password = /^(?=._[a-z])(?=._[A-Z])(?=._\d)(?=._[!@#$%^&*()_\-+={}[\]:;"'<>,.?\/\\|/`~]).{8,}$/`

`email = /^[^@]+@[^@]+\.[^@]+$/`

## Available Routes:

- POST /user/signup
- POST /user/signin
- POST /user/logout
- GET /blogs
- POST /blogs
- PUT /blogs/:id
- DELETE /blogs/:id

## Backend Routes Request and Response

### Request Payload for signup router : /user/signup

`{   "fullName":"abcd",
    "username":"superCool_abcd",
    "email":"abcd@gmail.com",
    "password":""
}`

## for admin log in, here admin password should match password configured in config

`
{
"fullName":"admin ",
"username":"adminUser1",
"email":"adminUser1@gmail.com",
"password":"",
"role":"ADMIN",
"adminPassword":""

}
`

#### Possible Responses:

#### HTTP 201 - User Created Response

`{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": "69ea440c3b5a53963e54dc71",
            "fullName": "xyz",
            "email": "xyz@gmail.com"
        }
    }`

#### HTTP 400 - Invalid Password Response

`{
    "success": false,
    "message": "Password should contain - one lowercase,one uppercase,one number,one special character,minimum 8 chars"
}`

#### HTTP 400 - Invalid Email Response

`{
"success": false,
"message": "Invalid Email Address"
}
`

#### HTTP 400 - Mandatory field presence check

`{
    "success": false,
    "message": "All fields are required"
}`

#### HTTP 400 - Duplicate Signup Request

`{
  "success": false,
  "message": "Email already registered"
}`

#### HTTP 400 - UserName Length Check

`{
  "success": false,
  "message": "username should be either more than 6 digit and less than 20 digit long"
}`

#### HTTP 400 - Username duplicate check

`{
  "success": false,
  "message": "Username already taken"
}`

#### HTTP 500 - Internal Server Error

`{
  "success": false,
  "message": "Internal Server Error"
}`

---

### Request Payload for signup router : /user/signin

`{
"loginId":"xyz@gmail.com",
"password":"P@ssword123"
}`

or

{
"loginId":"abcdefg",
"password":"P@ssword123"
}

#### Possible Responses:

#### HTTP 200 - Sign in successful

`{
success: true,
message: "Sign successful - Incorrect Password",
data: {
fullName: user.fullName,
email: user.email,
id: user._id
}}`

#### HTTP 400 - Mandatory field presence check

`{
success: false,
message: "Mandatory field missing for signin"
}`

`{
                success: false,
                message: "username should be either more than 6 digit and less than 20 digit long"
}`

#### HTTP 400 - Invalid Password Format

`{
success: false,
message: "Password should contain - one lowercase,one uppercase,one number,one special character,minimum 8 chars"
}`

#### HTTP 400 - Invalid Email Address Format

`{
success: false,
message: "Invalid Email Address"
}`

#### HTTP 400 - Invalid Email Address Format

`{
success: false,
message: "Invalid Email Address"
}`

#### HTTP 400 - Sign in failed - User does not exist

`{
success: false,
message: "Sign in failed - User does not exist"
}`

#### HTTP 400 - Sign in failed - Incorrect Password

`{
success: false,
message: "Sign in failed - Incorrect Password"
}`

#### HTTP 400 - Sign in failed - Incorrect Password

`{
success: false,
message: "Sign in failed - Incorrect Password"
}`

#### HTTP 500 - Internal Server Error

`{
  "success": false,
  "message": "Internal Server Error"
}`

#### HTTP 401 - Invalid Token

`{
        success: false,
        message: "Invalid Token"
}`

#### HTTP 401 - Invalid Token

`{
        success: false,
        message: "Invalid Token"
}`

---

{
success: false,
message: "Error occurred while logging out"
}

---

### Request Body (`multipart/form-data`)

| Key        | Type | Required | Example Value | Description                   |
| ---------- | ---- | -------- | ------------- | ----------------------------- |
| title      | Text | Yes      | My First Blog | Title of the blog post        |
| body       | Text | Yes      | Hello World   | Main content/body of the blog |
| coverImage | File | Yes\*    | image.jpg     | Upload blog cover image       |

> **Note:** Provide either `coverImage` (file upload) or `coverImageUrl` depending on your API logic.
