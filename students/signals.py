"""
Auto-suggestion signal for Lead → University mapping.
Triggers when a Lead is created to suggest matching universities.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal

from .models import Lead


@receiver(post_save, sender=Lead)
def auto_suggest_universities(sender, instance, created, **kwargs):
    """
    Automatically suggest universities for newly created leads
    based on their profile (target country, budget, preferred level).
    """
    if not created:
        return
    
    # Avoid circular import
    from universities.models import University
    from universities.services import UniversityMatchingService
    
    # Only process if lead has enough profile data
    if not instance.target_country:
        return
    
    try:
        # Build matching profile from lead data
        profile = {
            'target_country': instance.target_country,
            'cgpa': 60,  # Default assumption
            'ielts': Decimal('6.0'),  # Default assumption
            'gap_years': 0,
        }
        
        # Run matching algorithm
        result = UniversityMatchingService.find_matches(profile)
        
        if result and 'results' in result:
            # Get top 5 university IDs from matches
            matched_ids = []
            for match in result['results'][:5]:
                if 'id' in match:
                    matched_ids.append(match['id'])
            
            if matched_ids:
                # Get university objects and add to suggested
                universities = University.objects.filter(id__in=matched_ids)
                instance.suggested_universities.set(universities)
                
    except Exception as e:
        # Log error but don't break lead creation
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Failed to auto-suggest universities for lead {instance.id}: {e}")
