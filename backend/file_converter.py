import os
import tempfile
import uuid
from pathlib import Path
from typing import Tuple, Optional
from pptx import Presentation
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from PIL import Image
import io

class FileConverter:
    """Handle file conversion operations"""
    
    @staticmethod
    def validate_file(file_content: bytes, filename: str, max_size_mb: int = 15) -> Tuple[bool, str]:
        """
        Validate uploaded file
        
        Args:
            file_content: File content in bytes
            filename: Original filename
            max_size_mb: Maximum file size in MB
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check file size (15MB limit)
        file_size_mb = len(file_content) / (1024 * 1024)
        if file_size_mb > max_size_mb:
            return False, f"File size ({file_size_mb:.1f}MB) exceeds {max_size_mb}MB limit"
        
        # Check file extension
        if not filename:
            return False, "No filename provided"
            
        file_extension = filename.lower().split('.')[-1]
        allowed_extensions = ['pdf', 'pptx']
        
        if file_extension not in allowed_extensions:
            return False, f"File type '{file_extension}' not allowed. Only PDF and PPTX files are supported"
            
        return True, ""
    
    @staticmethod
    def convert_pptx_to_pdf(pptx_content: bytes, output_filename: str) -> Tuple[Optional[bytes], str]:
        """
        Convert PPTX to PDF
        
        Args:
            pptx_content: PPTX file content in bytes
            output_filename: Desired output filename
            
        Returns:
            Tuple of (pdf_content_bytes, error_message)
        """
        try:
            # Create temporary files
            with tempfile.NamedTemporaryFile(suffix='.pptx', delete=False) as temp_pptx:
                temp_pptx.write(pptx_content)
                temp_pptx_path = temp_pptx.name
            
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_pdf:
                temp_pdf_path = temp_pdf.name
            
            try:
                # Load PowerPoint presentation
                presentation = Presentation(temp_pptx_path)
                
                # Create PDF
                pdf_buffer = io.BytesIO()
                c = canvas.Canvas(pdf_buffer, pagesize=landscape(A4))
                
                # Process each slide
                for i, slide in enumerate(presentation.slides):
                    # For now, create a simple text-based PDF
                    # In production, you might want to use more sophisticated conversion
                    c.drawString(100, 500, f"Slide {i + 1}")
                    
                    # Extract text from slide
                    slide_text = []
                    for shape in slide.shapes:
                        if hasattr(shape, "text") and shape.text.strip():
                            slide_text.append(shape.text.strip())
                    
                    # Add text content to PDF
                    y_position = 450
                    for text in slide_text:
                        # Handle long text by wrapping
                        words = text.split()
                        current_line = ""
                        for word in words:
                            test_line = current_line + " " + word if current_line else word
                            if len(test_line) > 80:  # Rough character limit per line
                                c.drawString(100, y_position, current_line)
                                y_position -= 20
                                current_line = word
                                if y_position < 100:
                                    c.showPage()
                                    y_position = 500
                            else:
                                current_line = test_line
                        
                        if current_line:
                            c.drawString(100, y_position, current_line)
                            y_position -= 30
                            if y_position < 100:
                                c.showPage()
                                y_position = 500
                    
                    # Start new page for next slide (if not last slide)
                    if i < len(presentation.slides) - 1:
                        c.showPage()
                
                c.save()
                pdf_content = pdf_buffer.getvalue()
                pdf_buffer.close()
                
                return pdf_content, ""
                
            finally:
                # Clean up temporary files
                try:
                    os.unlink(temp_pptx_path)
                    os.unlink(temp_pdf_path)
                except:
                    pass
                    
        except Exception as e:
            return None, f"PPTX to PDF conversion failed: {str(e)}"
    
    @staticmethod
    def process_file_for_storage(file_content: bytes, original_filename: str) -> Tuple[Optional[bytes], str, str]:
        """
        Process file for storage (convert PPTX to PDF if needed)
        
        Args:
            file_content: Original file content
            original_filename: Original filename
            
        Returns:
            Tuple of (processed_content, final_filename, file_type)
        """
        file_extension = original_filename.lower().split('.')[-1]
        
        if file_extension == 'pptx':
            # Convert PPTX to PDF
            pdf_content, error = FileConverter.convert_pptx_to_pdf(file_content, original_filename)
            if error:
                return None, "", f"Conversion error: {error}"
            
            # Change filename extension to PDF
            pdf_filename = original_filename.rsplit('.', 1)[0] + '.pdf'
            return pdf_content, pdf_filename, 'pdf'
        
        elif file_extension == 'pdf':
            # PDF files are stored as-is
            return file_content, original_filename, 'pdf'
        
        else:
            return None, "", f"Unsupported file type: {file_extension}"