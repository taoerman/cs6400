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
                    microchipID VARCHAR(100) UNIQUE,
                    microchipVendor ENUM(
                        'AKC Reunite', 'AVID', 'Banfield TruPaws', 'BarkCode Solutions',
                        'CritterID Systems', 'Datamars', 'Destron Fearing', 'FurSecure ID',
                        'FurTrack Microchips', 'FurryTag Systems', 'HomeAgain', 'LifeChip',
                        'PawID Technologies', 'PawPrint ID', 'PawTech Microchips', 'PetGuardian Chips',
                        'PetLink', 'PetSafe Chips', 'Trovan', '24PetWatch'
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