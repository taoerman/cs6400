import json
import hashlib
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseBadRequest
from django.db import connection


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
            request.session['user_email'] = email
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
