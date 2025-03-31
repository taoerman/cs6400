from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = "Create Application table"

    def handle(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Application (
                    applicationID INT AUTO_INCREMENT PRIMARY KEY,
                    adopterID INT NOT NULL,
                    dogID INT NOT NULL,
                    applicationDate DATE NOT NULL,
                    applicationStatus VARCHAR(20) NOT NULL CHECK (applicationStatus IN ('pending approval', 'approved', 'rejected')),
                    statusDecisionDate DATE DEFAULT NULL,
                    CONSTRAINT fk_adopter FOREIGN KEY (adopterID) REFERENCES Adopter(adopterID),
                    CONSTRAINT fk_dog FOREIGN KEY (dogID) REFERENCES Dog(id),
                    CONSTRAINT unique_adopter_date UNIQUE (adopterID, applicationDate)
                );
            """)
            # UNIQUE (adopterID, applicationDate) to ensure only one application per adopter per day
        self.stdout.write(self.style.SUCCESS("Application table created successfully."))