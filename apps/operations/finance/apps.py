from django.apps import AppConfig


class FinanceConfig(AppConfig):
    name = 'apps.operations.finance'
    label = 'finance'

    def ready(self):
        import apps.operations.finance.signals
