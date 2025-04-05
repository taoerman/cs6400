from django.http import JsonResponse, HttpResponseBadRequest
from django.db import connection
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json

def get_current_shelter_status():
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM Dog")
        total_dogs = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM Adoption")
        adopted_dogs = cursor.fetchone()[0]

        current_in_shelter = total_dogs - adopted_dogs
    return current_in_shelter, settings.MAX_SHELTER_CAPACITY


def get_all_dogs(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method allowed'}, status=405)

    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM Dog")
        columns = [col[0] for col in cursor.description]
        dogs = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return JsonResponse(dogs, safe=False)

@csrf_exempt
def shelter_capacity(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        current, max_capacity = get_current_shelter_status()
        remain_space = max_capacity - current
        return JsonResponse({
            'currentInShelter': current,
            'maxCapacity': max_capacity,
            'remainingSpace': remain_space
        }, status=200)
    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

@csrf_exempt
def add_dog(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST allowed'}, status=405)

    try:
        # Get user_email from session
        user_email = request.session.get('user_email')
        if not user_email:
            return JsonResponse({'error': 'User not authenticated'}, status=403)

        data = json.loads(request.body)
        # Extract fields
        name = data['name']
        breed = json.dumps(data['breed'])
        sex = data.get('sex', 'Unknown').capitalize()
        print(sex)
        altered = 1 if data['altered'] else 0
        print(altered)
        age = data['ageForMonths']
        surrendered_by_control = 1 if data['surrenderedByAnimalControl'] else 0
        print(surrendered_by_control)
        surrender_phone = data.get('surrenderPhone')
        microchip_id = data.get('microchipID')
        microchip_vendor = data.get('microchipVendor')
        description = data.get('description', '')

        # if animal control → phone is required
        if surrendered_by_control and not surrender_phone:
            return JsonResponse({'error': 'surrenderPhone is required when surrenderedByAnimalControl is true'}, status=400)

        # Bulldog + Uga restriction
        if 'Bulldog' in breed and name.strip().lower() == 'uga':
            return JsonResponse({
                'error': 'Bulldogs named Uga are not allowed, You must change to another name',
            }, status=400)

        current, max_capacity = get_current_shelter_status()

        if current > max_capacity:
            return JsonResponse({'error': f'Dog shelter is full (max {settings.MAX_SHELTER_CAPACITY} dogs)'}, status=400)

        # Convert breed list to JSON string
        # breed_json = json.dumps(breed)

        with connection.cursor() as cursor:
            # Check if microchipID already exists (if provided)
            cursor.execute("SELECT COUNT(*) FROM Dog WHERE microchipID = %s", [microchip_id])
            if cursor.fetchone()[0] > 0:
                return JsonResponse({
                    'error': 'A dog with this microchip ID already exists.',
                }, status=400)

            cursor.execute("""
                INSERT INTO Dog (name, breed, sex, altered, ageForMonths, description,
                    microchipID, microchipVendor, surrenderedByAnimalControl,
                    surrenderPhone, surrenderDate,  user_email)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_DATE, %s)
            """, [
                name, breed, sex, altered, age, description,
                microchip_id, microchip_vendor, surrendered_by_control, surrender_phone, user_email
            ])

        return JsonResponse({'message': 'Dog added successfully!'}, status=201)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

@csrf_exempt
def get_dog_by_id(request, dog_id):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM Dog WHERE id = %s", [dog_id])
            row = cursor.fetchone()
            if row is None:
                return JsonResponse({'error' : 'Dog Not Found'}, status=404)

            columns = [col[0] for col in cursor.description]
            dog = dict(zip(columns, row))
        return JsonResponse(dog, status=200)
    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

@csrf_exempt
def edit_dog(request, dog_id):
    if request.method != 'PUT':
        return JsonResponse({'error' : 'Only PUT Allowed'}, status=405)

    try:
        # Get user info from session
        user_email = request.session.get('user_email')
        is_exec = request.session.get('is_exec')

        if not user_email:
            return JsonResponse({'error': 'User not logged in'}, status=403)

        data = json.loads((request.body))
        new_sex = data.get('sex')
        new_breed = json.dumps(data.get('breed'))
        new_microchip = data.get('microchipID')

        if new_sex not in ['Male', 'Female', 'Unknown']:
            return JsonResponse({'error' : 'Invalid Syntax value'}, status=400)

            # If not ED, check age before allowing microchipID change
            if not is_exec and new_microchip:
                with connection.cursor() as cursor:
                    cursor.execute("""
                            SELECT birthDate FROM User WHERE userEmail = %s
                        """, [user_email])
                    row = cursor.fetchone()

                    if not row:
                        return JsonResponse({'error': 'User not found'}, status=404)

                    birth_date = row[0]
                    today = date.today()
                    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

                    if age < 18:
                        return JsonResponse({'error': 'Only users 18+ can update microchipID'}, status=403)


        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE Dog
                SET sex = %s, breed = %s, microchipID = %s
                WHERE id = %s
            """, [new_sex, new_breed, new_microchip, dog_id])

        return JsonResponse({'message' : 'Dog updated successfully'})

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

@csrf_exempt
def get_vendors(request):
    # {
    #   "vendors": ["PetLink", "AVID", "HomeAgain"]
    # }
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COLUMN_TYPE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'Dog'
                AND COLUMN_NAME = 'microchipVendor'
            """)
            enum_data = cursor.fetchone()[0]

            vendors = enum_data.replace("enum(", "").replace(")", "").replace("'", "").split(",")

        return JsonResponse({'vendors': vendors}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def edit_vendor(request):
    # {
    #   "microchipID": "MC555000333",
    #   "microchipVendor": "HomeAgain"
    # }

    if request.method != 'PUT':
        return JsonResponse({'error': 'Only PUT allowed'}, status=405)

    try:
        # Check if user is an Executive Director
        if not request.session.get('isExecutiveDirector'):
            return JsonResponse({'error': 'Only Executive Directors can edit vendor info.'}, status=403)

        data = json.loads(request.body)
        microchip_id = data.get('microchipID')
        new_vendor = data.get('microchipVendor')

        if not microchip_id or not new_vendor:
            return JsonResponse({'error': 'microchipID and microchipVendor are required.'}, status=400)

        with connection.cursor() as cursor:
            # Check if the dog exists
            cursor.execute("SELECT id FROM Dog WHERE microchipID = %s", [microchip_id])
            row = cursor.fetchone()
            if not row:
                return JsonResponse({'error': 'Dog with given microchipID not found.'}, status=404)

            # Update the vendor
            cursor.execute("""
                UPDATE Dog
                SET microchipVendor = %s
                WHERE microchipID = %s
            """, [new_vendor, microchip_id])

        return JsonResponse({'message': 'Vendor updated successfully!'}, status=200)

    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")


@csrf_exempt
def show_all_breeds(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET allowed'}, status=405)

    breeds = [
        "Affenpinscher", "Afghan Hound", "Airedale Terrier", "Akbash Dog", "Akita",
        "Alapaha Blue Blood Bulldog", "Alaskan Husky", "Alaskan Malamute", "American Bulldog",
        "American Eskimo", "American Foxhound", "American Pit Bull Terrier", "American Staffordshire Terrier",
        "American Water Spaniel", "Anatolian Shepherd Dog", "Aussiedoodle", "Australian Cattle Dog",
        "Australian Kelpie", "Australian Shepherd", "Australian Terrier", "Azawakh", "Basador", "Basenji",
        "Basset Bleu de Gascogne", "Basset Hound", "Beagle", "Bearded Collie", "Beauceron",
        "Bedlington Terrier", "Belgian Laekenois", "Belgian Malinois", "Belgian Sheepdog", "Belgian Tervuren",
        "Bergamasco", "Berger Picard", "Bernese Mountain Dog", "Bichon Frise", "Black and Tan Coonhound",
        "Black Russian Terrier", "Bloodhound", "Blue Picardy Spaniel", "Bluetick Coonhound", "Boerboel",
        "Bolognese", "Border Collie", "Border Terrier", "Borzoi", "Boston Terrier", "Bouvier des Flandres",
        "Boxer", "Boykin Spaniel", "Bracco Italiano", "Briard", "Brittany", "Brussels Griffon",
        "Bull Terrier", "Bulldog", "Bullmastiff", "Cairn Terrier", "Canaan Dog", "Cane Corso",
        "Cardigan Welsh Corgi", "Catahoula Leopard Dog", "Caucasian Ovcharka", "Cavalier King Charles Spaniel",
        "Cavapoo", "Cesky Terrier", "Chart Polski", "Chesapeake Bay Retriever", "Chihuahua",
        "Chinese Crested", "Chinese Shar-Pei", "Chinook", "Chow Chow", "Chug", "Cirneco dell'Etna",
        "Clumber Spaniel", "Cockapoo", "Cocker Spaniel", "Collie", "Coton de Tulear", "Curly-Coated Retriever",
        "Dachshund", "Dalmatian", "Dandie Dinmont Terrier", "Doberman Pinscher", "Dogo Argentino",
        "Dogue de Bordeaux", "Doxiepoo", "English Cocker Spaniel", "English Foxhound", "English Setter",
        "English Springer Spaniel", "English Toy Spaniel", "Entlebucher Mountain Dog", "Eurasier",
        "Field Spaniel", "Fila Brasileiro", "Finnish Lapphund", "Finnish Spitz", "Flat-Coated Retriever",
        "Fox Terrier", "French Bulldog", "German Pinscher", "German Shepherd Dog", "German Shorthaired Pointer",
        "German Spitz", "German Wirehaired Pointer", "Giant Schnauzer", "Glen of Imaal Terrier",
        "Golden Retriever", "Goldendoodle", "Gordon Setter", "Great Dane", "Great Pyrenees",
        "Greater Swiss Mountain Dog", "Greyhound", "Harrier", "Havanese", "Ibizan Hound",
        "Icelandic Sheepdog", "Irish Red and White Setter", "Irish Setter", "Irish Terrier",
        "Irish Water Spaniel", "Irish Wolfhound", "Italian Greyhound", "Jack Russell Terrier",
        "Japanese Chin", "Keeshond", "Kerry Blue Terrier", "Komondor", "Kooikerhondje", "Kromfohrlander",
        "Kuvasz", "Labradoodle", "Labrador Retriever", "Lacy Dog", "Lagotto Romagnolo", "Lakeland Terrier",
        "Large Munsterlander", "Leonberger", "Lhasa Apso", "Lhasapoo", "Longdog", "Lowchen", "Lurcher",
        "Maltese", "Maltipoo", "Manchester Terrier", "Mastiff", "Miniature American Shepherd",
        "Miniature Bull Terrier", "Miniature Pinscher", "Miniature Schnauzer", "Mixed", "Mudi",
        "Neapolitan Mastiff", "Newfoundland", "Norfolk Terrier", "Norwegian Buhund", "Norwegian Elkhound",
        "Norwegian Lundehund", "Norwich Terrier", "Nova Scotia Duck Tolling Retriever", "Old English Sheepdog",
        "Otterhound", "Papillon", "Pekingese", "Pembroke Welsh Corgi", "Perro de Presa Canario",
        "Peruvian Inca Orchid", "Petit Basset Griffon Vendeen", "Pharaoh Hound", "Plott", "Pointer",
        "Polish Lowland Sheepdog", "Pomapoo", "Pomeranian", "Pomsky", "Poodle", "Portuguese Podengo",
        "Portuguese Water Dog", "Pug", "Pugapoo", "Puggle", "Puli", "Pumi", "Pyrenean Shepherd",
        "Rat Terrier", "Redbone Coonhound", "Rhodesian Ridgeback", "Rottweiler", "Russian Toy", "Saluki",
        "Samoyed", "Schapendoes", "Schipperke", "Schnauzer", "Schnoodle", "Scottish Deerhound",
        "Scottish Terrier", "Sealyham Terrier", "Shetland Sheepdog", "Shiba Inu", "Shih Tzu", "Shihpoo",
        "Siberian Husky", "Silken Windhound", "Silky Terrier", "Skye Terrier", "Sloughi",
        "Small Munsterlander Pointer", "Soft Coated Wheaten Terrier", "Spanish Greyhound", "Spanish Water Dog",
        "Spinone Italiano", "Sprollie", "Staffordshire Bull Terrier", "Standard Schnauzer", "Sussex Spaniel",
        "Swedish Lapphund", "Swedish Vallhund", "Thai Ridgeback", "Tibetan Mastiff", "Tibetan Spaniel",
        "Tibetan Terrier", "Tosa Ken", "Toy Fox Terrier", "Toy Poodle", "Treeing Walker Coonhound",
        "Vizsla", "Volpino Italiano", "Weimaraner", "Welsh Springer Spaniel", "Welsh Terrier",
        "West Highland White Terrier", "Whippet", "Wirehaired Pointing Griffon", "Wirehaired Vizsla",
        "Xoloitzcuintli", "Yorkipoo", "Yorkshire Terrier", "Unknown"
    ]

    return JsonResponse({'breeds': breeds}, status=200)






























