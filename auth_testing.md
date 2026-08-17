# Auth Testing Playbook — Kai Voss Portfolio Admin

## Credentials
See /app/memory/test_credentials.md for the admin email/password.

## Step 1: MongoDB verification
```
mongosh
use test_database
db.users.find({role: "admin"}).pretty()
```
Expect bcrypt hash starting with `$2b$`, unique index on users.email, index on login_attempts.identifier.

## Step 2: API testing
```
API=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
curl -c /tmp/cookies.txt -X POST $API/api/auth/login -H "Content-Type: application/json" -d '{"email":"<admin email>","password":"<admin password>"}'
curl -b /tmp/cookies.txt $API/api/auth/me
curl -b /tmp/cookies.txt $API/api/artworks
```
Login sets httpOnly `access_token` cookie and returns the admin user. `/me` returns the same user.

## Step 3: Protected endpoints
```
# without cookie -> 401
curl -X POST $API/api/artworks -H "Content-Type: application/json" -d '{}'
# upload requires cookie
curl -b /tmp/cookies.txt -F "file=@image.png" $API/api/upload
```
