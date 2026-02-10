from django.core.management.base import BaseCommand
from django.core.management import call_command
from universities.models import (
    University, Course, CareerPath, LivingCostEstimate, 
    Scholarship, IntakeDate, CourseReview
)
from decimal import Decimal
import os

class Command(BaseCommand):
    help = 'Clear dummy university data and seed real 2025 data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("=== CLEARING DUMMY DATA ==="))
        
        # 1. Flush existing data
        # Note: University deletion cascades to Courses, Scholarships, etc.
        University.objects.all().delete()
        CareerPath.objects.all().delete()
        LivingCostEstimate.objects.all().delete()
        
        self.stdout.write(self.style.SUCCESS("Database cleared."))

        # 2. Seed Partners
        partners_file = 'data/partners.xlsx'
        if os.path.exists(partners_file):
            self.stdout.write(f"Importing partners from {partners_file}...")
            call_command('import_partners', partners_file)
        else:
            self.stderr.write(f"Partners file not found: {partners_file}")

        # 3. Seed Courses
        courses_file = 'data/all_universities_courses_2025.xlsx'
        if os.path.exists(courses_file):
            self.stdout.write(f"Importing courses from {courses_file}...")
            call_command('import_courses', file=courses_file)
        else:
            self.stderr.write(f"Courses file not found: {courses_file}")

        # 4. Seed Career Paths (Professional Standard)
        self.seed_career_paths()

        # 5. Seed Living Costs (Estimated)
        self.seed_living_costs()

        # 6. Seed Scholarships (Default for Partners)
        self.seed_scholarships()

        self.stdout.write(self.style.SUCCESS("\n=== REAL DATA SEEDING COMPLETE ==="))

    def seed_career_paths(self):
        careers = [
            {
                'name': 'Software Engineer',
                'sector': 'TECH',
                'salary_min': 32000, 'salary_median': 45000, 'salary_max': 85000,
                'growth_outlook': 'HIGH',
                'key_skills': 'Python, JavaScript, React, System Design'
            },
            {
                'name': 'Data Scientist',
                'sector': 'TECH',
                'salary_min': 35000, 'salary_median': 55000, 'salary_max': 95000,
                'growth_outlook': 'HIGH',
                'key_skills': 'Statistics, Machine Learning, Python, SQL'
            },
            {
                'name': 'Financial Analyst',
                'sector': 'FINANCE',
                'salary_min': 30000, 'salary_median': 42000, 'salary_max': 75000,
                'growth_outlook': 'STABLE',
                'key_skills': 'Financial Modeling, Excel, Risk Analysis'
            },
            {
                'name': 'Civil Engineer',
                'sector': 'ENGINEERING',
                'salary_min': 28000, 'salary_median': 38000, 'salary_max': 65000,
                'growth_outlook': 'MODERATE',
                'key_skills': 'AutoCAD, Structural Design, Project Management'
            },
            {
                'name': 'Marketing Manager',
                'sector': 'MARKETING',
                'salary_min': 28000, 'salary_median': 40000, 'salary_max': 70000,
                'growth_outlook': 'STABLE',
                'key_skills': 'SEO, Digital Strategy, Content Marketing'
            }
        ]
        
        for c in careers:
            CareerPath.objects.get_or_create(name=c['name'], defaults=c)
        self.stdout.write(f"Seeded {len(careers)} real career paths.")

    def seed_living_costs(self):
        costs = [
            {
                'city': 'London', 'country': 'UK', 'currency': 'GBP',
                'monthly_rent': 1200, 'monthly_food': 300, 'monthly_transport': 150,
                'monthly_utilities': 180, 'monthly_other': 250,
                'visa_fee': 490, 'ihs_per_year': 776
            },
            {
                'city': 'Manchester', 'country': 'UK', 'currency': 'GBP',
                'monthly_rent': 750, 'monthly_food': 250, 'monthly_transport': 80,
                'monthly_utilities': 140, 'monthly_other': 200,
            },
            {
                'city': 'Birmingham', 'country': 'UK', 'currency': 'GBP',
                'monthly_rent': 700, 'monthly_food': 250, 'monthly_transport': 75,
                'monthly_utilities': 140, 'monthly_other': 200,
            }
        ]
        
        for c in costs:
            LivingCostEstimate.objects.update_or_create(city=c['city'], country=c['country'], defaults=c)
        self.stdout.write(f"Seeded {len(costs)} UK living cost estimates.")

    def seed_scholarships(self):
        # Add a default 10% scholarship for all Partner Universities
        partners = University.objects.filter(is_partner=True)
        count = 0
        for uni in partners:
            Scholarship.objects.get_or_create(
                university=uni,
                name="Global Excellence Scholarship",
                defaults={
                    'description': "Automatic 10% reduction for all BWBS prioritized students meeting entry criteria.",
                    'amount_type': 'PERCENTAGE',
                    'value': Decimal('10.00'),
                    'min_cgpa': Decimal('60.0'),
                    'min_ielts': Decimal('6.0'),
                    'is_active': True
                }
            )
            count += 1
        self.stdout.write(f"Applied Excellence Scholarship to {count} partner universities.")
