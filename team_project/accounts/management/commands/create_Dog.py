from django.db import connection
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Create Dog table"

    def handle(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Dog (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    sex ENUM('Male', 'Female', 'Unknown') NOT NULL,
                    altered BOOLEAN NOT NULL,
                    ageForMonths INT NOT NULL,
                    description TEXT,
                    microchipID VARCHAR(100) UNIQUE DEFAULT NULL,
                    microchipVendor ENUM(
                        'PetSafe Chips', 'AVID', 'FurSecure ID', 'AKC Reunite', 'PawPrint ID', 'Trovan', 'PetLink', 'PawID Technologies', 'CritterID Systems', 'BarkCode Solutions', 'Destron Fearing', 'FurTrack Microchips', 'Datamars', '24PetWatch', 'PawTech Microchips', 'PetGuardian Chips', 'HomeAgain', 'FurryTag Systems', 'LifeChip', 'Banfield TruPaws'
                    ),
                    surrenderDate DATE NOT NULL,
                    surrenderPhone VARCHAR(20),
                    surrenderedByAnimalControl BOOLEAN NOT NULL,
                    user_email VARCHAR(255),
                    CHECK (
                        surrenderedByAnimalControl = FALSE OR surrenderPhone IS NOT NULL
                    )
                )
            """)
        self.stdout.write(self.style.SUCCESS("Dog table created."))