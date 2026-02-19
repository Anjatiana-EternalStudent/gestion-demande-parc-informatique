from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = (
        ("USER", "Employee"),
        ("TECH", "Technicien"),
        ("ADMIN", "Admnistateur"),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username