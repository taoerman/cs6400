from django.db import connection
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Create Expense table"

    def handle(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Expense (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    date DATE NOT NULL,
                    category VARCHAR(100),
                    description TEXT
                )
            """)
        self.stdout.write(self.style.SUCCESS("Expense table created successfully."))
