from django.utils.deprecation import MiddlewareMixin
from core.utils.branch_context import resolve_branch_from_request

class BranchMiddleware(MiddlewareMixin):
    """
    Middleware to inject the current 'Branch' context into the request.
    
    Logic:
    1. If user is NOT authenticated -> No branch context.
    2. If user is SuperAdmin/HQ -> Check 'X-Branch-ID' header.
       - If Header exists -> Context = That Branch (Switching Mode).
       - If No Header -> Context = None (Global View) or HQ?
    3. If user is Normal Staff -> Context = User.branch (Forced).
    """
    
    def process_request(self, request):
        request.branch = resolve_branch_from_request(request)
