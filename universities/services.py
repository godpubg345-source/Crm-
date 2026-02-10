from decimal import Decimal
from .models import University
from .serializers import UniversityMatchSerializer

class UniversityMatchingService:
    """
    Service layer for University matching logic.
    Decouples filtering and scoring algorithms from ViewSets.
    """

    @staticmethod
    def find_matches(data: dict):
        """
        AI-Driven University Matcher logic.
        Input: { "cgpa": 65, "ielts": 6.0, "gap_years": 2, "target_country": "UK" }
        Output: Top 10 matching universities sorted by priority.
        """
        cgpa = data.get('cgpa')
        ielts = data.get('ielts')
        gap_years = data.get('gap_years')
        target_country = data.get('target_country')
        target_intake = data.get('target_intake') # e.g. "September"

        # Type conversion handled by caller or assumed valid via serializer/view validation
        # But let's be robust
        try:
            cgpa = Decimal(str(cgpa))
            ielts = Decimal(str(ielts))
            gap_years = int(gap_years) if gap_years else 0
        except (ValueError, TypeError):
             # Logic error usually means bad input that view should have caught.
             # Returning empty list or raising error is fine.
             return []

        # Build base queryset
        universities = University.objects.filter(
            is_active=True
        ).select_related('admission_criteria', 'partnership_agreement').prefetch_related('scholarships', 'courses__intake_dates')
        
        # Country filter
        if target_country and target_country.lower() != 'any':
            universities = universities.filter(country__iexact=target_country)
        
        matched_universities = []
        
        for uni in universities:
            criteria = getattr(uni, 'admission_criteria', None)
            
            if not criteria:
                # No criteria defined - include with low priority
                uni.match_score = 50
                uni.matched_scholarships = []
                matched_universities.append(uni)
                continue
            
            # Academic Check
            min_pct = criteria.min_percentage or Decimal('0')
            if cgpa < min_pct:
                continue
            
            # Language Check
            min_ielts = criteria.min_ielts or Decimal('0')
            if ielts < min_ielts:
                continue
            
            # Gap Check
            gap_limit = criteria.gap_limit or 10
            if gap_years > gap_limit:
                continue
            
            # Intake Matching (Optional Filter)
            if target_intake:
                has_intake = False
                for course in uni.courses.all():
                    if course.intake_dates.filter(month__iexact=target_intake, is_active=True).exists():
                        has_intake = True
                        break
                if not has_intake:
                    continue
            
            # Scholarship Matching Logic
            eligible_scholarships = []
            for scholarship in uni.scholarships.all():
                if not scholarship.is_active:
                    continue
                    
                s_min_cgpa = scholarship.min_cgpa or Decimal('0')
                s_min_ielts = scholarship.min_ielts or Decimal('0')
                
                if cgpa >= s_min_cgpa and ielts >= s_min_ielts:
                    eligible_scholarships.append(scholarship)
            
            uni.matched_scholarships = eligible_scholarships
            
            # Calculate Match Score
            base_score = 100
            
            # Partner Bonus
            partner_bonus = 30 if uni.is_partner else 0
            
            priority_bonus = max(0, 50 - (criteria.priority_rank * 10))
            academic_bonus = min(20, int((cgpa - min_pct) / 2))
            ielts_bonus = min(15, int((ielts - min_ielts) * 10))
            scholarship_bonus = 20 if eligible_scholarships else 0
            
            uni.match_score = base_score + partner_bonus + priority_bonus + academic_bonus + ielts_bonus + scholarship_bonus
            matched_universities.append(uni)
        
        # Ranking Engine
        matched_universities.sort(
            key=lambda x: (
                getattr(x.admission_criteria, 'priority_rank', 10) if hasattr(x, 'admission_criteria') and x.admission_criteria else 10,
                -getattr(x, 'match_score', 0)
            )
        )
        
        # Slicing
        top_matches = matched_universities[:10]
        
        # We return the data dict for the response
        serializer = UniversityMatchSerializer(top_matches, many=True)
        return {
            'total_matches': len(matched_universities),
            'showing': len(top_matches),
            'input': {
                'cgpa': str(cgpa),
                'ielts': str(ielts),
                'gap_years': gap_years,
                'target_country': target_country or 'Any'
            },
            'results': serializer.data
        }


class CommissionIntelligenceService:
    """
    Service layer for Commission Intelligence calculations.
    Calculates projected commissions per university based on enrollments and pipeline.
    """

    @staticmethod
    def get_commission_forecast():
        """
        Calculate commission forecast across all partner universities.
        Returns:
            - Total projected commission
            - Per-university breakdown
            - Pipeline projections by status
        """
        from applications.models import Application
        from django.db.models import Sum, Count, F, Case, When, DecimalField

        # Get partner universities with commission data
        partners = University.objects.filter(
            is_partner=True, is_active=True
        ).select_related('partnership_agreement').prefetch_related('applications')

        university_commissions = []
        total_earned = Decimal('0')
        total_projected = Decimal('0')
        pipeline_stats = {
            'pending': {'count': 0, 'projected': Decimal('0')},
            'offer': {'count': 0, 'projected': Decimal('0')},
            'cas_received': {'count': 0, 'projected': Decimal('0')},
            'enrolled': {'count': 0, 'earned': Decimal('0')},
        }

        for university in partners:
            # Get commission rate from partnership agreement or fallback to university rate
            agreement = getattr(university, 'partnership_agreement', None)
            if agreement and agreement.is_active_contract():
                commission_rate = agreement.commission_percentage or Decimal('0')
                flat_fee = agreement.flat_fee or Decimal('0')
            else:
                commission_rate = university.commission_rate or Decimal('0')
                flat_fee = Decimal('0')

            # Get applications for this university
            applications = Application.objects.filter(
                university=university,
                is_deleted=False
            )

            # Calculate per-status
            uni_earned = Decimal('0')
            uni_projected = Decimal('0')
            uni_pending = 0
            uni_offer = 0
            uni_cas = 0
            uni_enrolled = 0

            for app in applications:
                tuition = app.tuition_fee or Decimal('0')
                commission_amount = (tuition * commission_rate / Decimal('100')) + flat_fee

                if app.status == 'ENROLLED':
                    uni_earned += commission_amount
                    uni_enrolled += 1
                    pipeline_stats['enrolled']['count'] += 1
                    pipeline_stats['enrolled']['earned'] += commission_amount
                elif app.status in ['CAS_RECEIVED', 'CAS_REQUESTED']:
                    uni_projected += commission_amount * Decimal('0.9')  # 90% likely
                    uni_cas += 1
                    pipeline_stats['cas_received']['count'] += 1
                    pipeline_stats['cas_received']['projected'] += commission_amount * Decimal('0.9')
                elif app.status in ['UNCONDITIONAL_OFFER', 'OFFER_ACCEPTED', 'CONDITIONAL_OFFER']:
                    uni_projected += commission_amount * Decimal('0.6')  # 60% likely
                    uni_offer += 1
                    pipeline_stats['offer']['count'] += 1
                    pipeline_stats['offer']['projected'] += commission_amount * Decimal('0.6')
                elif app.status in ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_READY']:
                    uni_projected += commission_amount * Decimal('0.3')  # 30% likely
                    uni_pending += 1
                    pipeline_stats['pending']['count'] += 1
                    pipeline_stats['pending']['projected'] += commission_amount * Decimal('0.3')

            total_earned += uni_earned
            total_projected += uni_projected

            if uni_earned > 0 or uni_projected > 0:
                university_commissions.append({
                    'university_id': str(university.id),
                    'university_name': university.name,
                    'country': university.country,
                    'commission_rate': str(commission_rate),
                    'flat_fee': str(flat_fee),
                    'earned': str(uni_earned),
                    'projected': str(uni_projected),
                    'stats': {
                        'pending': uni_pending,
                        'offer': uni_offer,
                        'cas_received': uni_cas,
                        'enrolled': uni_enrolled,
                    }
                })

        # Sort by earned + projected (top performers first)
        university_commissions.sort(
            key=lambda x: Decimal(x['earned']) + Decimal(x['projected']),
            reverse=True
        )

        return {
            'summary': {
                'total_earned': str(total_earned),
                'total_projected': str(total_projected),
                'total_forecast': str(total_earned + total_projected),
                'partner_count': len(university_commissions),
            },
            'pipeline': {
                'pending': {
                    'count': pipeline_stats['pending']['count'],
                    'projected': str(pipeline_stats['pending']['projected']),
                    'probability': '30%'
                },
                'offer': {
                    'count': pipeline_stats['offer']['count'],
                    'projected': str(pipeline_stats['offer']['projected']),
                    'probability': '60%'
                },
                'cas_received': {
                    'count': pipeline_stats['cas_received']['count'],
                    'projected': str(pipeline_stats['cas_received']['projected']),
                    'probability': '90%'
                },
                'enrolled': {
                    'count': pipeline_stats['enrolled']['count'],
                    'earned': str(pipeline_stats['enrolled']['earned']),
                    'probability': '100%'
                },
            },
            'universities': university_commissions[:20],  # Top 20 performers
        }

    @staticmethod
    def get_university_commission(university_id):
        """
        Get detailed commission data for a specific university.
        """
        from applications.models import Application

        try:
            university = University.objects.select_related('partnership_agreement').get(id=university_id)
        except University.DoesNotExist:
            return None

        agreement = getattr(university, 'partnership_agreement', None)
        if agreement and agreement.is_active_contract():
            commission_rate = agreement.commission_percentage or Decimal('0')
            flat_fee = agreement.flat_fee or Decimal('0')
        else:
            commission_rate = university.commission_rate or Decimal('0')
            flat_fee = Decimal('0')

        applications = Application.objects.filter(
            university=university, is_deleted=False
        ).select_related('student', 'course').order_by('-created_at')

        app_data = []
        total_earned = Decimal('0')
        total_projected = Decimal('0')

        for app in applications:
            tuition = app.tuition_fee or Decimal('0')
            commission_amount = (tuition * commission_rate / Decimal('100')) + flat_fee

            if app.status == 'ENROLLED':
                status_type = 'earned'
                total_earned += commission_amount
            elif app.status in ['CAS_RECEIVED', 'CAS_REQUESTED', 'UNCONDITIONAL_OFFER', 'OFFER_ACCEPTED']:
                status_type = 'projected'
                total_projected += commission_amount
            else:
                status_type = 'pipeline'

            app_data.append({
                'id': str(app.id),
                'student_name': app.student.full_name if app.student else 'Unknown',
                'course_name': app.course.name if app.course else app.course_name or 'General',
                'intake': app.intake,
                'tuition_fee': str(tuition),
                'commission_amount': str(commission_amount),
                'status': app.status,
                'status_type': status_type,
                'applied_at': app.created_at.isoformat(),
            })

        return {
            'university': {
                'id': str(university.id),
                'name': university.name,
                'country': university.country,
                'commission_rate': str(commission_rate),
                'flat_fee': str(flat_fee),
            },
            'summary': {
                'total_earned': str(total_earned),
                'total_projected': str(total_projected),
                'application_count': len(app_data),
            },
            'applications': app_data,
        }
