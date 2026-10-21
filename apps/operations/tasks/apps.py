from django.apps import AppConfig

class TasksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.operations.tasks'
    label = 'tasks'

    def ready(self):
        import apps.operations.tasks.signals
