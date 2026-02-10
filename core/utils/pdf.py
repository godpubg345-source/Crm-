from io import BytesIO
from django.http import HttpResponse
from django.template.loader import get_template
from xhtml2pdf import pisa

def render_to_pdf(template_src, context_dict={}):
    """
    Render a Django template to PDF using xhtml2pdf.
    """
    template = get_template(template_src)
    html  = template.render(context_dict)
    
    result = BytesIO()
    # Use UTF-8 for better character support
    pdf = pisa.pisaDocument(BytesIO(html.encode("UTF-8")), result)
    
    if not pdf.err:
        return HttpResponse(result.getvalue(), content_type='application/pdf')
    return None
