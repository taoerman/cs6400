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
        end_day = calendar.monthrange(year, month)[1]
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
            'month': calendar.month_name[month],
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
                month_end_day = calendar.monthrange(year, month)[1]
                month_end = datetime(year, month, month_end_day).date()

                cursor.execute("""
                    SELECT DISTINCT d.id
                    FROM Dog d
                    LEFT JOIN Adoption a ON d.id = a.dogID
                    WHERE d.surrenderDate BETWEEN %s AND %s
                       OR a.adoptionDate BETWEEN %s AND %s
                """, [month_start, month_end, month_start, month_end])
                dog_ids = [row[0] for row in cursor.fetchall()]

                breed_map = {}

                for dog_id in dog_ids:
                    cursor.execute("SELECT breedName FROM Breeds WHERE dogID = %s", [dog_id])
                    breed_names = sorted([r[0] for r in cursor.fetchall()])
                    breed_key = "/".join(breed_names)
                    breed_map.setdefault(breed_key, []).append(dog_id)

                month_key = f"{calendar.month_name[month]} {year}"
                report[month_key] = []

                for breed_key, ids in breed_map.items():
                    total_surrendered = 0
                    total_adopted = 0
                    total_fees = 0.0
                    total_expenses = 0.0

                    for dog_id in ids:
                        # Check surrender date
                        cursor.execute("SELECT surrenderDate, name, surrenderedByAnimalControl FROM Dog WHERE id = %s", [dog_id])
                        dog_row = cursor.fetchone()
                        if not dog_row:
                            continue
                        surrender_date, name, is_ac = dog_row
                        if surrender_date and month_start <= surrender_date <= month_end:
                            total_surrendered += 1

                        # Check adoption date
                        cursor.execute("SELECT adoptionDate FROM Adoption WHERE dogID = %s", [dog_id])
                        adoption_row = cursor.fetchone()
                        if adoption_row:
                            adoption_date = adoption_row[0]
                            if month_start <= adoption_date <= month_end:
                                total_adopted += 1

                                # Get expenses
                                cursor.execute("SELECT SUM(expenseAmount) FROM Expense WHERE dogID = %s", [dog_id])
                                expense_sum = cursor.fetchone()[0]
                                expense_sum = float(expense_sum) if expense_sum else 0.0

                                # Calculate fee
                                if name.lower() == 'sideways':
                                    cursor.execute("SELECT breedName FROM Breeds WHERE dogID = %s", [dog_id])
                                    breed_list = [r[0].lower() for r in cursor.fetchall()]
                                    if any('terrier' in b for b in breed_list):
                                        fee = 0.0
                                    else:
                                        fee = round(expense_sum * (0.1 if is_ac else 1.25), 2)
                                elif is_ac:
                                    fee = round(expense_sum * 0.10, 2)
                                else:
                                    fee = round(expense_sum * 1.25, 2)

                                total_fees += fee

                                if not is_ac:
                                    total_expenses += expense_sum

                    if total_surrendered or total_adopted:
                        report[month_key].append({
                            "breed": breed_key,
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
