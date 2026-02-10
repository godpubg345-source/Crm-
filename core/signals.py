"""
Django Signals for Automated Workflows.
Handles automatic actions triggered by model events.
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


def _resolve_task_assignee(student=None, branch=None, fallback_user=None):
    """
    Pick a reasonable assignee for auto-generated tasks.
    Priority: fallback_user -> student.counselor -> branch manager -> doc processor.
    """
    if fallback_user:
        return fallback_user
    if student and getattr(student, "counselor", None):
        return student.counselor
    if branch:
        try:
            from accounts.models import User
            manager = User.objects.filter(role=User.Role.BRANCH_MANAGER, branch=branch).first()
            if manager:
                return manager
            doc_processor = User.objects.filter(role=User.Role.DOC_PROCESSOR, branch=branch).first()
            if doc_processor:
                return doc_processor
        except Exception:
            return None
    return None


# ============================================================
# LEAD SIGNALS
# ============================================================
@receiver(post_save, sender='students.Lead')
def lead_created_notification(sender, instance, created, **kwargs):
    """
    When a new lead is created:
    1. Log the event
    2. Create initial follow-up task
    """
    if created:
        logger.info(f"New lead created: {instance.full_name} ({instance.email}) - Branch: {instance.branch}")
        
        # Auto-create follow-up task
        try:
            from tasks.models import Task
            if instance.assigned_to:
                Task.objects.create(
                    title=f"Initial follow-up: {instance.full_name}",
                    description=f"Follow up with new lead {instance.full_name} ({instance.email})",
                    branch=instance.branch,
                    assigned_to=instance.assigned_to,
                    created_by=instance.assigned_to,
                    due_date=timezone.now() + timezone.timedelta(days=1),
                )
                logger.info(f"Auto-created follow-up task for lead {instance.id}")
        except Exception as e:
            logger.warning(f"Failed to create auto task for lead: {e}")


@receiver(pre_save, sender='students.Lead')
def lead_status_change_audit(sender, instance, **kwargs):
    """
    Track status changes for leads.
    """
    if instance.pk:
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            if old_instance.status != instance.status:
                logger.info(
                    f"Lead {instance.id} status changed: {old_instance.status} -> {instance.status}"
                )
        except sender.DoesNotExist:
            pass


@receiver(pre_save, sender='students.Lead')
def calculate_lead_score(sender, instance, **kwargs):
    """
    Automated Lead Scoring Algorithm.
    Scores 0-100 based on profile completeness and activity.
    Sets Priority: HOT (>=70), WARM (30-69), COLD (<30).
    """
    score = 0
    
    # 1. Profile Completeness (+30 max)
    fields = [instance.first_name, instance.last_name, instance.email, instance.phone]
    filled_fields = sum(1 for f in fields if f)
    score += (filled_fields / len(fields)) * 30
    
    # 2. Intent Details (+30 max)
    if instance.target_country: score += 10
    if instance.intended_intake: score += 10
    if instance.budget_range: score += 10
    
    # 3. Activity Level (+40 max)
    # Note: Interaction count is better handled via a signal on Interaction creation,
    # but for pre_save we can check if last_interaction_at exists
    if instance.last_interaction_at:
        # Give points if interaction was recent (last 7 days)
        days_since = (timezone.now() - instance.last_interaction_at).days
        if days_since < 7:
            score += 40
        elif days_since < 30:
            score += 20
    
    instance.score = int(score)
    
    # Set Priority
    from students.models import Lead
    if score >= 70:
        instance.priority = Lead.Priority.HOT
    elif score >= 30:
        instance.priority = Lead.Priority.WARM
    else:
        instance.priority = Lead.Priority.COLD

    # 4. AI Win Probability Logic
    prob = 50.0  # Base probability
    if instance.target_country == 'United Kingdom': prob += 10
    elif instance.target_country == 'Australia': prob += 15
    elif instance.target_country == 'Canada': prob += 5
    
    if instance.priority == Lead.Priority.HOT: prob += 20
    elif instance.priority == Lead.Priority.WARM: prob += 5
    else: prob -= 20
    
    if instance.budget_range: prob += 10
    prob += (filled_fields / len(fields)) * 15  # Up to +15 for completeness
    
    instance.win_probability = min(max(prob, 1.0), 99.0)

    # 5. SLA & Ghost Detection
    # If NEW and older than 24h with no interaction
    is_violated = False
    if instance.status == Lead.Status.NEW and not instance.last_interaction_at:
        age_hours = (timezone.now() - instance.created_at).total_seconds() / 3600 if instance.created_at else 0
        if age_hours > 24:
            is_violated = True
    elif instance.last_interaction_at:
        # Ghost Detection: If HOT/WARM but no interaction for 3 days
        days_since = (timezone.now() - instance.last_interaction_at).days
        if days_since > 3 and instance.status != Lead.Status.CONVERTED:
            is_violated = True
    
    instance.is_sla_violated = is_violated


# ============================================================
# STUDENT SIGNALS
# ============================================================
@receiver(pre_save, sender='students.Student')
def generate_student_code(sender, instance, **kwargs):
    """
    Auto-generate student code if not provided.
    Format: BRANCH-YEAR-SEQUENCE (e.g., LHR-2026-00001)
    """
    if not instance.student_code:
        # Avoid circular import
        from students.models import Student
        
        year = timezone.now().year
        # Extract short branch code (e.g. 'UK-LHR' -> 'LHR')
        branch_code = instance.branch.code.split('-')[-1] if instance.branch else 'HQ'
        
        prefix = f"{branch_code}-{year}-"
        
        # Get latest sequence for this prefix
        # Use .all_objects to include soft-deleted for unique sequence
        latest = Student.all_objects.filter(
            student_code__startswith=prefix
        ).order_by('-student_code').first()
        
        if latest:
            try:
                # Extract sequence from "XXX-YYYY-SSSSS"
                last_seq = int(latest.student_code.split('-')[-1])
                seq = last_seq + 1
            except (ValueError, IndexError):
                seq = 1
        else:
            seq = 1
        
        instance.student_code = f"{prefix}{seq:05d}"
        logger.info(f"Auto-generated student code: {instance.student_code}")


# ============================================================
# APPLICATION SIGNALS
# ============================================================
@receiver(post_save, sender='applications.Application')
def application_status_actions(sender, instance, created, **kwargs):
    """
    Automated actions based on Application status changes.
    """
    if created:
        logger.info(f"New application created: {instance.id} - Student: {instance.student}")
    else:
        try:
            from tasks.models import Task
            from applications.models import Application

            assignee = _resolve_task_assignee(
                student=instance.student,
                branch=instance.branch,
            )

            # Logic for status transitions
            if instance.status in (
                Application.Status.CONDITIONAL_OFFER,
                Application.Status.UNCONDITIONAL_OFFER,
            ):
                if not assignee:
                    logger.warning("No assignee found for offer review task.")
                    return
                Task.objects.get_or_create(
                    title=f"Review University Offer: {instance.university.name if instance.university else 'University'}",
                    student=instance.student,
                    branch=instance.branch,
                    defaults={
                        'description': f"Application {instance.id} received an offer. Review and notify student.",
                        'priority': 'HIGH',
                        'assigned_to': assignee,
                        'created_by': assignee,
                        'due_date': timezone.now() + timezone.timedelta(days=2),
                    }
                )
            elif instance.status == Application.Status.CAS_RECEIVED:
                if not assignee:
                    logger.warning("No assignee found for visa preparation task.")
                    return
                # Auto-create Visa Task
                Task.objects.get_or_create(
                    title=f"Prepare Visa Case: {instance.student.full_name}",
                    student=instance.student,
                    branch=instance.branch,
                    defaults={
                        'description': f"CAS received for {instance.university.name if instance.university else 'university'}. Start Visa preparation.",
                        'priority': 'URGENT',
                        'assigned_to': assignee,
                        'created_by': assignee,
                        'due_date': timezone.now() + timezone.timedelta(days=1),
                    }
                )
        except Exception as e:
            logger.warning(f"Failed to create application status task: {e}")


# ============================================================
# DOCUMENT SIGNALS
# ============================================================
@receiver(post_save, sender='students.Document')
def document_verification_task(sender, instance, created, **kwargs):
    """
    Create verification task when document is uploaded.
    """
    if created and instance.verification_status == 'PENDING':
        try:
            from tasks.models import Task
            assignee = _resolve_task_assignee(
                student=getattr(instance, "student", None),
                branch=getattr(instance, "branch", None),
                fallback_user=getattr(instance, "uploaded_by", None),
            )
            if not assignee:
                logger.warning("No assignee found for document verification task.")
                return
            Task.objects.create(
                title=f"Verify document: {instance.file_name}",
                description=f"Verify {instance.document_type} for student {instance.student}",
                priority='HIGH',
                branch=instance.branch,
                assigned_to=assignee,
                created_by=assignee,
                due_date=timezone.now() + timezone.timedelta(days=2),
                student=instance.student,
            )
            logger.info(f"Auto-created verification task for document {instance.id}")
        except Exception as e:
            logger.warning(f"Failed to create verification task: {e}")


# ============================================================
# TRANSACTION SIGNALS
# ============================================================
@receiver(post_save, sender='finance.Transaction')
def transaction_audit_log(sender, instance, created, **kwargs):
    """
    Log all financial transactions for audit.
    """
    action = "created" if created else "updated"
    currency = None
    try:
        currency = getattr(instance.student.branch, "currency", None)
    except Exception:
        currency = None

    logger.info(
        f"Transaction {action}: {instance.id} | "
        f"Type: {instance.transaction_type} | "
        f"Amount: {instance.amount} {currency or 'N/A'} | "
        f"Student: {instance.student}"
    )
