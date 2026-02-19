from django.shortcuts import render
from .serializers import TicketSerializer
from .models import Tickets
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, BasePermission, SAFE_METHODS,IsAdminUser
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from .utils import send_ticket_email
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
        ticket = serializer.save(demandeur = self.request.user)
        admins = [u.email for u in get_user_model().objects.filter(role="ADMIN")]
        subject = f"Nouveau ticket créé : {ticket.titre}"
        body = f"Le ticket '{ticket.titre}' a été créé par {ticket.demandeur.username}.\n\nDescription:\n{ticket.description}"
        send_ticket_email(subject, body, admins)

    def perform_update(self, serializer):
        # user = self.request.user
        # ticket = self.get_object()

        # if ticket.technicien == user and not user.is_staff:
        #     serializer.save(
        #         demandeur=ticket.demandeur,
        #         technicien=ticket.technicien
        #     )
        # else:
        #     serializer.save()
        ticket = self.get_object()
        old_technicien = ticket.technicien
        old_statut = ticket.statut

        serializer.save()
        ticket.refresh_from_db()

        # Si l'admin assigne un technicien
        if ticket.technicien and ticket.technicien != old_technicien:
            subject = f"Ticket assigné : {ticket.titre}"
            body = f"Vous avez été assigné au ticket '{ticket.titre}' par l'admin."
            send_ticket_email(subject, body, [ticket.technicien.email])

        # Si le technicien ferme le ticket
        if ticket.statut == "RESOLUE" and old_statut != "RESOLUE":
            subject = f"Votre ticket est résolu : {ticket.titre}"
            body = f"Votre ticket '{ticket.titre}' a été résolu par {ticket.technicien.username}."
            send_ticket_email(subject, body, [ticket.demandeur.email])

class TechnicianList(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        User = get_user_model()
        techs = User.objects.exclude(id=request.user.id).values(
            'id', 'username', 'email', 'role'
        ).order_by('username').filter(role="TECH")
        return Response(list(techs))