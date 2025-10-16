# api/serializers.py
from rest_framework import serializers
from .models import AuditLog, UserRole, Report, ExportedData

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = ['id', 'action', 'model_name', 'object_id', 'user', 'timestamp', 'description']

class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = ['id', 'user', 'role', 'permissions']

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'report_type', 'generated_by', 'generated_at', 'report_data', 'file_format']

class ExportedDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExportedData
        fields = ['id', 'data_type', 'exported_by', 'export_date', 'file_url', 'file_format']
