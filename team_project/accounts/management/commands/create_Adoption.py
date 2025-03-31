from django.db import connection
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Create Dog table"

    def handle(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute("""
                            CREATE TABLE IF NOT EXISTS Adoption (
                                adoptionID INT AUTO_INCREMENT PRIMARY KEY,
                                dogID INT NOT NULL,
                                adopterID INT NOT NULL,
                                adoptionFee DECIMAL(10, 2) NOT NULL,
                                AdoptionDate DATE NOT NULL,
                                FOREIGN KEY (dogID) REFERENCES Dog(id),
                                FOREIGN KEY (adopterID) REFERENCES Adopter(adopterID)
                            );
                        """)
        self.stdout.write(self.style.SUCCESS("adoption table created."))