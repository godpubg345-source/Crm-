from .models import CommunicationLog

class WhatsAppService:
    """
    Service to handle WhatsApp communications.
    Integrated with student records for automated lifecycle messaging.
    """
    
    @staticmethod
    def send_message(student, message, direction='OUTBOUND', logged_by=None):
        """
        Sends a manual/automated WhatsApp message and logs it.
        Integration Point: This is where you would connect to Twilio or Meta WhatsApp Business API.
        """
        # Logic to call external API would go here
        
        return CommunicationLog.objects.create(
            student=student,
            communication_type=CommunicationLog.Type.WHATSAPP,
            direction=direction,
            summary=message,
            logged_by=logged_by,
            branch=student.branch
        )

    @staticmethod
    def send_application_update(application, message_template):
        """
        Sends an automated update when an application status changes.
        """
        student = application.student
        return WhatsAppService.send_message(
            student=student,
            message=message_template.format(
                student_name=student.first_name,
                university=application.university.name,
                status=application.get_status_display()
            )
        )


class EmailService:
    """
    Service to handle partner email communications.
    Uses EmailTemplate model for templated messaging.
    """
    
    @staticmethod
    def send_partner_email(template_id, university, context=None, recipient_email=None):
        """
        Send an email to a university partner using a template.
        
        Args:
            template_id: ID of the EmailTemplate to use
            university: University object
            context: Additional context for placeholder replacement
            recipient_email: Override recipient email (default: university primary contact)
        
        Returns:
            dict with status and message details
        """
        from django.core.mail import send_mail
        from django.conf import settings
        from .models import EmailTemplate
        
        try:
            template = EmailTemplate.objects.get(id=template_id, is_active=True)
        except EmailTemplate.DoesNotExist:
            return {'success': False, 'error': 'Template not found'}
        
        # Build context with university data
        full_context = {
            'university_name': university.name,
            'country': university.country,
            'contact_name': '',
        }
        
        # Get primary contact if available
        primary_contact = university.key_contacts.filter(is_primary=True).first()
        if primary_contact:
            full_context['contact_name'] = primary_contact.name
            if not recipient_email:
                recipient_email = primary_contact.email
        
        # Merge with provided context
        if context:
            full_context.update(context)
        
        # Render template
        rendered = template.render(full_context)
        
        # Determine recipient
        if not recipient_email:
            recipient_email = university.email
        
        if not recipient_email:
            return {'success': False, 'error': 'No recipient email found'}
        
        # Send email (using Django's send_mail)
        try:
            send_mail(
                subject=rendered['subject'],
                message=rendered['body'],
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False,
            )
            
            return {
                'success': True,
                'recipient': recipient_email,
                'subject': rendered['subject'],
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
