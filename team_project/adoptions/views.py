# adoptions/views.py

from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError
from django.db import connection
import json
from datetime import date
from decimal import Decimal

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
            # Check if a duplicate application exists for this adopter on the same date
            cursor.execute("""
                SELECT 1 FROM Application
                WHERE adopterEmail = %s AND applicationDate = %s
            """, [adopterEmail, applicationDate])
            if cursor.fetchone():
                return HttpResponseBadRequest("One application per adopter per day.")

            # Check if there is already a pending application for this adopter
            cursor.execute("""
                            SELECT 1 FROM Application
                            WHERE adopterEmail = %s AND isApproved = 0 AND isRejected = 0
                        """, [adopterEmail])
            if cursor.fetchone():
                return HttpResponseBadRequest("You already have a pending application.")

            # Insert into Application table
            cursor.execute("""
                INSERT INTO Application (
                    adopterEmail, adopterFirstName, adopterLastName, adopterPhoneNumber,
                    AdopterStreet, adopterCity, adopterState, adopterZipCode, adopterHouseholdSize,
                    applicationDate, isApproved, isRejected
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0, 0)
            """, [
                adopterEmail, firstName, lastName, phoneNumber,
                street, city, state, zipCode, householdSize,
                applicationDate
            ])

        return JsonResponse({"message": "Application submitted successfully."})

    except IntegrityError:
        return HttpResponseBadRequest("One application per adopter per day (unique constraint failed).")
    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")


@csrf_exempt
def update_application_status(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    # Check if user is logged in and is an ED
    if not request.session.get('isExecutiveDirector'):
        return JsonResponse({'error': 'Permission denied. Only Executive Director can update status.'}, status=403)

    try:
        data = json.loads(request.body)
        adopter_email = data.get('adopterEmail')
        application_date = data.get('applicationDate')
        new_status = data.get('applicationStatus')

        if not adopter_email or not application_date or new_status not in ['approved', 'rejected']:
            return JsonResponse({'error': 'Missing or invalid data'}, status=400)

        with connection.cursor() as cursor:
            # Make sure the application exists and is still pending
            cursor.execute("""
                SELECT isApproved, isRejected
                FROM Application
                WHERE adopterEmail = %s AND applicationDate = %s
            """, [adopter_email, application_date])
            row = cursor.fetchone()
            if not row:
                return JsonResponse({'error': 'Application not found'}, status=404)

            if row[0] or row[1]:
                return JsonResponse({'error': 'Only pending applications can be updated'}, status=400)

            # Update application status
            if new_status == 'approved':
                cursor.execute("""
                    UPDATE Application
                    SET isApproved = 1, approvedDate = %s
                    WHERE adopterEmail = %s AND applicationDate = %s
                """, [date.today(), adopter_email, application_date])
            else:
                cursor.execute("""
                    UPDATE Application
                    SET isRejected = 1, rejectedDate = %s
                    WHERE adopterEmail = %s AND applicationDate = %s
                """, [date.today(), adopter_email, application_date])

        return JsonResponse({'message': f'Application {new_status} successfully'}, status=200)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")


@csrf_exempt
def review_pending_applications(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    adopterEmail,
                    adopterFirstName,
                    adopterLastName,
                    adopterPhoneNumber,
                    applicationDate,
                    isApproved,
                    isRejected
                FROM Application
                WHERE isApproved = 0 AND isRejected = 0
                ORDER BY applicationDate ASC
            """)
            rows = cursor.fetchall()

        results = []
        for row in rows:
            results.append({
                'adopterEmail': row[0],
                'adopterName': f"{row[1]} {row[2]}",
                'phoneNumber': row[3],
                'applicationDate': str(row[4]),
                'status': 'pending'
            })

        return JsonResponse({'applications': results}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def finalize_adoption(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    if not request.session.get('isExecutiveDirector'):
        return JsonResponse({'error': 'Only Executive Directors can finalize adoptions.'}, status=403)

    try:
        data = json.loads(request.body)
        dogID = data.get('dogID')
        adopterEmail = data.get('adopterEmail')

        with connection.cursor() as cursor:
            # Check if there is an approved application for this dog + adopter
            cursor.execute("""
                SELECT applicationDate FROM Application
                WHERE adopterEmail = %s AND isApproved = 1 AND isRejected = 0
            """, [adopterEmail])
            app_row = cursor.fetchone()

            if not app_row:
                return JsonResponse({'error': 'No approved application found for this adopter.'}, status=403)

            # Insert into Adoption table
            cursor.execute("""
                INSERT INTO Adoption (dogID, adopterEmail, applicationDate, adoptionDate)
                VALUES (%s, %s, %s, CURRENT_DATE)
            """, [dogID, adopterEmail, app_row[0]])

        return JsonResponse({
            'message': 'Adoption finalized successfully',
            'dogID': dogID,
            'adopterEmail': adopterEmail,
        }, status=201)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

@csrf_exempt
def get_all_adoptions(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM Adoption")
            rows = cursor.fetchall()

            # Get column names
            columns = [col[0] for col in cursor.description]

            # Convert rows to list of dicts
            result = [dict(zip(columns, row)) for row in rows]

        return JsonResponse(result, safe=False)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

@csrf_exempt
def is_adopted(request, dog_id):
    """
    GET /adoptions/is_adopted/<dog_id>/
    """
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(*) FROM Adoption
                WHERE dogID = %s
            """, [dog_id])
            result = cursor.fetchone()[0]

        return JsonResponse({
            'dogID': dog_id,
            'isAdopted': result > 0
        }, status=200)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")


@csrf_exempt
def get_all_applications(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        with connection.cursor() as cursor:
            # get all applications
            cursor.execute("""
                SELECT adopterEmail, adopterFirstName, adopterLastName,
                       adopterPhoneNumber, AdopterStreet, adopterCity, adopterState,
                       adopterZipCode, adopterHouseholdSize, applicationDate,
                       isApproved, isRejected, approvedDate, rejectedDate
                FROM Application
                ORDER BY applicationDate DESC
            """)
            columns = [col[0] for col in cursor.description]
            applications = [dict(zip(columns, row)) for row in cursor.fetchall()]

            # get all (adopterEmail, applicationDate) that are in Adoption table
            cursor.execute("SELECT adopterEmail, applicationDate FROM Adoption")
            adopted_set = set(cursor.fetchall())

        # annotate each application
        for application in applications:
            key = (application['adopterEmail'], application['applicationDate'])
            application['adoptedAlready'] = key in adopted_set

        return JsonResponse({'applications': applications}, status=200)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")
    
@csrf_exempt
def get_adoption_fee_by_dogid(request, dogID):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        with connection.cursor() as cursor:
            # Get total expenses for the dog
            cursor.execute("""
                SELECT SUM(expenseAmount)
                FROM Expense
                WHERE dogID = %s
            """, [dogID])
            result = cursor.fetchone()[0]
            total_expenses = float(result) if result is not None else 0.0

            # Get dog info
            cursor.execute("""
                SELECT surrenderedByAnimalControl, name
                FROM Dog
                WHERE id = %s
            """, [dogID])
            dog_row = cursor.fetchone()
            if not dog_row:
                return JsonResponse({'error': 'Dog not found.'}, status=404)

            surrendered_by_ac, dog_name = dog_row

            cursor.execute("""
                SELECT breedName
                FROM Breeds
                WHERE dogID = %s
            """, [dogID])
            rows = cursor.fetchall()
            dog_breed = [row[0].lower() for row in rows]
            print(dog_breed)
            # Determine adoption fee
            if dog_name.lower() == 'sideways' and 'terrier' in dog_breed:
                fee = 0
            elif surrendered_by_ac:
                fee = round(total_expenses * 0.10, 2)
            else:
                fee = round(total_expenses * 1.25, 2)

        return JsonResponse({
            'dogID': dogID,
            'adoptionFee': fee
        }, status=200)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")
