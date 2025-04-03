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
        dogID = data['dogID']

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
                                   INSERT INTO Application (adopterID,  dogID, applicationDate, applicationStatus)
                                   VALUES (%s, %s, %s, 'pending approval')
                               """, [adopterID, dogID, applicationDate])
            except IntegrityError:
                return HttpResponseBadRequest("One application per adopter per day.")

        return JsonResponse({"message": "Application submitted successfully."})

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


@csrf_exempt
def review_pending_applications(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    # Check if current user is ED
    # if not request.session.get('isExecutiveDirector'):
    #     return JsonResponse({'error': 'Permission denied'}, status=403)

    try:
        with connection.cursor() as cursor:
            # Join Application, Adopter, and Dog tables
            cursor.execute("""
                SELECT 
                    A.applicationID,
                    A.applicationDate,
                    Ad.adopterID,
                    Ad.firstName,
                    Ad.lastName,
                    D.id,
                    D.name AS dogName,
                    A.applicationStatus,
                    Ad.adopterEmail,
                    Ad.phoneNumber
                FROM Application A
                JOIN Adopter Ad ON A.adopterID = Ad.adopterID
                JOIN Dog D ON A.dogID = D.id
                WHERE A.applicationStatus = 'pending approval'
                ORDER BY A.applicationDate ASC
            """)
            rows = cursor.fetchall()


        results = []
        for row in rows:
            results.append({
                'applicationID': row[0],
                'applicationDate': str(row[1]),
                'adopterID': row[2],
                'adopterName': f"{row[3]} {row[4]}",
                'dogID': row[5],
                'dogName': row[6],
                'status': row[7],
                'adopterEmail': row[8],
                'phoneNumber': row[9]
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
        adopterID = data.get('adopterID')

        with connection.cursor() as cursor:
            cursor.execute("""
                            SELECT applicationID FROM Application
                            WHERE dogID = %s AND adopterID = %s AND applicationStatus = 'approved'
                        """, [dogID, adopterID])
            approved_app = cursor.fetchone()

            if not approved_app:
                return JsonResponse({'error': 'No approved application found for this dog and adopter.'}, status=403)

            # Get total expenses
            cursor.execute("""
                SELECT SUM(expenseAmount)
                FROM Expense
                WHERE dogID = %s
            """, [dogID])
            result = cursor.fetchone()[0]
            total_expenses = float(result) if result is not None else 0.0

            # Check if dog is surrendered by animal control and get name, breed
            cursor.execute("""
                SELECT surrenderedByAnimalControl, name, breed
                FROM Dog
                WHERE id = %s
            """, [dogID])
            dog_row = cursor.fetchone()
            if not dog_row:
                return JsonResponse({'error': 'Dog not found.'}, status=404)

            surrendered_by_ac, dog_name, dog_breed = dog_row

            # Determine adoption fee
            # If (name = ‘Sideways’ AND breed LIKE ‘%Terrier%’), the adopter fee is waived (but still stored)
            if dog_name.lower() == 'sideways' and 'terrier' in dog_breed.lower():
                fee = 0
            elif surrendered_by_ac:
                # If surrenderedByAnimalControl is true, fee = 10% of total expenses; else 125% of total.
                fee = round(total_expenses * 0.10, 2)
            else:
                fee = round(total_expenses * 1.25, 2)

            # Insert into Adoption table
            cursor.execute("""
                INSERT INTO Adoption (dogID, adopterID, adoptionDate, adoptionFee)
                VALUES (%s, %s, CURRENT_DATE, %s)
            """, [dogID, adopterID, fee])

        return JsonResponse({
            'message': 'Adoption finalized successfully',
            'dogID': dogID,
            'adopterID': adopterID,
            'adoptionFee': fee
        }, status=201)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")
