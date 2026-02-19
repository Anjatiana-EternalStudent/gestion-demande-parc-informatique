from rest_framework import serializers
from .models import Tickets

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tickets
        fields = "__all__"
        read_only_fields = ['demandeur', 'date_creation', 'date_modification']