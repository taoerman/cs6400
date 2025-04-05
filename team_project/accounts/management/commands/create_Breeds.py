from django.db import connection
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Create Breeds table"

    def handle(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Breeds (
                    dogID INT NOT NULL,
                    breedName ENUM('Affenpinscher', 'Afghan Hound', 'Airedale Terrier', 'Akbash Dog', 'Akita', 'Alaskan Husky', 'Alaskan Malamute','American Bulldog','American Foxhound','American Pit Bull Terrier','American Water Spaniel','Aussiedoodle','Australian Cattle Dog','Australian Kelpie','Australian Shepherd','Australian Terrier','Azawakh','Basenji','Basset Bleu de Gascogne','Basset Hound','Bearded Collie','Beauceron','Bedlington Terrier', 'Belgian Laekenois','Belgian Malinois','Belgian Sheepdog','Belgian Tervuren','Berger Picard','Bernese Mountain Dog','Bichon Frise','Black and Tan Coonhound','Black Russian Terrier','Bloodhound','Blue Picardy Spaniel','Bluetick Coonhound','Boerboel', 'Bolognese', 'Border Terrier','Borzoi','Boston Terrier','Bouvier des Flandres','Boxer', 'Boykin Spaniel', 'Brussels Griffon','Bull Terrier','Bullmastiff','Cairn Terrier','Canaan Dog','Cane Corso','Cardigan Welsh Corgi','Catahoula Leopard Dog', 'Bulldog', 'Mixed', 'Unknown') NOT NULL,
                    PRIMARY KEY (dogID, breedName),
                    FOREIGN KEY (dogID) REFERENCES Dog(id) ON DELETE CASCADE
                )
            """)
        self.stdout.write(self.style.SUCCESS("Breeds table created."))