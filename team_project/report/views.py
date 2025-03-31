from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.db import connection


@csrf_exempt
def animal_control_report(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    # Only EDs can access this
    if not request.session.get("isExecutiveDirector"):
        return JsonResponse({"error": "Unauthorized"}, status=403)

    try:
        with connection.cursor() as cursor:
            # Get summary of dogs surrendered by animal control in last 6 months + this month
            cursor.execute("""
                SELECT 
                    MONTH(d.surrenderDate) AS monthNum,
                    COUNT(*) AS totalSurrendered,
                    SUM(CASE 
                        WHEN a.adoptionDate IS NOT NULL 
                             AND DATEDIFF(a.adoptionDate, d.surrenderDate) >= 60 
                        THEN 1 ELSE 0 END
                    ) AS adoptedAfter60Days,
                    COALESCE(SUM(e.expenseAmount), 0) AS totalExpenses
                FROM Dog d
                LEFT JOIN Adoption a ON d.id = a.dogID
                LEFT JOIN Expense e ON d.id = e.dogID
                WHERE d.surrenderedByAnimalControl = 1
                  AND d.surrenderDate >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
                GROUP BY MONTH(d.surrenderDate)
                ORDER BY monthNum
            """)

            rows = cursor.fetchall()
            result = []
            for row in rows:
                result.append({
                    "month": row[0],
                    "totalSurrendered": row[1],
                    "adoptedAfter60Days": row[2],
                    "totalExpenses": float(row[3])
                })

            return JsonResponse({"data": result}, status=200)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

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
