# Tables
account/management/commands
## User
userEmail VARCHAR(255) PRIMARY KEY,

firstName VARCHAR(100),

lastName VARCHAR(100),

birthDate DATE,

phoneNumber VARCHAR(20),

isExecutiveDirector BOOLEAN,

password VARCHAR(255)

## Dog
id INT AUTO_INCREMENT PRIMARY KEY,

name VARCHAR(255) NOT NULL,

breed JSON NOT NULL,

sex ENUM('Male', 'Female', 'Unknown') NOT NULL,

altered BOOLEAN NOT NULL,

ageForMonths INT NOT NULL,

description TEXT,

microchipID VARCHAR(100) UNIQUE,

microchipVendor VARCHAR(100),

surrenderDate DATE NOT NULL,

surrenderPhone VARCHAR(20),

surrenderedByAnimalControl BOOLEAN NOT NULL,

## Expense
expenseID INT AUTO_INCREMENT PRIMARY KEY,

dogID INT NOT NULL,

expenseDate DATE NOT NULL,

expenseVendor VARCHAR(255) NOT NULL,

expenseCategory JSON NOT NULL,

expenseAmount DECIMAL(10, 2) NOT NULL CHECK (expenseAmount >= 0),

FOREIGN KEY (dogID) REFERENCES Dog(id)

## Adopter
adopterID INT AUTO_INCREMENT PRIMARY KEY,

adopterEmail VARCHAR(255) UNIQUE NOT NULL,

firstName VARCHAR(100) NOT NULL,

lastName VARCHAR(100) NOT NULL,

street VARCHAR(255) NOT NULL,

city VARCHAR(100) NOT NULL,

state VARCHAR(100) NOT NULL,

zipCode VARCHAR(20) NOT NULL,

phoneNumber VARCHAR(20) NOT NULL,

householdSize INT NOT NULL

## Adoption
adoptionID INT AUTO_INCREMENT PRIMARY KEY,

dogID INT NOT NULL,

adopterID INT NOT NULL,

adoptionFee DECIMAL(10, 2) NOT NULL,

AdoptionDate DATE NOT NULL,

FOREIGN KEY (dogID) REFERENCES Dog(id),

FOREIGN KEY (adopterID) REFERENCES Adopter(adopterID)

## Application
applicationID INT AUTO_INCREMENT PRIMARY KEY,

adopterID INT NOT NULL,

dogID INT NOT NULL,

applicationDate DATE NOT NULL,

applicationStatus VARCHAR(20) NOT NULL CHECK (applicationStatus IN ('pending approval', 'approved', 'rejected')),

statusDecisionDate DATE DEFAULT NULL,

CONSTRAINT fk_adopter FOREIGN KEY (adopterID) REFERENCES Adopter(adopterID),

CONSTRAINT fk_dog FOREIGN KEY (dogID) REFERENCES Dog(id),

CONSTRAINT unique_adopter_date UNIQUE (adopterID, applicationDate)

# APIs
## accounts
### get_users(request)
url: http://127.0.0.1:8080/accounts/users/

method: GET

response example:
[{

        "userEmail": "test@example.com",
        "firstName": "Test",
        "lastName": "User",
        "birthDate": "1990-01-01",
        "phoneNumber": "1234567890",
        "isExecutiveDirector": 0,
        "password": "6e0daa0a792dcaef24738984267b05c5153663f16fa31a96325ab2fc1ca713b8"
}]

### register_user(request)
url: http://127.0.0.1:8080/accounts/register/

method: POST

request example:{

    "userEmail": "volunteer1@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "birthDate": "1990-06-15",
    "phoneNumber": "1234567890",
    "isExecutiveDirector": false,
    "password": "securePass123"
}

response example: {
  "message": "User registered successfully!"
}

### login_user(request)
url: http://127.0.0.1:8080/accounts/login/

method: POST

request example: {

      "userEmail": "volunteer1@example.com",
      "password": "securePass123"
}

response example: {
    "message": "Login successful"
}

### volunteers(request)
url: http://127.0.0.1:8080/accounts/volunteers/

method: GET
response example:{

    "volunteers": [

        {
            "userEmail": "test@example.com",
            "firstName": "Test",
            "lastName": "User",
            "phoneNumber": "1234567890"
        },

        {
            "userEmail": "volunteer1@example.com",
            "firstName": "Jane",
            "lastName": "Doe",
            "phoneNumber": "1234567890"
        }
    ]
}

### volunteer_birthdays(request)
url: http://127.0.0.1:8080/accounts/volunteer_birthday?month=01&year=1990

method: GET

response example: {
    "volunteers": [

        {
            "firstName": "Test",
            "lastName": "User",
            "userEmail": "test@example.com",
            "birthDate": "1990-01-01",
            "age": 35,
            "milestone": false
        }
    ]
}

## dogs
### get_all_dogs(request)
url: http://127.0.0.1:8080/dogs/get_all_dogs/

method: GET

response example:[

    {
        "id": 1,
        "name": "Fido",
        "breed": "\"Labrador\"",
        "sex": "Female",
        "altered": 1,
        "ageForMonths": 18,
        "description": "Friendly and calm.",
        "microchipID": "123ABC",
        "microchipVendor": "ChipCo",
        "surrenderDate": "2025-03-28",
        "surrenderPhone": null,
        "surrenderedByAnimalControl": 0
    }
]

### add_dog(request)
url: http://127.0.0.1:8080/dogs/add_dog/

method: POST

request example: {

        "name": "Buddy",
        "breed": ["Golden Retriever"],
        "sex": "Male",
        "altered": true,
        "ageForMonths": 18,
        "surrenderedByAnimalControl": false,
        "surrenderPhone": null,
        "microchipID": "123456789",
        "microchipVendor": "PetSafe",
        "description": "Friendly and energetic"
}

### get_dog_by_id(request, dog_id)
url:  http://127.0.0.1:8080/dogs/get_dog/1/

method: GET

response example: {

    "id": 1,
    "name": "Fido",
    "breed": "\"Labrador\"",
    "sex": "Female",
    "altered": 1,
    "ageForMonths": 18,
    "description": "Friendly and calm.",
    "microchipID": "123ABC",
    "microchipVendor": "ChipCo",
    "surrenderDate": "2025-03-28",
    "surrenderPhone": null,
    "surrenderedByAnimalControl": 0
}

### edit_dog(request, dog_id)
url:  http://127.0.0.1:8080/dogs/edit_dog/1/

method: PUT

request example: {

      "sex": "Male",
      "breed": ["Golden Retriever"],
      "microchipID": "987654321"
}

## adoptions
### add_adoption_application
url: http://127.0.0.1:8080/adoptions/add_adoption_application/

method: POST

request example: {

      "adopterEmail": "jane.doe@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "street": "123 Oak St",
      "city": "Atlanta",
      "state": "GA",
      "zipCode": "30332",
      "phoneNumber": "555-222-1234",
      "householdSize": 3,
      "applicationDate": "2025-03-27",
      "dogID": 5
}

### review_pending_applications
url: http://127.0.0.1:8080/adoptions/review_pending_applications/

method: GET

response example: {
    "error": "Permission denied"
}

{
    "applications": [

        {
            "applicationID": 1,
            "applicationDate": "2025-03-27",
            "adopterID": 1,
            "adopterName": "Jane Doe",
            "dogID": 5,
            "dogName": "Max",
            "status": "pending approval"
        }
    ]
}

### update_application_status
url: http://127.0.0.1:8080/adoptions/rupdate_application_status/

method: POST

request example: {

      "applicationID": 1,
      "applicationStatus": "approved"
}

### finalize_adoption
url:  http://127.0.0.1:8080/adoptions/finalize_adoption/

method: POST

request example: {

      "dogID": 5,
      "adopterID": 1
}

response example:{

    "message": "Adoption finalized successfully",
    "dogID": 5,
    "adopterID": 1,
    "adoptionFee": 112.49
}

### get_all_adoptions
url:  http://127.0.0.1:8080/adoptions/get_all_adoptions/

method: GET

response example: [

    {
        "adoptionID": 1,
        "dogID": 5,
        "adopterID": 1,
        "adoptionFee": "112.49",
        "AdoptionDate": "2025-04-01"
    }
]

## expenses
### get_all_expenses
url: http://127.0.0.1:8080/expenses/get_all_expenses/

method: GET

response example: [
    {

        "expenseID": 1,
        "dogID": 5,
        "expenseDate": "2025-04-01",
        "expenseVendor": "Paws Vet Clinic",
        "expenseCategory": "[\"medical\", \"vaccination\"]",
        "expenseAmount": "89.99"
    }
]

### add_expense
url:  http://127.0.0.1:8080/expenses/add_expense/

method: POST

request example: {

      "dogID": 1,
      "expenseDate": "2025-04-03",
      "expenseVendor": "PetSmart",
      "expenseCategory": "medical",
      "expenseAmount": 89.99
}

## report
### animal_control_report
url: http://127.0.0.1:8080/report/animal_control_report/

method: GET

response example:{

    "data": [
        {
            "month": 4,
            "totalSurrendered": 1,
            "adoptedAfter60Days": "0",
            "totalExpenses": 0.0
        }
    ]
}

### monthly_adoption_report
url:  http://127.0.0.1:8080/report/monthly_adoption_report/

method: GET

response example:{

    "data": [
        {
            "month": 4,
            "totalAdopted": 1,
            "totalFees": 112.49,
            "totalExpenses": 89.99,
            "netProfit": 22.5
        }
    ]
}

### expense_analysis
url: http://127.0.0.1:8080/report/expense_analysis/

method: GET

response example:{

    "data": [
        {
            "expenseVendor": "Paws Vet Clinic",
            "totalSpent": 89.99
        }
    ]
}






