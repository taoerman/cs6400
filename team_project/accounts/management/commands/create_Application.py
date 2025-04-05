from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = "Create Application table"

    def handle(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Application (
                    adopterEmail VARCHAR(255),
                    adopterFirstName VARCHAR(100) NOT NULL,
                    adopterLastName VARCHAR(100) NOT NULL,
                    adopterPhoneNumber VARCHAR(20),
                    AdopterStreet VARCHAR(255),
                    adopterCity VARCHAR(100),
                    adopterState VARCHAR(100),
                    adopterZipCode VARCHAR(20),
                    adopterHouseholdSize INT,
                    applicationDate DATE NOT NULL,
                    isApproved BOOLEAN DEFAULT 0,
                    isRejected BOOLEAN DEFAULT 0,
                    approvedDate DATE DEFAULT NULL,
                    rejectedDate DATE DEFAULT NULL,
                    CONSTRAINT unique_application_per_day UNIQUE (adopterEmail, applicationDate)
                )
            """)
        self.stdout.write(self.style.SUCCESS("Application table created successfully."))
