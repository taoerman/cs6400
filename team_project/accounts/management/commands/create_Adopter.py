from django.db import connection
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Create Dog table"

    def handle(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute("""
                            CREATE TABLE IF NOT EXISTS Adopter (
                                adopterID INT AUTO_INCREMENT PRIMARY KEY,
                                adopterEmail VARCHAR(255) UNIQUE NOT NULL,
                                firstName VARCHAR(100) NOT NULL,
                                lastName VARCHAR(100) NOT NULL,
                                street VARCHAR(255) NOT NULL,
                                city VARCHAR(100) NOT NULL,
                                state VARCHAR(100) NOT NULL,
                                zipCode VARCHAR(20) NOT NULL,
                                phoneNumber VARCHAR(20) NOT NULL,
                                householdSize INT NOT NULL
                            );
                        """)
        self.stdout.write(self.style.SUCCESS("adopter table created."))