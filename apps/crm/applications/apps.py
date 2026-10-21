from django.apps import AppConfig


class ApplicationsConfig(AppConfig):
    name = 'apps.crm.applications'
    label = 'applications'
    
    def ready(self):
        import apps.crm.applications.signals
