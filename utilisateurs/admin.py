from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User
# Register your models here.
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role', {'fields':('role',)}),
    )
    list_display = ('username', 'email','role', 'is_staff', 'is_superuser', 'date_creation')
    list_filter = ('role', 'is_staff', 'is_superuser')
    list_editable = ('role',)

    search_fields = ('username', 'email')
admin.site.register(User, UserAdmin)