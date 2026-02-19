# tickets/utils.py
from django.core.mail import send_mail
from django.conf import settings

def send_ticket_email(subject, body, recipients):
    """
    Envoi un email à une liste de destinataires
    """
    if not recipients:
        return
    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipients,
            fail_silently=False,
        )
        print(f"Email sent to: {recipients}")
    except Exception as e:
        print(f"Failed to send email: {e}")