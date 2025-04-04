import json
from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseBadRequest
from django.db import connection

@csrf_exempt
def get_all_expenses(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method allowed'}, status=405)

    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM Expense")
        columns = [col[0] for col in cursor.description]
        expenses = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return JsonResponse(expenses, safe=False)

@csrf_exempt
def add_expense(request):
    if request.method != 'POST':
        return JsonResponse({'error' : {'Only POST Allowed'}})

    try:
        data = json.loads(request.body)
        print(data)
        dogID = data['dogID']
        expenseDate = data['expenseDate']
        expenseVendor = data['expenseVendor']
        expenseCategory = data['expenseCategory']
        expenseAmount = data['expenseAmount']

        # List of categories; values must be from the admin-controlled category list
        if not isinstance(expenseCategory, list):
            return HttpResponseBadRequest("expenseCategory must be a list")
        expenseCategory_json = json.dumps(expenseCategory)

        # Expense amount (must be ≥ 0.00)
        if float(expenseAmount) < 0:
            return HttpResponseBadRequest("Expense amount must be ≥ 0")

        expense_date = datetime.strptime(expenseDate, "%Y-%m-%d").date()

        with connection.cursor() as cursor:
            # Get surrenderDate from Dog table
            cursor.execute("SELECT surrenderDate FROM Dog WHERE id = %s", [dogID])
            row = cursor.fetchone()
            if not row:
                return HttpResponseBadRequest({'error' : 'Dog not found'})
            surrenderDate = row[0]

            # Get adoptionDate from Adoption table
            cursor.execute("""
                            SELECT adoptionDate FROM Adoption
                            WHERE dogID = %s
                            ORDER BY adoptionDate DESC
                            LIMIT 1
                        """, [dogID])
            adoption_row = cursor.fetchone()
            adoptionDate = adoption_row[0] if adoption_row else None

            # Validate expenseDate is ≥ dog’s surrenderDate and ≤ dog’s adoptionDate if adopted.
            if expense_date < surrenderDate:
                return HttpResponseBadRequest("Expense date must be on or after surrenderDate")
            if adoptionDate and expense_date > adoptionDate:
                return HttpResponseBadRequest("Expense date must be on or before adoptionDate")

            # Check no duplicate expense (same dog, same date, same vendor).
            cursor.execute("""
                        SELECT COUNT(*) FROM Expense
                        WHERE dogID = %s AND expenseDate = %s AND expenseVendor = %s
                    """, [dogID, expenseDate, expenseVendor])
            duplicate_dog = cursor.fetchone()[0]
            if duplicate_dog > 0:
                return HttpResponseBadRequest("Duplicate expense detected")

            # Insert expense into Expense table
            cursor.execute("""
                            INSERT INTO Expense (dogID, expenseDate, expenseVendor, expenseCategory, expenseAmount)
                            VALUES (%s, %s, %s, %s, %s)
                        """, [
                dogID,
                expenseDate,
                expenseVendor,
                # json.dumps convert python obj to json
                # json.loads convert json to python obj list
                json.dumps(expenseCategory),
                expenseAmount
            ])

            return JsonResponse({"message": "Expense added successfully"}, status=201)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

@csrf_exempt
def view_dog_expense(request, dogID):
    if request.method != "GET":
        return HttpResponseBadRequest("Only GET requests are allowed.")

    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT expenseDate, expenseVendor, expenseCategory, expenseAmount
            FROM Expense
            WHERE dogID = %s
            ORDER BY expenseDate ASC
        """, [dogID])

        rows = cursor.fetchall()

    # Deserialize JSON category for each row
    expense_list = []
    for row in rows:
        expenseDate, expenseVendor, expenseCategory_json, expenseAmount = row
        try:
            expenseCategory = json.loads(expenseCategory_json)
        except Exception:
            expenseCategory = []

        expense_list.append({
            "expenseDate": expenseDate,
            "expenseVendor": expenseVendor,
            "expenseCategory": expenseCategory,
            "expenseAmount": float(expenseAmount),
        })

    return JsonResponse({"expenses": expense_list})
