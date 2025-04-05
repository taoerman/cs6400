from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = "Create the custom_table manually using raw SQL"

    def handle(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS User (
                    userEmail VARCHAR(255) PRIMARY KEY,
                    firstName VARCHAR(100),
                    lastName VARCHAR(100),
                    birthDate DATE,
                    phoneNumber VARCHAR(20),
                    isExecutiveDirector BOOLEAN,
                    password VARCHAR(255)
                )
            """)
        self.stdout.write(self.style.SUCCESS("User table created."))