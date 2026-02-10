"""
Core App Configuration.
Registers signals for automated workflows.
"""
from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'
    verbose_name = 'Core CRM Utilities'

    def ready(self):
        """Import signals when app is ready."""
        try:
            import core.signals  # noqa: F401
        except ImportError:
            pass
