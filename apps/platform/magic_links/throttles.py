from rest_framework.throttling import SimpleRateThrottle


class MagicLinkPublicThrottle(SimpleRateThrottle):
    scope = 'magic_link'

    def get_cache_key(self, request, view):
        return self.get_ident(request)
