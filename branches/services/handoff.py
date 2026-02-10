import datetime
from zoneinfo import ZoneInfo
from django.db import models
from branches.models import Branch, TransferRequest

class HandoffService:
    """
    Logic for "Follow the Sun" smart lead/task routing.
    Ensures work is handled by an active branch when the current one closes.
    """

    @staticmethod
    def get_next_available_branch(current_branch):
        """
        Finds the next branch in the network that is currently open.
        """
        all_branches = Branch.objects.filter(is_active=True).exclude(id=current_branch.id)
        
        # Sort branches by timezone to follow the sun (West to East or vice-versa)
        # For simplicity, we just check which ones are open right now
        open_branches = [b for b in all_branches if b.is_currently_open]
        
        if not open_branches:
            # If no regional branch is open, default to HQ if it's active
            hq = Branch.objects.filter(is_hq=True, is_active=True).first()
            return hq
            
        return open_branches[0]

    @staticmethod
    def suggest_handoff(lead):
        """
        Checks if a lead's current branch is closed and suggests a transfer.
        """
        if not lead.branch or lead.branch.is_currently_open:
            return None
            
        next_branch = HandoffService.get_next_available_branch(lead.branch)
        if not next_branch:
            return None
            
        return {
            'lead_id': lead.id,
            'current_branch': lead.branch.name,
            'suggested_branch': next_branch.name,
            'suggested_branch_id': next_branch.id,
            'reason': f"Branch {lead.branch.code} is closed. {next_branch.code} is currently active."
        }

    @staticmethod
    def execute_auto_handoff(lead, requested_by):
        """
        Automatically transfers a lead if the branch has auto_handoff enabled.
        """
        if not lead.branch or lead.branch.is_currently_open or not lead.branch.auto_handoff_enabled:
            return False
            
        next_branch = HandoffService.get_next_available_branch(lead.branch)
        if not next_branch:
            return False
            
        # Create a transfer record
        TransferRequest.objects.create(
            lead=lead,
            from_branch=lead.branch,
            to_branch=next_branch,
            reason="Follow the Sun Automated Handoff",
            status=TransferRequest.Status.APPROVED, # Pre-approved for auto-handoff
            requested_by=requested_by,
            approval_notes="Automated handoff triggered by branch closure."
        )
        
        # Update lead branch
        lead.branch = next_branch
        lead.save()
        return True
