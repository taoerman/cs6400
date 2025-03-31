from django.db import connection
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Create Expense table"

    def handle(self, *args, **kwargs):
        with connection.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Expense (
                    expenseID INT AUTO_INCREMENT PRIMARY KEY,
                    dogID INT NOT NULL,
                    expenseDate DATE NOT NULL,
                    expenseVendor VARCHAR(255) NOT NULL,
                    expenseCategory JSON NOT NULL,
                    expenseAmount DECIMAL(10, 2) NOT NULL CHECK (expenseAmount >= 0),
                    FOREIGN KEY (dogID) REFERENCES Dog(id)
                )
            """)
        self.stdout.write(self.style.SUCCESS("Expense table created successfully."))
