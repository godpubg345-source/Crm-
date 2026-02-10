"""
Management command to seed the database with initial data for development/testing.
Creates branches, users with different roles, universities, courses, and sample leads/students.
"""
import uuid
from django.core.management.base import BaseCommand
from django.db import transaction
from accounts.models import User
from branches.models import Branch
from universities.models import University, Course, AdmissionCriteria


class Command(BaseCommand):
    help = 'Seed database with initial data for development and testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            self._clear_data()

        self.stdout.write('🚀 Starting database seed...')
        
        # Create Branches
        branches = self._create_branches()
        
        # Create Users with different roles
        users = self._create_users(branches)
        
        # Create Universities
        universities = self._create_universities()
        
        # Create Courses
        self._create_courses(universities)
        
        # Create Sample Leads and Students
        self._create_sample_data(branches, users)
        
        self.stdout.write(self.style.SUCCESS('✅ Database seeded successfully!'))
        self._print_summary()

    def _clear_data(self):
        """Clear non-essential data for re-seeding."""
        from students.models import Lead, Student, Document
        from applications.models import Application
        from visas.models import VisaCase
        from tasks.models import Task
        from communications.models import CommunicationLog
        from finance.models import Transaction, CommissionClaim
        
        # Clear in reverse dependency order
        CommunicationLog.all_objects.all().delete()
        Task.all_objects.all().delete()
        CommissionClaim.all_objects.all().delete()
        Transaction.all_objects.all().delete()
        VisaCase.all_objects.all().delete()
        Application.all_objects.all().delete()
        Document.all_objects.all().delete()
        Student.all_objects.all().delete()
        Lead.all_objects.all().delete()
        Course.all_objects.all().delete()
        AdmissionCriteria.all_objects.all().delete()
        University.all_objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()
        Branch.objects.all().delete()
        self.stdout.write('Data cleared.')

    def _create_branches(self):
        """Create branch offices."""
        branches_data = [
            {'code': 'UK-HQ', 'name': 'United Kingdom (Head Office)', 'country': 'United Kingdom', 'currency': 'GBP', 'is_hq': True, 'timezone': 'Europe/London'},
            {'code': 'BD-CUM', 'name': 'Cumilla, Bangladesh', 'country': 'Bangladesh', 'currency': 'BDT', 'timezone': 'Asia/Dhaka'},
            {'code': 'PK-ISB', 'name': 'Islamabad, Pakistan', 'country': 'Pakistan', 'currency': 'PKR', 'timezone': 'Asia/Karachi'},
            {'code': 'NG-ABJ', 'name': 'Nigeria', 'country': 'Nigeria', 'currency': 'NGN', 'timezone': 'Africa/Lagos'},
            {'code': 'IN-CHE', 'name': 'Chennai, India', 'country': 'India', 'currency': 'INR', 'timezone': 'Asia/Kolkata'},
            {'code': 'IN-NOR', 'name': 'North India', 'country': 'India', 'currency': 'INR', 'timezone': 'Asia/Kolkata'},
        ]
        
        branches = {}
        for data in branches_data:
            branch, created = Branch.objects.get_or_create(code=data['code'], defaults=data)
            branches[data['code']] = branch
            status = '✨ Created' if created else '⏭️ Exists'
            self.stdout.write(f"  {status}: Branch {branch.code}")
        
        return branches

    def _create_users(self, branches):
        """Create users with various roles."""
        users_data = [
            # Super Admin (already created via createsuperuser, skip)
            # Country Manager - Pakistan (Mapped to Islamabad)
            {'username': 'cm_pakistan', 'email': 'cm.pakistan@bwbs.com', 'first_name': 'Ahmed', 'last_name': 'Khan', 'role': User.Role.COUNTRY_MANAGER, 'branch_code': 'PK-ISB'},
            # Branch Managers
            {'username': 'bm_islamabad', 'email': 'bm.islamabad@bwbs.com', 'first_name': 'Usman', 'last_name': 'Ali', 'role': User.Role.BRANCH_MANAGER, 'branch_code': 'PK-ISB'},
            {'username': 'bm_chennai', 'email': 'bm.chennai@bwbs.com', 'first_name': 'Bilal', 'last_name': 'Ahmed', 'role': User.Role.BRANCH_MANAGER, 'branch_code': 'IN-CHE'},
            {'username': 'bm_nigeria', 'email': 'bm.nigeria@bwbs.com', 'first_name': 'Mohammed', 'last_name': 'Al-Farsi', 'role': User.Role.BRANCH_MANAGER, 'branch_code': 'NG-ABJ'},
            # Counselors
            {'username': 'counselor_isb', 'email': 'counselor.isb@bwbs.com', 'first_name': 'Sara', 'last_name': 'Ahmad', 'role': User.Role.COUNSELOR, 'branch_code': 'PK-ISB'},
            {'username': 'counselor_che', 'email': 'counselor.che@bwbs.com', 'first_name': 'Fatima', 'last_name': 'Hassan', 'role': User.Role.COUNSELOR, 'branch_code': 'IN-CHE'},
            {'username': 'counselor_cum', 'email': 'counselor.cum@bwbs.com', 'first_name': 'Ayesha', 'last_name': 'Shah', 'role': User.Role.COUNSELOR, 'branch_code': 'BD-CUM'},
            # Finance Officers
            {'username': 'finance_hq', 'email': 'finance@bwbs.com', 'first_name': 'James', 'last_name': 'Wilson', 'role': User.Role.FINANCE_OFFICER, 'branch_code': 'UK-HQ'},
            # Document Processors
            {'username': 'docs_isb', 'email': 'docs.isb@bwbs.com', 'first_name': 'Imran', 'last_name': 'Malik', 'role': User.Role.DOC_PROCESSOR, 'branch_code': 'PK-ISB'},
            # Auditor
            {'username': 'auditor', 'email': 'auditor@bwbs.com', 'first_name': 'Audit', 'last_name': 'Officer', 'role': User.Role.AUDITOR, 'branch_code': None},
        ]
        
        users = {}
        for data in users_data:
            branch_code = data.pop('branch_code', None)
            branch = branches.get(branch_code) if branch_code else None
            username = data['username']
            
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    password='password123',
                    branch=branch,
                    **data
                )
                users[username] = user
                self.stdout.write(f"  ✨ Created: User {user.email} ({user.get_role_display()})")
            else:
                users[username] = User.objects.get(username=username)
                self.stdout.write(f"  ⏭️ Exists: User {username}")
        
        return users


    def _create_universities(self):
        """Create partner and non-partner universities."""
        universities_data = [
            # UK Universities
            {'name': 'University of Manchester', 'country': 'UK', 'city': 'Manchester', 'is_partner': True, 'commission_rate': 15.0, 'criteria': {'min_percentage': 60, 'min_ielts': 6.5, 'priority_rank': 1}},
            {'name': 'University of Birmingham', 'country': 'UK', 'city': 'Birmingham', 'is_partner': True, 'commission_rate': 12.5, 'criteria': {'min_percentage': 55, 'min_ielts': 6.0, 'priority_rank': 2}},
            {'name': 'University of Leeds', 'country': 'UK', 'city': 'Leeds', 'is_partner': True, 'commission_rate': 12.0, 'criteria': {'min_percentage': 55, 'min_ielts': 6.0, 'priority_rank': 2}},
            {'name': 'University of Nottingham', 'country': 'UK', 'city': 'Nottingham', 'is_partner': True, 'commission_rate': 11.0, 'criteria': {'min_percentage': 55, 'min_ielts': 6.0, 'priority_rank': 3}},
            {'name': 'Coventry University', 'country': 'UK', 'city': 'Coventry', 'is_partner': True, 'commission_rate': 18.0, 'criteria': {'min_percentage': 50, 'min_ielts': 5.5, 'priority_rank': 1}},
            {'name': 'University of Oxford', 'country': 'UK', 'city': 'Oxford', 'is_partner': False, 'criteria': {'min_percentage': 85, 'min_ielts': 7.5, 'priority_rank': 10}},
            # Canadian Universities
            {'name': 'University of Toronto', 'country': 'CANADA', 'city': 'Toronto', 'is_partner': True, 'commission_rate': 10.0, 'criteria': {'min_percentage': 75, 'min_ielts': 7.0, 'priority_rank': 3}},
            {'name': 'McGill University', 'country': 'CANADA', 'city': 'Montreal', 'is_partner': False, 'criteria': {'min_percentage': 80, 'min_ielts': 7.0, 'priority_rank': 8}},
            # Australian Universities
            {'name': 'University of Melbourne', 'country': 'AUSTRALIA', 'city': 'Melbourne', 'is_partner': True, 'commission_rate': 13.0, 'criteria': {'min_percentage': 70, 'min_ielts': 6.5, 'priority_rank': 2}},
            {'name': 'Monash University', 'country': 'AUSTRALIA', 'city': 'Melbourne', 'is_partner': True, 'commission_rate': 12.0, 'criteria': {'min_percentage': 65, 'min_ielts': 6.5, 'priority_rank': 3}},
        ]
        
        universities = {}
        for data in universities_data:
            criteria_data = data.pop('criteria', None)
            name = data['name']
            
            uni, created = University.objects.get_or_create(name=name, defaults=data)
            universities[name] = uni
            
            if created and criteria_data:
                AdmissionCriteria.objects.create(university=uni, **criteria_data)
            
            status = '✨ Created' if created else '⏭️ Exists'
            self.stdout.write(f"  {status}: University {uni.name}")
        
        return universities

    def _create_courses(self, universities):
        """Create courses for universities."""
        courses_data = [
            # Manchester
            {'university': 'University of Manchester', 'name': 'MSc Data Science', 'level': 'PG', 'duration': '1 Year', 'tuition_fee': 29500, 'intakes': 'Sep'},
            {'university': 'University of Manchester', 'name': 'MSc Computer Science', 'level': 'PG', 'duration': '1 Year', 'tuition_fee': 28500, 'intakes': 'Sep'},
            {'university': 'University of Manchester', 'name': 'MBA', 'level': 'PG', 'duration': '1 Year', 'tuition_fee': 48500, 'intakes': 'Sep'},
            # Birmingham
            {'university': 'University of Birmingham', 'name': 'MSc Artificial Intelligence', 'level': 'PG', 'duration': '1 Year', 'tuition_fee': 27000, 'intakes': 'Sep, Jan'},
            {'university': 'University of Birmingham', 'name': 'BSc Computer Science', 'level': 'UG', 'duration': '3 Years', 'tuition_fee': 25500, 'intakes': 'Sep'},
            # Coventry
            {'university': 'Coventry University', 'name': 'MBA Global Business', 'level': 'PG', 'duration': '1 Year', 'tuition_fee': 18500, 'intakes': 'Sep, Jan, May'},
            {'university': 'Coventry University', 'name': 'MSc Cybersecurity', 'level': 'PG', 'duration': '1 Year', 'tuition_fee': 17500, 'intakes': 'Sep, Jan'},
            # Leeds
            {'university': 'University of Leeds', 'name': 'MSc Finance', 'level': 'PG', 'duration': '1 Year', 'tuition_fee': 29000, 'intakes': 'Sep'},
            # Toronto
            {'university': 'University of Toronto', 'name': 'MSc Engineering', 'level': 'PG', 'duration': '2 Years', 'tuition_fee': 52000, 'currency': 'CAD', 'intakes': 'Sep'},
            # Melbourne
            {'university': 'University of Melbourne', 'name': 'Master of Information Technology', 'level': 'PG', 'duration': '2 Years', 'tuition_fee': 48000, 'currency': 'AUD', 'intakes': 'Feb, Jul'},
        ]
        
        for data in courses_data:
            uni_name = data.pop('university')
            uni = universities.get(uni_name)
            if not uni:
                continue
            
            course, created = Course.objects.get_or_create(
                university=uni,
                name=data['name'],
                defaults={**data, 'currency': data.get('currency', 'GBP')}
            )
            
            if created:
                self.stdout.write(f"  ✨ Created: Course {course.name}")

    def _create_sample_data(self, branches, users):
        """Create sample leads and students."""
        from students.models import Lead, Student
        from applications.models import Application
        
        islamabad = branches.get('PK-ISB')
        chennai = branches.get('IN-CHE')
        counselor_isb = users.get('counselor_isb')
        counselor_che = users.get('counselor_che')
        
        if not islamabad or not counselor_isb:
            self.stdout.write('  ⚠️ Skipping sample data - missing branches/users')
            return
        
        # Sample Leads
        leads_data = [
            {'first_name': 'Ali', 'last_name': 'Raza', 'email': 'ali.raza@gmail.com', 'phone': '+923001234567', 'source': 'WEBSITE', 'status': 'NEW', 'branch': islamabad, 'assigned_to': counselor_isb},
            {'first_name': 'Zainab', 'last_name': 'Khan', 'email': 'zainab.khan@gmail.com', 'phone': '+923007654321', 'source': 'FACEBOOK', 'status': 'CONTACTED', 'branch': islamabad, 'assigned_to': counselor_isb},
            {'first_name': 'Hassan', 'last_name': 'Ahmed', 'email': 'hassan.ahmed@gmail.com', 'phone': '+923009876543', 'source': 'REFERRAL', 'status': 'QUALIFIED', 'branch': islamabad, 'assigned_to': counselor_isb},
            {'first_name': 'Mariam', 'last_name': 'Siddiqui', 'email': 'mariam.s@gmail.com', 'phone': '+919876543210', 'source': 'WALK_IN', 'status': 'NEW', 'branch': chennai, 'assigned_to': counselor_che},
        ]
        
        for data in leads_data:
            lead, created = Lead.objects.get_or_create(email=data['email'], defaults=data)
            if created:
                self.stdout.write(f"  ✨ Created: Lead {lead.full_name}")
        
        # Sample Students
        students_data = [
            {'student_code': 'ISB-2026-00001', 'first_name': 'Umar', 'last_name': 'Farooq', 'email': 'umar.farooq@gmail.com', 'phone': '+923001112233', 'branch': islamabad, 'counselor': counselor_isb, 'status': 'ACTIVE', 'nationality': 'Pakistan'},
            {'student_code': 'ISB-2026-00002', 'first_name': 'Amina', 'last_name': 'Bibi', 'email': 'amina.bibi@gmail.com', 'phone': '+923002223344', 'branch': islamabad, 'counselor': counselor_isb, 'status': 'ENROLLED', 'nationality': 'Pakistan'},
            {'student_code': 'CHE-2026-00001', 'first_name': 'Bilal', 'last_name': 'Hussain', 'email': 'bilal.h@gmail.com', 'phone': '+919876543211', 'branch': chennai, 'counselor': counselor_che, 'status': 'ACTIVE', 'nationality': 'India'},
        ]
        
        for data in students_data:
            student, created = Student.objects.get_or_create(student_code=data['student_code'], defaults=data)
            if created:
                self.stdout.write(f"  ✨ Created: Student {student.student_code}")

    def _print_summary(self):
        """Print summary of seeded data."""
        self.stdout.write('\n' + '='*50)
        self.stdout.write('📊 SEED DATA SUMMARY')
        self.stdout.write('='*50)
        self.stdout.write(f"  Branches: {Branch.objects.count()}")
        self.stdout.write(f"  Users: {User.objects.count()}")
        self.stdout.write(f"  Universities: {University.objects.count()}")
        self.stdout.write(f"  Courses: {Course.objects.count()}")
        
        from students.models import Lead, Student
        self.stdout.write(f"  Leads: {Lead.objects.count()}")
        self.stdout.write(f"  Students: {Student.objects.count()}")
        
        self.stdout.write('\n📝 TEST ACCOUNTS:')
        self.stdout.write('  Super Admin: admin@bwbs.com / admin123')
        self.stdout.write('  Country Manager: cm.pakistan@bwbs.com / password123')
        self.stdout.write('  Branch Manager: bm.islamabad@bwbs.com / password123')
        self.stdout.write('  Counselor: counselor.isb@bwbs.com / password123')
        self.stdout.write('  Finance: finance@bwbs.com / password123')
        self.stdout.write('  Auditor: auditor@bwbs.com / password123')
        self.stdout.write('='*50 + '\n')
