# cs6400-2025-01-Team002
## install django and run the server
>`pip install django`
>
>`python manage.py runserver 8080`
## install MySQL
>`brew install mysql pkg-config`
>
>`pip install mysqlclient`

# API
# User

## GET /api/users

Fetch a list of users.

### Query Parameters

| Name     | Type   | Required | Description         |
|----------|--------|----------|---------------------|
| `limit`  | int    | No       | Max number of users |
| `offset` | int    | No       | Pagination offset   |

### Response

```json
[
  {
    "userEmail": "example@example.com",
    "firstName": "example",
    "lastName": "example",
    "birthDate": "YYYY-MM-DD",
    "phoneNumber": "1234567890",
    "isExecutiveDirector": true
  }
]
```
## POST /api/users

create a user.

### Query Parameters

| Name     | Type   | Required | Description         |
|----------|--------|----------|---------------------|
| `userEmail`  | string    | Yes       |  |
| `password` | string    | Yes       |    |
| `firstName` | string    | Yes       |    |
| `lastName` | string    | Yes       |    |
| `birthday` | date    | Yes       |    |
| `phoneNumber` | string    | Yes       |    |
| `isExecutiveDirector` | boolean    | Yes       |    |

### Response
```json
[
  {
    "userEmail": "example@example.com",
    "firstName": "example",
    "lastName": "example",
    "birthDate": "YYYY-MM-DD",
    "phoneNumber": "1234567890",
    "isExecutiveDirector": true
  }
]