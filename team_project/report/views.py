from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
import calendar

@csrf_exempt
def animal_control_report(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        today = datetime.now()
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
                # Count of dogs surrendered by animal control
                cursor.execute("""
                    SELECT COUNT(*) FROM Dog
                    WHERE surrenderedByAnimalControl = 1
                    AND surrenderDate BETWEEN %s AND %s
                """, [start_date, end_date])
                surrendered = cursor.fetchone()[0]

                # Count of dogs adopted with 60+ days in rescue
                cursor.execute("""
                    SELECT COUNT(*) FROM Adoption A
                    JOIN Dog D ON A.dogID = D.id
                    WHERE A.adoptionDate BETWEEN %s AND %s
                    AND D.surrenderDate <= DATE_SUB(A.adoptionDate, INTERVAL 59 DAY)
                """, [start_date, end_date])
                adopted_60plus = cursor.fetchone()[0]

                # Sum of expenses for dogs adopted in this month
                cursor.execute("""
                    SELECT SUM(E.expenseAmount)
                    FROM Expense E
                    JOIN Adoption A ON E.dogID = A.dogID
                    WHERE A.adoptionDate BETWEEN %s AND %s
                """, [start_date, end_date])
                expenses = cursor.fetchone()[0] or 0.0

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
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        month = request.GET.get('month')
        year = request.GET.get('year')

        if not month or not year:
            return JsonResponse({'error': 'Missing month or year'}, status=400)

        try:
            month = int(month)
            year = int(year)
        except ValueError:
            return JsonResponse({'error': 'Month and year must be integers'}, status=400)

        if not (1 <= month <= 12):
            return JsonResponse({'error': 'Invalid month'}, status=400)

        start_date = datetime(year, month, 1).date()
        end_day = monthrange(year, month)[1]
        end_date = datetime(year, month, end_day).date()

        animal_control_surrenders = []
        adopted_60_plus_days = []
        adoption_expenses = []

        with connection.cursor() as cursor:
            # 1. Animal Control Surrenders
            cursor.execute("""
                SELECT id, sex, altered, microchipID, surrenderDate
                FROM Dog
                WHERE surrenderedByAnimalControl = 1
                  AND surrenderDate BETWEEN %s AND %s
                ORDER BY id ASC
            """, [start_date, end_date])

            dog_rows = cursor.fetchall()
            for row in dog_rows:
                dog_id = row[0]
                cursor.execute("SELECT breedName FROM Breeds WHERE dogID = %s", [dog_id])
                breeds = sorted([b[0] for b in cursor.fetchall()])
                animal_control_surrenders.append({
                    'dogID': dog_id,
                    'breed': ", ".join(breeds),
                    'sex': row[1],
                    'altered': bool(row[2]),
                    'microchipID': row[3],
                    'surrenderDate': row[4].strftime('%Y-%m-%d')
                })

            # 2. Dogs adopted in rescue 60+ days
            cursor.execute("""
                SELECT D.id, D.sex, D.microchipID, D.surrenderDate, A.adoptionDate
                FROM Dog D
                JOIN Adoption A ON D.id = A.dogID
                WHERE A.adoptionDate BETWEEN %s AND %s
            """, [start_date, end_date])

            for row in cursor.fetchall():
                dog_id = row[0]
                surrender_date = row[3]
                adoption_date = row[4]
                days_in_rescue = (adoption_date - surrender_date).days + 1
                if days_in_rescue >= 60:
                    cursor.execute("SELECT breedName FROM Breeds WHERE dogID = %s", [dog_id])
                    breeds = sorted([b[0] for b in cursor.fetchall()])
                    adopted_60_plus_days.append({
                        'dogID': dog_id,
                        'breed': ", ".join(breeds),
                        'sex': row[1],
                        'microchipID': row[2],
                        'surrenderDate': surrender_date.strftime('%Y-%m-%d'),
                        'daysInRescue': days_in_rescue
                    })

            # 3. Expenses for adopted dogs
            cursor.execute("""
                SELECT D.id, D.sex, D.microchipID, D.surrenderDate, D.surrenderedByAnimalControl,
                       IFNULL(SUM(E.expenseAmount), 0)
                FROM Dog D
                JOIN Adoption A ON D.id = A.dogID
                LEFT JOIN Expense E ON D.id = E.dogID
                WHERE A.adoptionDate BETWEEN %s AND %s
                GROUP BY D.id, D.sex, D.microchipID, D.surrenderDate, D.surrenderedByAnimalControl
                ORDER BY D.id ASC
            """, [start_date, end_date])

            for row in cursor.fetchall():
                dog_id = row[0]
                cursor.execute("SELECT breedName FROM Breeds WHERE dogID = %s", [dog_id])
                breeds = sorted([b[0] for b in cursor.fetchall()])
                adoption_expenses.append({
                    'dogID': dog_id,
                    'breed': ", ".join(breeds),
                    'sex': row[1],
                    'microchipID': row[2],
                    'surrenderDate': row[3].strftime('%Y-%m-%d'),
                    'surrenderedByAnimalControl': bool(row[4]),
                    'totalExpenses': float(row[5])
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


@csrf_exempt
def monthly_adoption_report(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        today = datetime.now(timezone.utc).date()
        start_month = (today.replace(day=1) - relativedelta(months=12))
        report = {}

        with connection.cursor() as cursor:
            for i in range(12):
                month_start = start_month + relativedelta(months=i)
                year = month_start.year
                month = month_start.month
                month_end = datetime(year, month, calendar.monthrange(year, month)[1]).date()
                month_label = f"{calendar.month_name[month]} {year}"
                report[month_label] = []

                # Get breeds involved in surrender or adoption
                cursor.execute("""
                    SELECT DISTINCT b.breedName
                    FROM Breeds b
                    JOIN Dog d ON b.dogID = d.id
                    LEFT JOIN Adoption a ON d.id = a.dogID
                    WHERE (d.surrenderDate BETWEEN %s AND %s OR a.adoptionDate BETWEEN %s AND %s)
                """, [month_start, month_end, month_start, month_end])
                breed_list = sorted([row[0] for row in cursor.fetchall()])

                for breed in breed_list:
                    # Surrender count
                    cursor.execute("""
                        SELECT COUNT(*) FROM Dog d
                        JOIN Breeds b ON d.id = b.dogID
                        WHERE b.breedName = %s AND d.surrenderDate BETWEEN %s AND %s
                    """, [breed, month_start, month_end])
                    total_surrendered = cursor.fetchone()[0]

                    cursor.execute("""
                        SELECT d.id, d.name, d.surrenderedByAnimalControl
                        FROM Adoption a
                        JOIN Dog d ON d.id = a.dogID
                        JOIN Breeds b ON d.id = b.dogID
                        WHERE b.breedName = %s AND a.adoptionDate BETWEEN %s AND %s
                    """, [breed, month_start, month_end])
                    adopted_dogs = cursor.fetchall()

                    total_adopted = len(set([d[0] for d in adopted_dogs]))
                    total_fees = 0.0

                    for dog_id, name, is_ac in adopted_dogs:
                        cursor.execute("SELECT SUM(expenseAmount) FROM Expense WHERE dogID = %s", [dog_id])
                        total_exp = float(cursor.fetchone()[0] or 0.0)

                        # Special fee logic
                        if name.lower() == "sideways":
                            cursor.execute("SELECT breedName FROM Breeds WHERE dogID = %s", [dog_id])
                            breeds = [b[0].lower() for b in cursor.fetchall()]
                            if any("terrier" in b for b in breeds):
                                fee = 0.0
                            else:
                                fee = round(total_exp * (0.1 if is_ac else 1.25), 2)
                        else:
                            fee = round(total_exp * (0.1 if is_ac else 1.25), 2)

                        total_fees += fee

                    # Expenses (exclude animal control dogs)
                    cursor.execute("""
                        SELECT SUM(e.expenseAmount)
                        FROM Expense e
                        JOIN Dog d ON d.id = e.dogID
                        JOIN Adoption a ON d.id = a.dogID
                        JOIN Breeds b ON d.id = b.dogID
                        WHERE b.breedName = %s AND a.adoptionDate BETWEEN %s AND %s AND d.surrenderedByAnimalControl = 0
                    """, [breed, month_start, month_end])
                    total_expenses = float(cursor.fetchone()[0] or 0.0)

                    report[month_label].append({
                        "breed": breed,
                        "totalSurrendered": total_surrendered,
                        "totalAdopted": total_adopted,
                        "totalAdoptionFees": round(total_fees, 2),
                        "totalExpenses": round(total_expenses, 2),
                        "netProfit": round(total_fees - total_expenses, 2)
                    })

        return JsonResponse({"report": report}, status=200)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")


@csrf_exempt
def expense_analysis(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    # Must be Executive Director
    # if not request.session.get('isExecutiveDirector'):
    #     return JsonResponse({'error': 'Unauthorized'}, status=403)

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
