from django.http import JsonResponse
from django.db import connection


def get_all_expenses(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method allowed'}, status=405)

    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM Expense")
        columns = [col[0] for col in cursor.description]
        expenses = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return JsonResponse(expenses, safe=False)