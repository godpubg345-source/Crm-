from django.apps import AppConfig


class AccountsConfig(AppConfig):
    name = 'apps.identity.accounts'
    label = 'accounts'

    def ready(self):
        import apps.identity.accounts.signals
