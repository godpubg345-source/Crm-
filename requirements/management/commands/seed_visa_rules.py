from django.core.management.base import BaseCommand
from requirements.models import VisaType, RequiredDocument, RequirementRule

class Command(BaseCommand):
    help = 'Seed standard Visa Rules (UK, USA, Canada)'

    def handle(self, *args, **options):
        self.stdout.write("Seeding Visa Rules...")

        # 1. Visa Types
        student_visa, _ = VisaType.objects.get_or_create(name='Student', defaults={'description': 'Study Visa'})
        visit_visa, _ = VisaType.objects.get_or_create(name='Visit', defaults={'description': 'Tourist/Business Visa'})

        # 2. Required Documents
        docs = {
            # Standard Visa
            'CAS': 'Confirmation of Acceptance for Studies',
            'Bank Statement': 'Proof of Funds',
            'TB Test Report': 'Tuberculosis Test Result',
            'I-20 Form': 'Certificate of Eligibility for Nonimmigrant Student Status',
            'SEVIS Fee Receipt': 'I-901 Payment Confirmation',
            'DS-160 Confirmation': 'Online Nonimmigrant Visa Application',
            'LOA': 'Letter of Acceptance',
            'GIC Certificate': 'Guaranteed Investment Certificate',
            
            # Global Master's
            'Passport': 'Valid Passport Scan',
            'CV / Resume': 'Curriculum Vitae',
            'Bachelor Degree': 'Bachelor Degree Certificate',
            'Bachelor Transcript': 'Bachelor Official Transcript',
            'Reference Letters': 'Two Academic/Professional References',
            'Statement of Purpose (SOP)': 'Personal Statement',
            
            # Pakistan Specific
            'SSC Certificate': 'Matriculation Certificate',
            'HSSC Certificate': 'Intermediate/Higher Secondary Certificate',
            'Medium of Instruction (MOI)': 'English Proficiency Proof (MOI)',
            'Experience Certificate': 'Proof of Work Experience (if gap exists)',
        }
        
        doc_objs = {}
        for name, desc in docs.items():
            doc_objs[name], _ = RequiredDocument.objects.get_or_create(name=name, defaults={'description': desc})


        # 3. Rules
        
        # --- UK RULES ---
        # Rule 1: Global Master's Requirements (Applies to Origin=Null/All)
        uk_global, _ = RequirementRule.objects.get_or_create(
            visa_type=student_visa,
            destination_country='UK',
            origin_country=None, # Global
            defaults={'is_mandatory': True}
        )
        uk_global.required_documents.add(
            doc_objs['Passport'],
            doc_objs['CV / Resume'],
            doc_objs['Bachelor Degree'],
            doc_objs['Bachelor Transcript'],
            doc_objs['Reference Letters'],
            doc_objs['Statement of Purpose (SOP)'],
            doc_objs['CAS'],            # Keeping original visa docs too
            doc_objs['Bank Statement']  # Keeping original visa docs too
        )
        
        # Rule 2: Pakistan-Specific Add-ons (Applies to Origin="Pakistan")
        uk_pak, _ = RequirementRule.objects.get_or_create(
            visa_type=student_visa,
            destination_country='UK',
            origin_country='PAKISTAN',
            defaults={'is_mandatory': True}
        )
        uk_pak.required_documents.add(
            doc_objs['SSC Certificate'],
            doc_objs['HSSC Certificate'],
            doc_objs['Medium of Instruction (MOI)'],
            doc_objs['Experience Certificate'],
            doc_objs['TB Test Report'] # Keeping original
        )


        # --- USA RULES ---
        # Global: I-20, SEVIS, DS-160
        usa_global, _ = RequirementRule.objects.get_or_create(
            visa_type=student_visa,
            destination_country='USA',
            origin_country=None,
            defaults={'is_mandatory': True}
        )
        usa_global.required_documents.add(
            doc_objs['I-20 Form'], 
            doc_objs['SEVIS Fee Receipt'], 
            doc_objs['DS-160 Confirmation']
        )


        # --- CANADA RULES ---
        # Global: LOA, GIC
        can_global, _ = RequirementRule.objects.get_or_create(
            visa_type=student_visa,
            destination_country='CANADA',
            origin_country=None,
            defaults={'is_mandatory': True}
        )
        can_global.required_documents.add(
            doc_objs['LOA'], 
            doc_objs['GIC Certificate']
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded Visa Rules!'))
