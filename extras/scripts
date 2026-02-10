import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'visa_crm_backend.settings')
django.setup()

from students.models import WhatsAppTemplate
from accounts.models import Branch

def seed_templates():
    default_branch = Branch.objects.first()
    if not default_branch:
        print("Error: No branch found. Please run base seed first.")
        return

    templates = [
        {
            "title": "Welcome Greeting",
            "category": "GREETING",
            "content": "Hi {first_name}! This is BWBS Education. Thanks for your interest in studying in {target_country}. How can we help you today?"
        },
        {
            "title": "UK Brochure Follow-up",
            "category": "BROCHURE",
            "content": "Hi {first_name}, I'm following up on your inquiry for the UK. I've attached our latest university brochure. Let's discuss your options for the upcoming intake!"
        },
        {
            "title": "Document Requirement List",
            "category": "DOCUMENT_REQ",
            "content": "Hello {first_name}, to process your application for {target_country}, we need your 10th, 12th, and Passport copy. Please send them here or email us."
        },
        {
            "title": "Hot Lead Re-engagement",
            "category": "FOLLOW_UP",
            "content": "Hey {first_name}, haven't heard from you in a bit! You were looking at some great options in {target_country}. Still interested in securing your spot?"
        },
        {
            "title": "Ghost Alert Re-engagement",
            "category": "FOLLOW_UP",
            "content": "Hi {first_name}, just wanted to check in. We still have your profile active for {target_country}. Would you like to schedule a quick call to finalize your choice?"
        }
    ]

    for t_data in templates:
        template, created = WhatsAppTemplate.objects.get_or_create(
            title=t_data["title"],
            defaults={
                "category": t_data["category"],
                "content": t_data["content"],
                "branch": default_branch
            }
        )
        if created:
            print(f"Created template: {template.title}")
        else:
            print(f"Template already exists: {template.title}")

if __name__ == "__main__":
    seed_templates()
