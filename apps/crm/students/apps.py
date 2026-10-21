from django.apps import AppConfig


class StudentsConfig(AppConfig):
    name = 'apps.crm.students'
    label = 'students'

    def ready(self):
        import apps.crm.students.signals  # noqa: F401
