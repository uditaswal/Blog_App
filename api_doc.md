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

`{
    "fullName":"xyz",
    "email":"xyz@gmail.com",
    "password":"P@ssword123"
}`

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

#### HTTP 500 - Internal Server Error

`{
  "success": false,
  "message": "Internal Server Error"
}`

---

### Request Payload for signup router : /user/signin

`{
"email":"xyz@gmailcom",
"password":"P@ssword123"
}`

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