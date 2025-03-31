from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = "Renames 'startDate' column to 'adoptionDate' in the Adoption table"

    def handle(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute("""
                ALTER TABLE Adoption
                CHANGE COLUMN startDate adoptionDate DATE NOT NULL;
            """)
        self.stdout.write(self.style.SUCCESS("Renamed 'startDate' to 'adoptionDate' in the Adoption table."))