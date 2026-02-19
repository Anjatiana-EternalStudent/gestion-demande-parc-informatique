from django.db import models
from django.conf import settings

# Create your models here.
class Tickets(models.Model):
    STATUS_CHOICES = (
        ('EN_ATTENTE', 'En attente'),
        ('EN_COURS', 'En cours'),
        ('RESOLUE', 'Resolue'),
    )

    PRIORITY_CHOICES = (
        ('FAIBLE', 'Faible'),
        ('MOYENNE','Moyenne'),
        ('ELEVE', 'Eleve'),
    )

    titre = models.CharField(max_length=255)
    description = models.TextField()
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default="EN_ATTENTE")
    priorite = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="MOYENNE")
    demandeur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tickets')
    technicien = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_assignes')
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.titre ({self.statut})}"