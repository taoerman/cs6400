from django.db import connection
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Create Adoption table"

    def handle(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute("""
                            CREATE TABLE IF NOT EXISTS Adoption (
                                dogID INT NOT NULL,
                                adopterEmail VARCHAR(255) NOT NULL,
                                applicationDate DATE NOT NULL,
                                adoptionDate DATE NOT NULL,
                                FOREIGN KEY (dogID) REFERENCES Dog(id)
                            );
                        """)
        self.stdout.write(self.style.SUCCESS("Adoption table created."))