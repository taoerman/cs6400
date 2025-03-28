from django.http import JsonResponse
from django.db import connection


def get_all_dogs(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method allowed'}, status=405)

    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM Dog")
        columns = [col[0] for col in cursor.description]
        dogs = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return JsonResponse(dogs, safe=False)