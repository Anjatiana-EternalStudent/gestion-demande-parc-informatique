from django.shortcuts import render
from .serializers import TicketSerializer
from .models import Tickets
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, BasePermission, SAFE_METHODS,IsAdminUser
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework.response import Response
# Create your views here.
class TicketPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return(
                request.user.is_staff or
                obj.demandeur == request.user or
                obj.technicien == request.user
            )
        if request.user.is_staff:
            return True
        if obj.demandeur == request.user:
            return True
        if obj.technicien == request.user:
            return True
        if obj.demandeur == request.user and obj.technicien is None:
            return True
        return False

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated, TicketPermission]

    def get_queryset(self):
        user = self.request.user
        if user.role == "USER":
            return Tickets.objects.filter(demandeur=user)
        elif user.role == "TECH":
            return Tickets.objects.filter(technicien = user)
        else:
            return Tickets.objects.all()
    def perform_create(self, serializer):
        serializer.save(demandeur = self.request.user)

    def perform_update(self, serializer):
        user = self.request.user
        ticket = self.get_object()

        if ticket.technicien == user and not user.is_staff:
            serializer.save(
                demandeur=ticket.demandeur,
                technicien=ticket.technicien
            )
        else:
            serializer.save()

class TechnicianList(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        User = get_user_model()
        techs = User.objects.exclude(id=request.user.id).values(
            'id', 'username', 'email', 'role'
        ).order_by('username').filter(role="TECH")
        return Response(list(techs))