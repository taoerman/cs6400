import json
import hashlib
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseBadRequest
from django.db import connection
from datetime import datetime


def get_users(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM User")
        columns = [col[0] for col in cursor.description]
        rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
    return JsonResponse(rows, safe=False)


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


# we use postman test API, @csrf_exempt has to be included.
@csrf_exempt
def register_user(request):
    # For register, we only allow POST requests
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    try:
        # Parses the JSON data from the request
        # Reads the POST data (request.body) and converts it from JSON into a Python dictionary using json.loads()
        data = json.loads(request.body)
        email = data['userEmail']
        first = data['firstName']
        last = data['lastName']
        birth = data['birthDate']
        phone = data['phoneNumber']
        is_exec = data['isExecutiveDirector']
        password = hash_password(data['password'])

        # Use raw sql query to check whether user already exists
        with connection.cursor() as cursor:
            # Check for duplicate email
            cursor.execute("SELECT * FROM User WHERE userEmail = %s", [email])
            if cursor.fetchone():
                return JsonResponse({'error': 'Email already registered'}, status=400)

            # Insert new user
            cursor.execute("""
                INSERT INTO User (userEmail, firstName, lastName, birthDate, phoneNumber, isExecutiveDirector, password)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, [email, first, last, birth, phone, is_exec, password])

        return JsonResponse({'message': 'User registered successfully!'}, status=201)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")


@csrf_exempt
def login_user(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    try:
        data = json.loads(request.body)
        email = data['userEmail']
        password = hash_password(data['password'])

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM User WHERE userEmail = %s AND password = %s
            """, [email, password])
            user = cursor.fetchone()

        if user:
            # save userEmail in session, we will use this in login_status api
            is_exec = user[5]
            request.session['user_email'] = email
            request.session['isExecutiveDirector'] = is_exec
            return JsonResponse({'message': 'Login successful'}, status=200)
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")


@csrf_exempt
def logout_user(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    try:
        # Clear the session
        request.session.flush()
        return JsonResponse({'message': 'Logout successful'}, status=200)
    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")


@csrf_exempt
def login_status(request):
    user_email = request.session.get("user_email")
    if user_email:
        return JsonResponse({'loggedIn': True, 'userEmail': user_email})
    else:
        return JsonResponse({'loggedIn': False})

@csrf_exempt
def volunteers(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT userEmail, firstName, lastName, phoneNumber
                FROM User
                WHERE isExecutiveDirector = FALSE
            """)
            rows = cursor.fetchall()

        volunteer_list = []
        for row in rows:
            volunteer_list.append({
                'userEmail': row[0],
                'firstName': row[1],
                'lastName': row[2],
                'phoneNumber': row[3],
            })

        return JsonResponse({'volunteers': volunteer_list}, status=200)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

@csrf_exempt
def volunteer_birthdays(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)
    # GET /accounts/volunteer_birthdays?month=03&year=2025

    try:
        month = request.GET.get('month')
        year = request.GET.get('year')

        if not month or not year:
            return JsonResponse({'error': 'Missing month or year'}, status=400)

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT firstName, lastName, userEmail, birthDate
                FROM User
                WHERE isExecutiveDirector = 0
                AND MONTH(birthDate) = %s
                AND YEAR(birthDate) = %s
            """, [month, year])

            rows = cursor.fetchall()

        if not rows:
            return JsonResponse({'message': 'No birthdays this month.'}, status=200)

        today = datetime.today()
        volunteer_list = []
        for row in rows:
            birth_date = row[3]
            age = today.year - birth_date.year
            is_milestone = (age % 10 == 0)

            volunteer_list.append({
                'firstName': row[0],
                'lastName': row[1],
                'userEmail': row[2],
                'birthDate': birth_date.strftime('%Y-%m-%d'),
                'age': age,
                'milestone': is_milestone,
            })

        return JsonResponse({'volunteers': volunteer_list}, status=200)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")
