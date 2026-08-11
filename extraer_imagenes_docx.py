from docx import Document
import os
import shutil

def extract_images_from_docx(docx_path, output_folder):
    """Extrae imágenes de un documento DOCX"""
    os.makedirs(output_folder, exist_ok=True)
    
    doc = Document(docx_path)
    
    # Los documentos DOCX son archivos ZIP, podemos extraer las imágenes del ZIP
    import zipfile
    
    extracted_count = 0
    
    try:
        with zipfile.ZipFile(docx_path, 'r') as zip_ref:
            # Buscar archivos de imagen en la carpeta media del DOCX
            image_files = [f for f in zip_ref.namelist() if f.startswith('word/media/')]
            
            print(f"Se encontraron {len(image_files)} imágenes en el documento")
            
            for image_file in image_files:
                try:
                    # Extraer el archivo de imagen
                    image_data = zip_ref.read(image_file)
                    
                    # Determinar el nombre del archivo
                    image_name = os.path.basename(image_file)
                    output_path = os.path.join(output_folder, image_name)
                    
                    # Guardar la imagen
                    with open(output_path, 'wb') as f:
                        f.write(image_data)
                    
                    print(f"Imagen extraída: {image_name}")
                    extracted_count += 1
                    
                except Exception as e:
                    print(f"Error extrayendo {image_file}: {e}")
                    
    except Exception as e:
        print(f"Error procesando el archivo DOCX: {e}")
    
    print(f"\nTotal de imágenes extraídas: {extracted_count}")
    return extracted_count

if __name__ == "__main__":
    docx_file = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp\INFORME_FINAL_INTEGRADO.docx'
    output_dir = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)\web_images'
    
    count = extract_images_from_docx(docx_file, output_dir)
    print(f"\nProceso completado. {count} imágenes extraídas en {output_dir}")
