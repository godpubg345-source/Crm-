from core.utils.pii import mask_value


class MaskedPIISerializerMixin:
    """Mask PII fields when context["mask_pii"] is True."""

    mask_fields = []
    mask_show = 2

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if self.context.get("mask_pii"):
            for field in self.mask_fields:
                if field in data and data[field]:
                    data[field] = mask_value(data[field], show=self.mask_show)
        return data
