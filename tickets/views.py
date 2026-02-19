from django.shortcuts import render
from .serializers import TicketSerializer
from .models import Tickets
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
# Create your views here.

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "USER":
            return Tickets.objects.filter(demandeur=user)
        elif user.role == "TECH":
            return Tickets.objects.filter(techinicien = user)
        else:
            return Tickets.objects.all()
    def perform_create(self, serializer):
        serializer.save(demandeur = self.request.user)