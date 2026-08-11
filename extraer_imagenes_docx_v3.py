from docx import Document
import os

def extract_images_from_docx(docx_path, output_folder):
    """Extrae imágenes de un documento DOCX usando python-docx"""
    os.makedirs(output_folder, exist_ok=True)
    
    try:
        doc = Document(docx_path)
        
        # Acceder a las relaciones del documento para encontrar imágenes
        # Las imágenes se almacenan como relaciones en el documento
        extracted_count = 0
        
        # Método alternativo: buscar imágenes en las partes del documento
        for rel in doc.part.rels.values():
            if "image" in rel.target_ref:
                try:
                    image_data = rel.target_part.blob
                    image_name = os.path.basename(rel.target_ref)
                    output_path = os.path.join(output_folder, image_name)
                    
                    with open(output_path, 'wb') as f:
                        f.write(image_data)
                    
                    print(f"Imagen extraída: {image_name} ({len(image_data)} bytes)")
                    extracted_count += 1
                    
                except Exception as e:
                    print(f"Error extrayendo imagen: {e}")
        
        print(f"\nTotal de imágenes extraídas: {extracted_count}")
        return extracted_count
        
    except Exception as e:
        print(f"Error procesando el archivo DOCX: {e}")
        import traceback
        traceback.print_exc()
        return 0

if __name__ == "__main__":
    docx_file = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp\INFORME_FINAL_INTEGRADO.docx'
    output_dir = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)\web_images'
    
    print(f"Archivo DOCX: {docx_file}")
    print(f"Carpeta de salida: {output_dir}")
    print(f"Archivo DOCX existe: {os.path.exists(docx_file)}")
    
    count = extract_images_from_docx(docx_file, output_dir)
    print(f"\nProceso completado. {count} imágenes extraídas en {output_dir}")
