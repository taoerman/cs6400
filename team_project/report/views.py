from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from datetime import datetime
from dateutil.relativedelta import relativedelta
import calendar

@csrf_exempt
def animal_control_report(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        today = datetime.today()
        first_day_current_month = today.replace(day=1)
        start_month = first_day_current_month - relativedelta(months=6)

        results = []

        for i in range(7):
            month_date = start_month + relativedelta(months=i)
            year, month = month_date.year, month_date.month
            start_date = datetime(year, month, 1)
            end_day = calendar.monthrange(year, month)[1]
            end_date = today if i == 6 else datetime(year, month, end_day)

            with connection.cursor() as cursor:
                # Surrendered by animal control
                cursor.execute("""
                    SELECT COUNT(*) FROM Dog
                    WHERE surrenderedByAnimalControl = 1
                    AND surrenderDate BETWEEN %s AND %s
                """, [start_date, end_date])
                surrendered = cursor.fetchone()[0]

                # Adopted in rescue 60+ days
                cursor.execute("""
                    SELECT COUNT(*) FROM Adoption A
                    JOIN Dog D ON A.dogID = D.id
                    WHERE A.AdoptionDate BETWEEN %s AND %s
                    AND D.surrenderDate <= DATE_SUB(A.AdoptionDate, INTERVAL 59 DAY)
                """, [start_date, end_date])
                adopted_60plus = cursor.fetchone()[0]

                # Total expenses for dogs adopted
                cursor.execute("""
                    SELECT SUM(E.expenseAmount)
                    FROM Expense E
                    JOIN Adoption A ON E.dogID = A.dogID
                    WHERE A.AdoptionDate BETWEEN %s AND %s
                """, [start_date, end_date])
                expenses = cursor.fetchone()[0] or 0

            results.append({
                'month': start_date.strftime('%Y-%m'),
                'surrendered_by_animal_control': surrendered,
                'adopted_60plus_days': adopted_60plus,
                'total_expenses': float(expenses)
            })

        return JsonResponse({'report': results}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def animal_control_monthly_details(request):
    # GET http://127.0.0.1:8080/report/animal_control_monthly_details?month=4&year=2025
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        month = int(request.GET.get('month'))
        year = int(request.GET.get('year'))

        if not (1 <= month <= 12):
            return JsonResponse({'error': 'Invalid month'}, status=400)

        start_date = datetime(year, month, 1).date()
        end_day = calendar.monthrange(year, month)[1]
        end_date = datetime(year, month, end_day).date()

        animal_control_surrenders = []
        adopted_60_plus_days = []
        adoption_expenses = []

        with connection.cursor() as cursor:
            # 1. Animal Control Surrenders
            cursor.execute("""
                SELECT id, breed, sex, altered, microchipID, surrenderDate
                FROM Dog
                WHERE surrenderedByAnimalControl = 1
                  AND surrenderDate BETWEEN %s AND %s
                ORDER BY id ASC
            """, [start_date, end_date])

            for row in cursor.fetchall():
                breed_list = sorted(json.loads(row[1]))
                animal_control_surrenders.append({
                    'dogID': row[0],
                    'breed': ", ".join(breed_list),
                    'sex': row[2],
                    'altered': bool(row[3]),
                    'microchipID': row[4],
                    'surrenderDate': row[5].strftime('%Y-%m-%d')
                })

            # 2. Dogs adopted in rescue 60+ days
            cursor.execute("""
                SELECT D.id, D.breed, D.sex, D.microchipID, D.surrenderDate, A.adoptionDate
                FROM Dog D
                JOIN Adoption A ON D.id = A.dogID
                WHERE A.adoptionDate BETWEEN %s AND %s
            """, [start_date, end_date])

            for row in cursor.fetchall():
                surrender_date = row[4]
                adoption_date = row[5]
                days_in_rescue = (adoption_date - surrender_date).days + 1
                if days_in_rescue >= 60:
                    adopted_60_plus_days.append({
                        'dogID': row[0],
                        'breed': ", ".join(sorted(json.loads(row[1]))),
                        'sex': row[2],
                        'microchipID': row[3],
                        'surrenderDate': surrender_date.strftime('%Y-%m-%d'),
                        'daysInRescue': days_in_rescue
                    })

            # 3. Total expenses for adopted dogs
            cursor.execute("""
                SELECT D.id, D.breed, D.sex, D.microchipID, D.surrenderDate, D.surrenderedByAnimalControl,
                       IFNULL(SUM(E.expenseAmount), 0)
                FROM Dog D
                JOIN Adoption A ON D.id = A.dogID
                LEFT JOIN Expense E ON D.id = E.dogID
                WHERE A.adoptionDate BETWEEN %s AND %s
                GROUP BY D.id, D.breed, D.sex, D.microchipID, D.surrenderDate, D.surrenderedByAnimalControl
                ORDER BY D.id ASC
            """, [start_date, end_date])

            for row in cursor.fetchall():
                adoption_expenses.append({
                    'dogID': row[0],
                    'breed': ", ".join(sorted(json.loads(row[1]))),
                    'sex': row[2],
                    'microchipID': row[3],
                    'surrenderDate': row[4].strftime('%Y-%m-%d'),
                    'surrenderedByAnimalControl': bool(row[5]),
                    'totalExpenses': float(row[6])
                })

        return JsonResponse({
            'month': month_name[month],
            'year': year,
            'animal_control_surrenders': animal_control_surrenders,
            'adopted_60_plus_days': sorted(adopted_60_plus_days, key=lambda x: (-x['daysInRescue'], -x['dogID'])),
            'adoption_expenses': adoption_expenses
        }, status=200)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")
# {
#   "month": "April",
#   "year": 2025,
#   "animal_control_surrenders": [
#     {
#       "dogID": 1,
#       "breed": "Beagle, Poodle",
#       "sex": "Male",
#       "altered": true,
#       "microchipID": "MC123456",
#       "surrenderDate": "2025-04-05"
#     }
#     ...
#   ],
#   "adopted_60_plus_days": [
#     {
#       "dogID": 2,
#       "breed": "Boxer",
#       "sex": "Female",
#       "microchipID": "MC789123",
#       "surrenderDate": "2024-12-01",
#       "daysInRescue": 122
#     }
#     ...
#   ],
#   "adoption_expenses": [
#     {
#       "dogID": 2,
#       "breed": "Boxer",
#       "sex": "Female",
#       "microchipID": "MC789123",
#       "surrenderDate": "2024-12-01",
#       "surrenderedByAnimalControl": false,
#       "totalExpenses": 312.50
#     }
#     ...
#   ]
# }


@csrf_exempt
def monthly_adoption_report(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    # Check if user is ED
    if not request.session.get("isExecutiveDirector"):
        return JsonResponse({"error": "Unauthorized"}, status=403)

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    MONTH(a.adoptionDate) AS monthNum,
                    COUNT(a.dogID) AS totalAdopted,
                    COALESCE(SUM(a.adoptionFee), 0) AS totalFees,
                    COALESCE(SUM(e.expenseAmount), 0) AS totalExpenses,
                    COALESCE(SUM(a.adoptionFee), 0) - COALESCE(SUM(e.expenseAmount), 0) AS netProfit
                FROM Adoption a
                JOIN Dog d ON a.dogID = d.id
                LEFT JOIN Expense e ON d.id = e.dogID
                WHERE a.adoptionDate >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
                GROUP BY MONTH(a.adoptionDate)
                ORDER BY MONTH(a.adoptionDate)
            """)

            rows = cursor.fetchall()
            result = []
            for row in rows:
                result.append({
                    "month": row[0],
                    "totalAdopted": row[1],
                    "totalFees": float(row[2]),
                    "totalExpenses": float(row[3]),
                    "netProfit": float(row[4])
                })

            return JsonResponse({"data": result}, status=200)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

@csrf_exempt
def expense_analysis(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    # Must be Executive Director
    if not request.session.get('isExecutiveDirector'):
        return JsonResponse({'error': 'Unauthorized'}, status=403)

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT expenseVendor, SUM(expenseAmount) AS totalSpent
                FROM Expense
                GROUP BY expenseVendor
                ORDER BY totalSpent DESC
            """)
            rows = cursor.fetchall()

        result = []
        for row in rows:
            result.append({
                'expenseVendor': row[0],
                'totalSpent': float(row[1])
            })

        return JsonResponse({'data': result}, status=200)


    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")
