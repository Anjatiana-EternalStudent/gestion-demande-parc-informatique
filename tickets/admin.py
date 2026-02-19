from django.contrib import admin
from .models import Tickets

# Register your models here.
class TicketAdmin(admin.ModelAdmin):
    list_display = ('titre', 'statut','priorite', 'demandeur', 'technicien', 'date_creation')
    list_filter = ('statut', 'priorite')
    search_fields = ('titre', 'description', 'demandeur__username', 'technicien__username')

admin.site.register(Tickets, TicketAdmin)