from django.db import models
from django.contrib.auth.models import User

class Announcement(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    TYPE_CHOICES = [
        ('general', 'General'),
        ('exam', 'Examination'),
        ('fee', 'Fee'),
        ('event', 'Event'),
        ('health', 'Health & Safety'),
        ('academic', 'Academic'),
    ]
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='general')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    target_audience = models.CharField(max_length=50, default='all')  # 'all', 'students', 'teachers', etc.
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return self.title

class AnnouncementRead(models.Model):
    announcement = models.ForeignKey(Announcement, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['announcement', 'user']
        
    def __str__(self):
        return f"{self.user.username} read {self.announcement.title}"