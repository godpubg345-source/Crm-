import pandas as pd
from django.core.management.base import BaseCommand
from universities.models import University, AdmissionCriteria
from decimal import Decimal

class Command(BaseCommand):
    help = 'Import universities from multi-sheet Excel (partners.xlsx)'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the Excel file')

    def handle(self, *args, **options):
        file_path = options['file_path']
        self.stdout.write(f"Reading Excel: {file_path}")

        try:
            # First read without header to detect column names
            xls_raw = pd.read_excel(file_path, sheet_name=None, header=None)
            
            total_imported = 0
            
            # Iterate through each sheet (Country)
            for sheet_name, df_raw in xls_raw.items():
                country_raw = sheet_name.strip()
                self.stdout.write(f"Processing Sheet: {country_raw}...")
                
                # Detect if row 0 is a title row (only 1 non-empty cell) or header
                # We'll check if 'University' is in row 0 or row 1
                row0 = df_raw.iloc[0].values.tolist()
                row1 = df_raw.iloc[1].values.tolist() if len(df_raw) > 1 else []
                
                if 'University' in [str(x) for x in row0]:
                    df = pd.read_excel(file_path, sheet_name=sheet_name, header=0)
                elif 'University' in [str(x) for x in row1]:
                    df = pd.read_excel(file_path, sheet_name=sheet_name, header=1)
                else:
                    # Fallback: try header=0
                    df = pd.read_excel(file_path, sheet_name=sheet_name, header=0)
                
                # Map sheet name to Country Code if possible
                uni_country = 'UK' # Default fallback
                c_upper = country_raw.upper()
                
                if c_upper in ['UK', 'UNITED KINGDOM', 'ENGLAND']: uni_country = 'UK'
                elif c_upper in ['USA', 'UNITED STATES', 'US']: uni_country = 'USA'
                elif c_upper in ['CANADA', 'CA']: uni_country = 'CANADA'
                elif c_upper in ['AUSTRALIA', 'OZ', 'AU']: uni_country = 'AUSTRALIA'
                elif c_upper in ['IRELAND', 'IE']: uni_country = 'IRELAND'
                elif c_upper in ['GERMANY', 'DE']: uni_country = 'GERMANY'
                else: 
                     # If generic or unknown, try to use as is if it fits choices, else default
                     uni_country = 'UK' # Fallback for safety, or we could leave it to model validation
                
                # Fill NaN with empty strings for easier text handling
                df = df.fillna('')
                
                sheet_count = 0
                
                for index, row in df.iterrows():
                    try:
                        # Column A: University
                        name = str(row.get('University', '')).strip()
                        if not name:
                            continue
                        
                        # Column B: Territories
                        territories = str(row.get('Territories', 'Global')).strip()
                        
                        # Column C: Priority
                        priority_raw = str(row.get('Priority', 'Low')).strip()
                        
                        # Priority Logic
                        p_lower = priority_raw.lower()
                        if 'super high' in p_lower:
                            priority_rank = 1
                        elif 'high' in p_lower:
                            priority_rank = 2
                        elif 'medium' in p_lower:
                            priority_rank = 3
                        else:
                            priority_rank = 5 # Low (default)

                        # Create/Update University
                        uni, created = University.objects.get_or_create(
                            name=name,
                            defaults={'country': uni_country}
                        )
                        
                        # Update country if it was created or if we want to enforce sheet country
                        # Assuming sheet country is authoritative for these entries
                        if not created:
                             uni.country = uni_country
                             
                        uni.is_partner = True
                        uni.save()
                        
                        # Create/Update Criteria
                        criteria, _ = AdmissionCriteria.objects.get_or_create(university=uni)
                        criteria.accepted_territories = territories
                        criteria.priority_rank = priority_rank
                        
                        # Defaults for missing columns
                        criteria.min_percentage = Decimal('60.0')
                        criteria.min_ielts = Decimal('6.0')
                        criteria.gap_limit = 5
                        
                        criteria.save()
                        
                        sheet_count += 1
                        total_imported += 1
                        # self.stdout.write(self.style.SUCCESS(f"Imported {name}")) # Too verbose for many sheets?
                        
                    except Exception as row_e:
                        self.stdout.write(self.style.ERROR(f"Error row {index} in {country_raw}: {row_e}"))
                
                self.stdout.write(self.style.SUCCESS(f"Sheet [{country_raw}]: Imported {sheet_count} universities."))

            self.stdout.write(self.style.SUCCESS(f"Global Success! Total Imported: {total_imported} universities."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Critical Error: {e}"))
