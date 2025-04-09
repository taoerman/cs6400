from django.http import JsonResponse, HttpResponseBadRequest
from django.db import connection
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from datetime import date
import json

def get_current_shelter_status():
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM Dog")
        total_dogs = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM Adoption")
        adopted_dogs = cursor.fetchone()[0]

        current_in_shelter = total_dogs - adopted_dogs
    return current_in_shelter, settings.MAX_SHELTER_CAPACITY

@csrf_exempt
def get_all_dogs(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method allowed'}, status=405)

    try:
        with connection.cursor() as cursor:
            # 1. Get dog info
            cursor.execute("SELECT * FROM Dog")
            columns = [col[0] for col in cursor.description]
            dog_rows = [dict(zip(columns, row)) for row in cursor.fetchall()]

            # 2. Get breeds
            cursor.execute("SELECT dogID, breedName FROM Breeds")
            breed_rows = cursor.fetchall()

            # 3. Get adopted dog IDs
            cursor.execute("SELECT DISTINCT dogID FROM Adoption")
            adopted_ids = set(row[0] for row in cursor.fetchall())

        breed_map = {}
        for dog_id, breed in breed_rows:
            breed_map.setdefault(dog_id, []).append(breed)

        for dog in dog_rows:
            dog['breeds'] = sorted(breed_map.get(dog['id'], []))
            dog['is_adopted'] = dog['id'] in adopted_ids

        return JsonResponse(dog_rows, safe=False)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# [
#   {
#     "id": 1,
#     "name": "Buddy",
#     "sex": "Male",
#     "altered": true,
#     "ageForMonths": 24,
#     "description": "Friendly dog",
#     "microchipID": "MC12345",
#     "microchipVendor": "PetLink",
#     "surrenderDate": "2025-04-01",
#     "surrenderPhone": "1234567890",
#     "surrenderedByAnimalControl": false,
#     "user_email": "staff@dogshelter.org",
#     "breeds": ["Labrador Retriever", "Poodle"]
#   }
# ]

@csrf_exempt
def shelter_capacity(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        current, max_capacity = get_current_shelter_status()
        remain_space = max_capacity - current
        return JsonResponse({
            'currentInShelter': current,
            'maxCapacity': max_capacity,
            'remainingSpace': remain_space
        }, status=200)
    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

@csrf_exempt
def add_dog(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    try:
        # Get user_email from session
        # user_email = request.session.get('user_email')
        # if not user_email:
        #     return JsonResponse({'error': 'User not authenticated'}, status=403)

        data = json.loads(request.body)
        print(data)

        # Extract fields
        name = data['name']
        breed_list = data['breed']
        sex = data.get('sex', 'Unknown').capitalize()
        altered = 1 if data['altered'] else 0
        age = data['ageForMonths']
        surrendered_by_control = 1 if data['surrenderedByAnimalControl'] else 0
        surrender_phone = data.get('surrenderPhone')
        microchip_id = data.get('microchipID')
        microchip_vendor = data.get('microchipVendor')
        description = data.get('description', '')
        user_email = data.get('user_email')

        # Check required phone number
        if surrendered_by_control and not surrender_phone:
            return JsonResponse({'error': 'surrenderPhone is required when surrenderedByAnimalControl is true'}, status=400)

        # Bulldog + Uga restriction
        if any("bulldog" in b.lower() for b in breed_list) and name.strip().lower() == 'uga':
            return JsonResponse({'error': 'Bulldogs named Uga are not allowed. You must change to another name'}, status=400)

        # Check shelter capacity
        current, max_capacity = get_current_shelter_status()
        if current >= max_capacity:
            return JsonResponse({'error': f'Dog shelter is full (max {max_capacity} dogs)'}, status=400)

        with connection.cursor() as cursor:
            # Check if microchipID already exists
            if microchip_id:
                cursor.execute("SELECT COUNT(*) FROM Dog WHERE microchipID = %s", [microchip_id])
                if cursor.fetchone()[0] > 0:
                    return JsonResponse({'error': 'A dog with this microchip ID already exists.'}, status=400)

            # Insert dog
            cursor.execute("""
                INSERT INTO Dog (name, sex, altered, ageForMonths, description,
                    microchipID, microchipVendor, surrenderedByAnimalControl,
                    surrenderPhone, surrenderDate, user_email)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_DATE, %s)
            """, [
                name, sex, altered, age, description,
                microchip_id, microchip_vendor, surrendered_by_control, surrender_phone, user_email
            ])

            dog_id = cursor.lastrowid

            # Validate breed against ENUM list
            cursor.execute("""
                SELECT COLUMN_TYPE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'Breeds' AND COLUMN_NAME = 'breedName'
            """)
            enum_data = cursor.fetchone()[0]
            allowed_breeds = enum_data.replace("enum(", "").replace(")", "").replace("'", "").split(",")

            # Insert into Breeds table
            for breed in breed_list:
                if breed not in allowed_breeds:
                    return JsonResponse({'error': f"'{breed}' is not a valid breed."}, status=400)

                cursor.execute("""
                               INSERT INTO Breeds (dogID, breedName)
                               VALUES (%s, %s)
                           """, [dog_id, breed])

        return JsonResponse({'message': 'Dog added successfully!'}, status=201)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

@csrf_exempt
def get_dog_by_id(request, dog_id):
    try:
        with connection.cursor() as cursor:
            # Get dog data
            cursor.execute("SELECT * FROM Dog WHERE id = %s", [dog_id])
            row = cursor.fetchone()
            if row is None:
                return JsonResponse({'error': 'Dog Not Found'}, status=404)

            columns = [col[0] for col in cursor.description]
            dog = dict(zip(columns, row))

            # Get breed(s) for the dog
            cursor.execute("SELECT breedName FROM Breeds WHERE dogID = %s", [dog_id])
            breed_rows = cursor.fetchall()
            dog['breeds'] = sorted([b[0] for b in breed_rows])

            cursor.execute("SELECT DISTINCT dogID FROM Adoption")
            adopted_ids = set(row[0] for row in cursor.fetchall())
            dog['is_adopted'] = dog['id'] in adopted_ids

        return JsonResponse(dog, status=200)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

@csrf_exempt
def edit_dog(request, dog_id):
    if request.method != 'PUT':
        return JsonResponse({'error' : 'Only PUT Allowed'}, status=405)

    try:
        # Get user info from session
        # user_email = request.session.get('user_email')
        # is_exec = request.session.get('is_exec')

        # if not user_email:
        #     return JsonResponse({'error': 'User not logged in'}, status=403)

        data = json.loads(request.body)
        user_email = data.get('user_email')
        is_exec = data.get('is_exec')

        new_sex = data.get('sex')
        new_altered = data.get('altered')
        new_microchip = data.get('microchipID')
        new_microchip_vendor = data.get('microchipVendor')

        if new_sex not in ['Male', 'Female', 'Unknown']:
            return JsonResponse({'error' : 'Invalid Syntax value'}, status=400)

        # If not ED, check age before allowing microchipID change
        if not is_exec and new_microchip:
            with connection.cursor() as cursor:
                cursor.execute("""
                        SELECT birthDate FROM User WHERE userEmail = %s
                    """, [user_email])
                row = cursor.fetchone()

                if not row:
                    return JsonResponse({'error': 'User not found'}, status=404)

                birth_date = row[0]
                today = date.today()
                age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

                if age < 18:
                    return JsonResponse({'error': 'Only users 18+ can update microchipID'}, status=403)


        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE Dog
                SET sex = %s, altered = %s, microchipID = %s, microchipVendor = %s
                WHERE id = %s
            """, [new_sex, new_altered, new_microchip, new_microchip_vendor, dog_id])

        return JsonResponse({'message' : 'Dog updated successfully'})

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

@csrf_exempt
def get_vendors(request):
    # {
    #   "vendors": ["PetLink", "AVID", "HomeAgain"]
    # }
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COLUMN_TYPE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'Dog'
                AND COLUMN_NAME = 'microchipVendor'
            """)
            enum_data = cursor.fetchone()[0]

            vendors = enum_data.replace("enum(", "").replace(")", "").replace("'", "").split(",")

        return JsonResponse({'vendors': vendors}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def edit_vendor(request):
    # {
    #   "microchipID": "MC555000333",
    #   "microchipVendor": "HomeAgain"
    # }

    if request.method != 'PUT':
        return JsonResponse({'error': 'Only PUT allowed'}, status=405)

    try:
        # Check if user is an Executive Director
        if not request.session.get('isExecutiveDirector'):
            return JsonResponse({'error': 'Only Executive Directors can edit vendor info.'}, status=403)

        data = json.loads(request.body)
        microchip_id = data.get('microchipID')
        new_vendor = data.get('microchipVendor')

        if not microchip_id or not new_vendor:
            return JsonResponse({'error': 'microchipID and microchipVendor are required.'}, status=400)

        with connection.cursor() as cursor:
            # Check if the dog exists
            cursor.execute("SELECT id FROM Dog WHERE microchipID = %s", [microchip_id])
            row = cursor.fetchone()
            if not row:
                return JsonResponse({'error': 'Dog with given microchipID not found.'}, status=404)

            # Update the vendor
            cursor.execute("""
                UPDATE Dog
                SET microchipVendor = %s
                WHERE microchipID = %s
            """, [new_vendor, microchip_id])

        return JsonResponse({'message': 'Vendor updated successfully!'}, status=200)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")


@csrf_exempt
def get_breeds(request):
    # {
    #   "breeds": ["Akita", "Boxer", "Mixed", "Unknown", ...]
    # }
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COLUMN_TYPE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'Breeds'
                AND COLUMN_NAME = 'breedName'
            """)
            enum_data = cursor.fetchone()[0]

            breeds = enum_data.replace("enum(", "").replace(")", "").replace("'", "").split(",")

        return JsonResponse({'breeds': breeds}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
#
# {
#   "breeds": [
#     "Affenpinscher",
#     "Afghan Hound",
#     "Akita",
#     "Mixed",
#     "Unknown"
#   ]
# }

@csrf_exempt
def get_breeds_by_dogID(request, dog_id):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT breedName FROM Breeds
                WHERE dogID = %s
                ORDER BY breedName ASC
            """, [dog_id])
            rows = cursor.fetchall()

        if not rows:
            return JsonResponse({'message': f'No breeds found for dog ID {dog_id}'}, status=404)

        breeds = [row[0] for row in rows]

        return JsonResponse({'dogID': dog_id, 'breeds': breeds}, status=200)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

# {
#   "dogID": 2,
#   "breeds": ["Boxer", "Pitbull"]
# }

@csrf_exempt
def save_breed(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    try:
        data = json.loads(request.body)
        dogID = data.get('dogID')
        breed = data.get('breedName')

        if not dogID or not breed:
            return JsonResponse({'error': 'Missing dogID or breedName'}, status=400)

        with connection.cursor() as cursor:
            # Check if dog exists
            cursor.execute("SELECT id FROM Dog WHERE id = %s", [dogID])
            if not cursor.fetchone():
                return JsonResponse({'error': 'Dog not found'}, status=404)

            # Check valid ENUM value
            cursor.execute("""
                SELECT COLUMN_TYPE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'Breeds'
                AND COLUMN_NAME = 'breedName'
            """)
            enum_data = cursor.fetchone()[0]
            allowed_breeds = enum_data.replace("enum(", "").replace(")", "").replace("'", "").split(",")

            if breed not in allowed_breeds:
                return JsonResponse({'error': f'Invalid breed: {breed}'}, status=400)

            # Check existing breed for dog
            cursor.execute("SELECT breedName FROM Breeds WHERE dogID = %s", [dogID])
            existing = cursor.fetchone()

            if existing and existing[0] not in ['Mixed', 'Unknown']:
                return JsonResponse({'error': 'Breed already set and cannot be edited unless Mixed or Unknown'}, status=403)

            # Replace existing breed
            cursor.execute("DELETE FROM Breeds WHERE dogID = %s", [dogID])
            cursor.execute("""
                INSERT INTO Breeds (dogID, breedName)
                VALUES (%s, %s)
            """, [dogID, breed])

        return JsonResponse({'message': 'Breed saved successfully'}, status=201)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

# {
#   "dogID": 2,
#   "breedName": "Australian Shepherd"
# }





















