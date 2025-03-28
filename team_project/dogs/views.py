from django.http import JsonResponse, HttpResponseBadRequest
from django.db import connection
from django.views.decorators.csrf import csrf_exempt
import json


def get_all_dogs(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method allowed'}, status=405)

    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM Dog")
        columns = [col[0] for col in cursor.description]
        dogs = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return JsonResponse(dogs, safe=False)

@csrf_exempt
def add_dog(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    try:
        data = json.loads(request.body)

        # Extract fields
        name = data['name']
        breed = data['breed']  # assumed to be a list of strings
        sex = data.get('sex', 'Unknown')
        altered = data['altered']
        age = data['ageForMonths']
        surrendered_by_control = data['surrenderedByAnimalControl']
        surrender_phone = data.get('surrenderPhone')
        microchip_id = data.get('microchipID')
        microchip_vendor = data.get('microchipVendor')
        description = data.get('description', '')

        # if animal control → phone is required
        if surrendered_by_control and not surrender_phone:
            return JsonResponse({'error': 'surrenderPhone is required when surrenderedByAnimalControl is true'}, status=400)

        # Bulldog + Uga restriction
        if 'Bulldog' in breed and name.strip().lower() == 'uga':
            return JsonResponse({'error': 'Bulldogs named Uga are not allowed'}, status=400)

        # Convert breed list to JSON string
        breed_json = json.dumps(breed)

        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO Dog (name, breed, sex, altered, ageForMonths, description,
                    microchipID, microchipVendor, surrenderedByAnimalControl,
                    surrenderPhone, surrenderDate)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_DATE)
            """, [
                name, breed_json, sex, altered, age, description,
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
