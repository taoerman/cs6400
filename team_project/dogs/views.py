from django.http import JsonResponse, HttpResponseBadRequest
from django.db import connection
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json

def get_current_shelter_status():
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM Dog")
        total_dogs = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM Adoption")
        adopted_dogs = cursor.fetchone()[0]

        current_in_shelter = total_dogs - adopted_dogs
    return current_in_shelter, settings.MAX_SHELTER_CAPACITY


def get_all_dogs(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method allowed'}, status=405)

    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM Dog")
        columns = [col[0] for col in cursor.description]
        dogs = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return JsonResponse(dogs, safe=False)

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
        data = json.loads(request.body)
        # Extract fields
        name = data['name']
        breed = json.dumps(data['breed'])
        sex = data.get('sex', 'Unknown').capitalize()
        print(sex)
        altered = 1 if data['altered'] else 0
        print(altered)
        age = data['ageForMonths']
        surrendered_by_control = 1 if data['surrenderedByAnimalControl'] else 0
        print(surrendered_by_control)
        surrender_phone = data.get('surrenderPhone')
        microchip_id = data.get('microchipID')
        microchip_vendor = data.get('microchipVendor')
        description = data.get('description', '')

        # if animal control → phone is required
        if surrendered_by_control and not surrender_phone:
            return JsonResponse({'error': 'surrenderPhone is required when surrenderedByAnimalControl is true'}, status=400)

        # Bulldog + Uga restriction
        if 'Bulldog' in breed and name.strip().lower() == 'uga':
            return JsonResponse({
                'error': 'Bulldogs named Uga are not allowed.',
                'alert': 'You must change to another name.'
            }, status=400)

        current, max_capacity = get_current_shelter_status()

        if current > max_capacity:
            return JsonResponse({'error': f'Dog shelter is full (max {settings.MAX_SHELTER_CAPACITY} dogs)'}, status=400)

        # Convert breed list to JSON string
        # breed_json = json.dumps(breed)

        with connection.cursor() as cursor:
            # Check if microchipID already exists (if provided)
            cursor.execute("SELECT COUNT(*) FROM Dog WHERE microchipID = %s", [microchip_id])
            if cursor.fetchone()[0] > 0:
                return JsonResponse({
                    'error': 'A dog with this microchip ID already exists.',
                }, status=400)

            cursor.execute("""
                INSERT INTO Dog (name, breed, sex, altered, ageForMonths, description,
                    microchipID, microchipVendor, surrenderedByAnimalControl,
                    surrenderPhone, surrenderDate)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_DATE)
            """, [
                name, breed, sex, altered, age, description,
                microchip_id, microchip_vendor, surrendered_by_control, surrender_phone
            ])

        return JsonResponse({'message': 'Dog added successfully!'}, status=201)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

@csrf_exempt
def get_dog_by_id(request, dog_id):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM Dog WHERE id = %s", [dog_id])
            row = cursor.fetchone()
            if row is None:
                return JsonResponse({'error' : 'Dog Not Found'}, status=404)

            columns = [col[0] for col in cursor.description]
            dog = dict(zip(columns, row))
        return JsonResponse(dog, status=200)
    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

@csrf_exempt
def edit_dog(request, dog_id):
    if request.method != 'PUT':
        return JsonResponse({'error' : 'Only PUT Allowed'}, status=405)

    try:
        # Get user info from session
        user_email = request.session.get('user_email')
        is_exec = request.session.get('is_exec')

        if not user_email:
            return JsonResponse({'error': 'User not logged in'}, status=403)

        data = json.loads((request.body))
        new_sex = data.get('sex')
        new_breed = json.dumps(data.get('breed'))
        new_microchip = data.get('microchipID')

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
                SET sex = %s, breed = %s, microchipID = %s
                WHERE id = %s
            """, [new_sex, new_breed, new_microchip, dog_id])

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






























