from rest_framework import serializers
from .models import Tickets

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tickets
        fields = ['id', 'titre', 'description', 'statut', 'priorite', 'demandeur', 'technicien', 'date_creation', 'date_modification']
