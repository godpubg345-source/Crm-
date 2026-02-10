from rest_framework import serializers

from accounts.serializers import UserListSerializer
from students.serializers import StudentListSerializer
from .models import Appointment, AppointmentReminder


class AppointmentSerializer(serializers.ModelSerializer):
    student_details = StudentListSerializer(source='student', read_only=True)
    counselor_details = UserListSerializer(source='counselor', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    method_display = serializers.CharField(source='get_method_display', read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'created_by']

    def validate(self, attrs):
        student = attrs.get('student') or getattr(self.instance, 'student', None)
        counselor = attrs.get('counselor') or getattr(self.instance, 'counselor', None)
        scheduled_start = attrs.get('scheduled_start') or getattr(self.instance, 'scheduled_start', None)
        scheduled_end = attrs.get('scheduled_end') or getattr(self.instance, 'scheduled_end', None)
        if student and counselor and counselor.branch and student.branch and counselor.branch != student.branch:
            raise serializers.ValidationError({'counselor': 'Counselor must be in the same branch as the student.'})
        if scheduled_start and scheduled_end and scheduled_end <= scheduled_start:
            raise serializers.ValidationError({'scheduled_end': 'scheduled_end must be after scheduled_start.'})
        return attrs


class AppointmentReminderSerializer(serializers.ModelSerializer):
    channel_display = serializers.CharField(source='get_channel_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AppointmentReminder
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'branch', 'sent_at']
