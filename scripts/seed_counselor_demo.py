import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

import django
from datetime import date, timedelta
from django.utils import timezone
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'visa_crm_backend.settings')
django.setup()

from apps.identity.accounts.models import User, AttendanceLog, LeaveRequest
from apps.crm.students.models import Student, Lead
from apps.crm.applications.models import Application
from apps.partners.universities.models import University, Course
from apps.operations.tasks.models import Task
from apps.operations.branches.models import Branch

def run():
    print("Seeding rich Counselor Showcase data for employee@bwbs.com...")
    counselor = User.objects.filter(email='employee@bwbs.com').first()
    if not counselor:
        print("Employee user not found!")
        return

    # 1. Update identity
    counselor.first_name = "Sarah"
    counselor.last_name = "Jenkins"
    counselor.phone = "+44 20 7946 0958"
    if not counselor.branch:
        counselor.branch = Branch.objects.first()
    counselor.save()
    branch = counselor.branch
    print(f"Counselor updated: {counselor.first_name} {counselor.last_name} ({branch.name})")

    # 2. Seed Students
    students_data = [
        ("Priya", "Sharma", "priya.sharma@example.com", "+44 7700 900123", "United Kingdom", "PG"),
        ("Alexander", "Chen", "alex.chen@example.com", "+1 416 555 0192", "Canada", "UG"),
        ("Fatima", "Al-Mansoor", "fatima.mansoor@example.com", "+44 7700 900456", "United Kingdom", "PG"),
        ("Tariq", "Mahmood", "tariq.m@example.com", "+61 491 570 156", "Australia", "PG"),
        ("Elena", "Rostova", "elena.r@example.com", "+353 87 123 4567", "Ireland", "UG"),
        ("Kofi", "Mensah", "kofi.mensah@example.com", "+44 7700 900789", "United Kingdom", "PG"),
    ]

    students = []
    for i, (fn, ln, em, ph, ctry, lvl) in enumerate(students_data, 1):
        std = Student.objects.filter(email=em).first()
        if not std:
            std = Student.objects.create(
                student_code=f"LON-{1000 + i}",
                first_name=fn,
                last_name=ln,
                email=em,
                phone=ph,
                counselor=counselor,
                branch=branch,
                nationality=ctry,
                english_test_type="IELTS",
                english_test_score="7.5" if i % 2 == 0 else "6.5",
                financial_status="VERIFIED",
                profile_completeness=85,
                status="ACTIVE" if i < 5 else "ENROLLED"
            )
        else:
            std.counselor = counselor
            std.branch = branch
            std.save()
        students.append(std)
    print(f"Ensured {len(students)} active students assigned to {counselor.first_name}.")

    # 3. Seed Applications
    universities = list(University.objects.all()[:5])
    courses = list(Course.objects.all()[:10])

    app_configs = [
        (students[0], "Imperial College London", "MSc Advanced Computing", "CONDITIONAL_OFFER", Decimal("28500.00"), Decimal("2000.00")),
        (students[1], "University of Toronto", "BEng Computer Engineering", "UNCONDITIONAL_OFFER", Decimal("34000.00"), Decimal("5000.00")),
        (students[2], "King's College London", "LLM International Law", "UNDER_REVIEW", Decimal("26000.00"), Decimal("0.00")),
        (students[3], "Monash University", "Master of Business Administration", "DOCUMENTS_READY", Decimal("38000.00"), Decimal("0.00")),
        (students[4], "Trinity College Dublin", "BSc Biotechnology", "SUBMITTED", Decimal("22000.00"), Decimal("0.00")),
        (students[5], "Middlesex University", "MSc Renewable Energy", "CAS_RECEIVED", Decimal("17500.00"), Decimal("3000.00")),
    ]

    for std, uname, cname, st, tuition, deposit in app_configs:
        u_obj = next((u for u in universities if u.name == uname), universities[0] if universities else None)
        c_obj = next((c for c in courses if cname.lower() in c.name.lower()), courses[0] if courses else None)

        app = Application.objects.filter(student=std).first()
        if not app:
            Application.objects.create(
                student=std,
                branch=branch,
                university=u_obj,
                course=c_obj,
                university_name=uname,
                course_name=cname,
                intake="September 2026",
                status=st,
                assigned_to=counselor,
                priority=1 if "OFFER" in st else 2,
                tuition_fee=tuition,
                deposit_paid=deposit,
                application_ref=f"APP-2026-{std.id.hex[:6].upper()}"
            )
        else:
            app.status = st
            app.university_name = uname
            app.course_name = cname
            app.assigned_to = counselor
            app.save()
    print("Seeded 6 active university applications.")

    # 4. Seed Tasks
    tasks_data = [
        ("Review CAS Letter & Financials for Kofi Mensah", "Verify 28-day bank statement funds before UK visa filing.", "URGENT", date.today()),
        ("Deposit Reminder: Imperial College London (£2,000)", "Priya Sharma conditional offer deposit deadline approaching in 5 days.", "HIGH", date.today()),
        ("Check Statement of Purpose for Alexander Chen", "Review SOP draft for UofT Computer Engineering intake.", "MEDIUM", date.today() + timedelta(days=2)),
        ("Document Audit: Monash MBA Transcripts", "Verify degree certificate attestation for Tariq Mahmood.", "HIGH", date.today()),
        ("Schedule Pre-Departure Briefing with Elena Rostova", "Arrange briefing on student accommodation in Dublin.", "LOW", date.today() + timedelta(days=4)),
    ]

    for title, desc, prio, due in tasks_data:
        if not Task.objects.filter(title=title, assigned_to=counselor).exists():
            Task.objects.create(
                branch=branch,
                title=title,
                description=desc,
                priority=prio,
                status="PENDING",
                due_date=due,
                assigned_to=counselor,
                created_by=counselor,
                category="DOCUMENTATION"
            )
    print("Seeded 5 counselor priority tasks.")

    # 5. Seed Attendance Logs
    today = date.today()
    # Today: Clocked In
    today_log = AttendanceLog.objects.filter(user=counselor, date=today).first()
    if not today_log:
        AttendanceLog.objects.create(
            user=counselor,
            branch=branch,
            date=today,
            clock_in=timezone.now().replace(hour=9, minute=2, second=0),
            clock_out=None,
            total_hours=Decimal("4.5"),
            notes="Morning intake interviews & CAS verification"
        )
    # Past 4 days
    for day_offset in range(1, 5):
        past_date = today - timedelta(days=day_offset)
        if not AttendanceLog.objects.filter(user=counselor, date=past_date).exists():
            AttendanceLog.objects.create(
                user=counselor,
                branch=branch,
                date=past_date,
                clock_in=timezone.now().replace(hour=8, minute=55, second=0) - timedelta(days=day_offset),
                clock_out=timezone.now().replace(hour=17, minute=30, second=0) - timedelta(days=day_offset),
                total_hours=Decimal("8.5"),
                notes="Standard shift completed"
            )
    print("Seeded active shift and past attendance logs.")

    # 6. Seed Leave Request
    if not LeaveRequest.objects.filter(user=counselor).exists():
        LeaveRequest.objects.create(
            user=counselor,
            branch=branch,
            leave_type="CASUAL",
            start_date=today + timedelta(days=14),
            end_date=today + timedelta(days=15),
            status="APPROVED",
            reason="UK Higher Education Annual Conference London"
        )
    print("Seeded approved leave record.")

    # 7. Seed Documents for Student Showcase
    from apps.crm.students.models import Document
    docs_to_seed = [
        (students[0], "PASSPORT", "International Passport", "priya_passport_scan.pdf", True, "VERIFIED"),
        (students[0], "ENGLISH_TEST", "IELTS Academic Certificate (7.5)", "ielts_test_report_priya.pdf", True, "VERIFIED"),
        (students[0], "TRANSCRIPT", "BSc Computer Science Official Transcript", "bsc_cs_official_transcript.pdf", True, "VERIFIED"),
        (students[0], "SOP", "Statement of Purpose - Imperial College", "sop_priya_sharma_imperial.pdf", False, "PENDING"),
        (students[1], "PASSPORT", "Canadian Passport", "alex_chen_passport.pdf", True, "VERIFIED"),
        (students[1], "TRANSCRIPT", "IB Diploma Transcript", "ib_diploma_grades.pdf", True, "VERIFIED"),
    ]

    for std, cat, dtype, fname, is_v, vstatus in docs_to_seed:
        if not Document.objects.filter(student=std, category=cat).exists():
            Document.objects.create(
                student=std,
                branch=branch,
                category=cat,
                document_type=dtype,
                file_name=fname,
                file_size=1024 * 342,
                is_verified=is_v,
                verification_status=vstatus,
                verified_by=counselor if is_v else None,
                verified_at=timezone.now() if is_v else None,
                uploaded_by=counselor
            )
    print(f"Seeded {len(docs_to_seed)} verified student showcase documents.")
    print("All Counselor showcase data seeded successfully!")

if __name__ == '__main__':
    run()
