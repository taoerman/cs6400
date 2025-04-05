from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Update ENUM values for expenseCategory in Expense table'

    def handle(self, *args, **kwargs):
        update_enum_sql = """
        ALTER TABLE Expense 
        MODIFY COLUMN expenseCategory ENUM(
            'Veterinarian fees',
            'Dental care',
            'Treats and Toys',
            'Shelter supplies',
            'Transportation',
            'Medications',
            'Food supplies',
            'Leashes, collars, harnesses',
            'Grooming supplies',
            'Miscellaneous'
        ) NOT NULL;
        """

        with connection.cursor() as cursor:
            cursor.execute(update_enum_sql)

        self.stdout.write(self.style.SUCCESS('Expense table ENUM updated successfully.'))