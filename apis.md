# API Contract
[User](#User)
[Dog](#Dog)
[Expense](#Expense)
[Adopter](#Adopter)
[Adoption](#Adoption)
## User 

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
```

## PATCH /api/users/{id}

Update specific fields of a user.

### Path Parameters

| Name  | Type   | Required | Description        |
|-------|--------|----------|--------------------|
| `userEmail`  | string    | Yes      | email ID of the user     |

### Request Body

Partial fields to update. Only the fields provided will be updated.

```json
{
  "userEmail": "updated.email@example.com",
  "updatedField":"updated value"
}
```
## POST /api/auth/login

Authenticate a user and return a token on successful login.

### Request Body

```json
{
  "userEmail": "user@example.com",
  "password": "yourSecurePassword123"
}
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "userEmail": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isExecutiveDirector": false
  }
}
```
## Dog
## GET /api/dogs

Fetch a list of all dogs in the system.

### Query Parameters (Optional)

| Name        | Type   | Description                       |
|-------------|--------|-----------------------------------|
| `limit`     | int    | Maximum number of dogs to return  |
| `offset`    | int    | Pagination offset                 |
| `breed`     | string | Filter by breed                   |
| `sex`       | string | Filter by sex: `Male`, `Female`, or `Unknown` |
| `isPuppy`   | bool   | If true, returns dogs < 12 months |
| `altered`   | bool   | Filter by altered status          |

### Response

```json
[
  {
    "dogID": 1,
    "name": "Bulldog Uga",
    "breed": ["Bulldog"],
    "sex": "Male",
    "altered": true,
    "ageForMonths": 10,
    "description": "Friendly and energetic",
    "microchipID": "1234567890ABCDEF",
    "microchipVendor": "HomeAgain",
    "surrenderDate": "2024-12-01",
    "surrenderPhone": "123-456-7890",
    "surrenderedByAnimalControl": false
  }
]
```
## POST /api/dogs

Add a new dog to the system.

### Request Body

| Name                      | Type     | Required | Description |
|---------------------------|----------|----------|-------------|
| `name`                   | string   | Yes      | If breed includes `Bulldog`, name must include `Uga` |
| `breed`                  | string[] | Yes      | If `"Unknown"` or `"Mixed"`, only one value allowed; otherwise, multiple breeds are allowed |
| `sex`                    | string   | Yes      | Must be one of: `Male`, `Female`, or `Unknown` |
| `altered`                | bool     | Yes      | Must be `true` before the dog can be adopted |
| `ageForMonths`           | int      | Yes      | Dogs under 12 months are considered puppies |
| `description`            | string   | No       | Optional description of the dog |
| `microchipID`            | string   | No       | Must be globally unique if present; must be assigned before adoption |
| `microchipVendor`        | string   | No       | Required if `microchipID` is provided |
| `surrenderDate`          | string   | Yes      | Date the dog was surrendered (format: `YYYY-MM-DD`) |
| `surrenderPhone`         | string   | Cond.    | Required if `surrenderedByAnimalControl` is `true` |
| `surrenderedByAnimalControl` | bool | Yes      | Indicates if the dog was surrendered by animal control |

### Example Request

```json
{
  "name": "Uga the Bulldog",
  "breed": ["Bulldog"],
  "sex": "Male",
  "altered": true,
  "ageForMonths": 14,
  "description": "Loves kids and long walks.",
  "microchipID": "ABC123XYZ",
  "microchipVendor": "HomeAgain",
  "surrenderDate": "2025-03-25",
  "surrenderPhone": "555-123-4567",
  "surrenderedByAnimalControl": true
}
```
## PATCH /api/dogs/{dogID}

Partially update one or more fields of an existing dog.

### Path Parameters

| Name     | Type    | Description            |
|----------|---------|------------------------|
| `dogID`  | int     | Unique ID of the dog to update |

### Request Body

Only include the fields you want to update. Each field must follow the same validation rules as in the Add Dog API.

| Name                      | Type     | Description |
|---------------------------|----------|-------------|
| `name`                   | string   | If breed includes `Bulldog`, name must include `Uga` |
| `breed`                  | string[] | If `"Unknown"` or `"Mixed"`, only one value allowed; otherwise, multiple breeds are allowed |
| `sex`                    | string   | Must be one of: `Male`, `Female`, or `Unknown` |
| `altered`                | bool     | Must be `true` before the dog can be adopted |
| `ageForMonths`           | int      | Dogs under 12 months are considered puppies |
| `description`            | string   | Optional description of the dog |
| `microchipID`            | string   | Must be globally unique if present; must be assigned before adoption |
| `microchipVendor`        | string   | Required if `microchipID` is provided |
| `surrenderDate`          | string   | Date the dog was surrendered (format: `YYYY-MM-DD`) |
| `surrenderPhone`         | string   | Required if `surrenderedByAnimalControl` is `true` |
| `surrenderedByAnimalControl` | bool | Indicates if the dog was surrendered by animal control |

### Example Request

```json
{
  "altered": true,
  "microchipID": "CHIP99999",
  "microchipVendor": "example"
}
```
## Expense
## GET /api/expenses

Fetch a list of all expenses in the system.

### Query Parameters (Optional)

| Name           | Type    | Description                                      |
|----------------|---------|--------------------------------------------------|
| `dogID`        | int     | Filter by associated dog                         |
| `startDate`    | string  | Filter expenses after this date (`YYYY-MM-DD`)   |
| `endDate`      | string  | Filter expenses before this date (`YYYY-MM-DD`)  |
| `vendor`       | string  | Filter by expense vendor                         |
| `category`     | string  | Filter by expense category                       |
| `minAmount`    | float   | Filter for expenses greater than or equal to this amount |
| `maxAmount`    | float   | Filter for expenses less than or equal to this amount |

### Response

```json
[
  {
    "expenseID": 1,
    "dogID": 102,
    "expenseDate": "2025-03-20",
    "expenseVendor": "Happy Tails Vet Clinic",
    "expenseCategory": ["Medical", "Vaccination"],
    "expenseAmount": 125.50
  }
]
```
## POST /api/expenses

Add a new expense associated with a dog.

### Request Body

| Name             | Type     | Required | Description |
|------------------|----------|----------|-------------|
| `dogID`          | int      | Yes      | ID of the dog this expense is related to |
| `expenseDate`    | string   | Yes      | Date of the expense (`YYYY-MM-DD`) <br> Must be **after** the dog's `surrenderDate` and **before** adoption |
| `expenseVendor`  | string   | Yes      | Vendor where the expense occurred |
| `expenseCategory`| string[] | Yes      | List of categories; values must be from the admin-controlled category list |
| `expenseAmount`  | float    | Yes      | Expense amount (must be ≥ 0.00) |

### Example Request

```json
{
  "dogID": 102,
  "expenseDate": "2025-03-21",
  "expenseVendor": "PetCo",
  "expenseCategory": ["Supplies", "Food"],
  "expenseAmount": 59.99
}
```
### Response
```json
{
  "message": "Expense added successfully",
  "expenseID": 201
}
```
## PATCH /api/expenses/{expenseID}

Partially update one or more fields of an existing expense.

### Path Parameters

| Name         | Type | Description                   |
|--------------|------|-------------------------------|
| `expenseID`  | int  | Unique ID of the expense to update |

### Request Body

Only include the fields you want to update. Each field must follow the same validation rules as in the Add Expense API.

| Name              | Type     | Description |
|-------------------|----------|-------------|
| `dogID`           | int      | ID of the dog this expense is associated with |
| `expenseDate`     | string   | Date of the expense (`YYYY-MM-DD`) <br> Must be after the dog’s `surrenderDate` and before adoption |
| `expenseVendor`   | string   | Vendor where the expense occurred |
| `expenseCategory` | string[] | List of categories; values must be from the admin-controlled category list |
| `expenseAmount`   | float    | Expense amount (must be ≥ 0.00) |

### Example Request

```json
{
  "expenseVendor": "Updated Vendor",
  "expenseAmount": 85.25
}
```
### Response
```json
{
  "message": "Expense updated successfully",
  "expenseID": 201
}
```
## Adopter
## GET /api/adopters

Fetch a list of all adopters in the system.

### Query Parameters (Optional)

| Name          | Type   | Description                            |
|---------------|--------|----------------------------------------|
| `email`       | string | Filter by adopter email                |
| `firstName`   | string | Filter by first name                   |
| `lastName`    | string | Filter by last name                    |
| `city`        | string | Filter by city                         |
| `state`       | string | Filter by state                        |
| `zipCode`     | string | Filter by ZIP code                     |
| `minHouseholdSize` | int | Filter for adopters with household size ≥ value |
| `maxHouseholdSize` | int | Filter for adopters with household size ≤ value |

### Response

```json
[
  {
    "adopterID": 1,
    "adopterEmail": "jane.doe@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "street": "123 Maple Street",
    "city": "Atlanta",
    "state": "GA",
    "zipCode": "30303",
    "phoneNumber": "555-123-4567",
    "householdSize": 3
  }
]
```
## POST /api/adopters

Add a new adopter to the system.

### Request Body

| Name            | Type    | Required | Description                     |
|-----------------|---------|----------|---------------------------------|
| `adopterEmail`  | string  | Yes      | Must be unique across all adopters |
| `firstName`     | string  | Yes      | First name of the adopter       |
| `lastName`      | string  | Yes      | Last name of the adopter        |
| `street`        | string  | Yes      | Street address                  |
| `city`          | string  | Yes      | City of residence               |
| `state`         | string  | Yes      | State of residence              |
| `zipCode`       | string  | Yes      | ZIP/postal code                 |
| `phoneNumber`   | string  | Yes      | Contact phone number            |
| `householdSize` | int     | Yes      | Number of people in the household |

### Example Request

```json
{
  "adopterEmail": "emily.jones@example.com",
  "firstName": "Emily",
  "lastName": "Jones",
  "street": "789 Pine Street",
  "city": "Augusta",
  "state": "GA",
  "zipCode": "30901",
  "phoneNumber": "555-321-9876",
  "householdSize": 4
}
```
### Response
```json
{
  "message": "Adopter added successfully",
  "adopterID": 3
}
```
## Adoption
## GET /api/adoptions

Fetch a list of all dog adoption applications in the system.

### Query Parameters (Optional)

| Name               | Type    | Description                                      |
|--------------------|---------|--------------------------------------------------|
| `dogID`            | int     | Filter by dog ID                                 |
| `adopterID`        | int     | Filter by adopter ID                             |
| `applicationStatus`| string  | Filter by status: `pending approval`, `approved`, or `rejected` |
| `startDate`        | string  | Filter applications submitted after this date (`YYYY-MM-DD`) |

### Response

```json
[
  {
    "adoptionID": 1,
    "dogID": 102,
    "adopterID": 3,
    "applicationDate": "2025-03-15",
    "applicationStatus": "approved",
    "statusDecisionDate": "2025-03-18"
  }
]
```
## POST /api/adoptions

Create a new dog adoption application.

### Request Body

| Name                | Type    | Required | Description |
|---------------------|---------|----------|-------------|
| `dogID`             | int     | Yes      | ID of the dog the adopter is applying to adopt |
| `adopterID`         | int     | Yes      | ID of the adopter submitting the application |
| `applicationDate`   | string  | Yes      | Date of application (`YYYY-MM-DD`) |

### Example Request

```json
{
  "dogID": 102,
  "adopterID": 3,
  "applicationDate": "2025-03-25",
  "applicationStatus": "pending approval",
  "statusDecisionDate": null
}
```
## PATCH /api/adoptions/{adoptionID}

Approve or reject an adoption application.

### Path Parameters

| Name         | Type | Description                         |
|--------------|------|-------------------------------------|
| `adoptionID` | int  | Unique ID of the adoption application to update |

### Request Body

Only include the fields you want to update. All fields must follow the same validation rules as in the POST API.

| Name                | Type    | Description |
|---------------------|---------|-------------|
| `applicationStatus` | string  | One of: `pending approval`, `approved`, or `rejected` |

### Example Request

```json
{
  "applicationStatus": "approved",
  "statusDecisionDate": "2025-03-26"
}