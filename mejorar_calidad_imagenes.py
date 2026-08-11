from docx import Document
from docx.shared import Inches, Mm
import zipfile
import os
import shutil

def improve_image_quality():
    """Mejora la calidad de las imágenes en el documento"""
    
    input_doc = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)\INFORME_FINAL_INTEGRADO_WEB_COMPLETO.docx'
    web_images_doc = r'C:\Users\Admin\Documents\FOTOS DE MODULOS APP WEB.docx'
    output_doc = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)\INFORME_FINAL_INTEGRADO_WEB_ALTA_CALIDAD.docx'
    
    print("1. Copiando documento...")
    shutil.copy2(input_doc, output_doc)
    
    print("2. Extrayendo imágenes web en alta calidad...")
    web_images = {}
    with zipfile.ZipFile(web_images_doc, 'r') as z:
        for f in z.namelist():
            if f.startswith('word/media/image'):
                num = f.replace('word/media/image', '').replace('.png', '')
                web_images[num] = z.read(f)
    
    print(f"   Imágenes extraídas: {len(web_images)}")
    
    print("3. Reemplazando imágenes sin compresión...")
    temp = output_doc + '.tmp'
    
    with zipfile.ZipFile(output_doc, 'r') as z1:
        with zipfile.ZipFile(temp, 'w', zipfile.ZIP_STORED) as z2:  # ZIP_STORED = sin compresión
            replaced = 0
            for info in z1.infolist():
                data = z1.read(info.filename)
                if info.filename.startswith('word/media/image'):
                    num = info.filename.replace('word/media/image', '').replace('.png', '')
                    if num in web_images:
                        z2.writestr(info.filename, web_images[num])
                        replaced += 1
                    else:
                        z2.writestr(info, data)
                else:
                    z2.writestr(info, data)
            print(f"   Imágenes reemplazadas: {replaced}")
    
    os.remove(output_doc)
    shutil.move(temp, output_doc)
    
    print("4. Ajustando tamaño de imágenes en el documento...")
    doc = Document(output_doc)
    
    # Ajustar tamaño de imágenes a 6.5 pulgadas para mejor visibilidad
    for paragraph in doc.paragraphs:
        for run in paragraph.runs:
            for shape in run._element.xpath('.//pic:pic'):
                # Buscar elementos de tamaño
                for extent in shape.xpath('.//a:ext'):
                    # Ajustar a 6.5 pulgadas de ancho x 4.5 pulgadas de alto
                    extent.set('{http://schemas.openxmlformats.org/drawingml/2006/main}cx', str(int(Inches(6.5).emu)))
                    extent.set('{http://schemas.openxmlformats.org/drawingml/2006/main}cy', str(int(Inches(4.5).emu)))
    
    doc.save(output_doc)
    
    print(f"5. Documento final: {output_doc}")
    print("   - Imágenes en máxima calidad (sin compresión)")
    print("   - Tamaño ajustado a 6.5\" x 4.5\" para mejor visibilidad")
    print(f"   - {replaced} imágenes incluidas")
    
    return output_doc

if __name__ == "__main__":
    improve_image_quality()
