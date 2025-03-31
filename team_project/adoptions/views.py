# adoptions/views.py

from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json

@csrf_exempt
def add_adoption_application(request):
    if request.method != 'POST':
        return HttpResponseBadRequest("Only POST requests are allowed.")

    try:
        data = json.loads(request.body)

        adopterEmail = data['adopterEmail']
        firstName = data['firstName']
        lastName = data['lastName']
        street = data['street']
        city = data['city']
        state = data['state']
        zipCode = data['zipCode']
        phoneNumber = data['phoneNumber']
        householdSize = data['householdSize']
        applicationDate = data['applicationDate']

        with connection.cursor() as cursor:
            # Check if adopter exists
            cursor.execute("SELECT adopterID FROM Adopter WHERE adopterEmail = %s", [adopterEmail])
            row = cursor.fetchone()

            if row:
                adopterID = row[0]
            else:
                # Insert new adopter
                cursor.execute("""
                    INSERT INTO Adopter (adopterEmail, firstName, lastName, street, city, state, zipCode, phoneNumber, householdSize)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, [adopterEmail, firstName, lastName, street, city, state, zipCode, phoneNumber, householdSize])
                adopterID = cursor.lastrowid

            # UNIQUE (adopterID, applicationDate) to ensure only one application per adopter per day
            try:
                cursor.execute("""
                                   INSERT INTO Application (adopterID, applicationDate, applicationStatus)
                                   VALUES (%s, %s, 'pending approval')
                               """, [adopterID, applicationDate])
            except IntegrityError:
                return HttpResponseBadRequest("One application per adopter per day.")

        return JsonResponse({"message": "Application submitted successfully."})

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json
from datetime import date

@csrf_exempt
def update_application_status(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    # Check if user is logged in and is an ED
    if not request.session.get('isExecutiveDirector'):
        return JsonResponse({'error': 'Permission denied. Only Executive Director can update status.'}, status=403)

    try:
        data = json.loads(request.body)
        application_id = data.get('applicationID')
        new_status = data.get('applicationStatus')  # should be 'approved' or 'rejected'

        if not application_id or new_status not in ['approved', 'rejected']:
            return JsonResponse({'error': 'Missing or invalid data'}, status=400)

        with connection.cursor() as cursor:
            # Make sure the application exists
            cursor.execute("SELECT applicationStatus FROM Application WHERE applicationID = %s", [application_id])
            row = cursor.fetchone()
            if not row:
                return JsonResponse({'error': 'Application not found'}, status=404)
            if row[0] != 'pending approval':
                return JsonResponse({'error': 'Only pending applications can be updated'}, status=400)

            # Update the status
            cursor.execute("""
                UPDATE Application
                SET applicationStatus = %s, statusDecisionDate = %s
                WHERE applicationID = %s
            """, [new_status, date.today(), application_id])

        return JsonResponse({'message': 'Application status updated successfully'}, status=200)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")
