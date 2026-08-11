from docx import Document
import os
import zipfile

def extract_images_from_docx_zip(docx_path, output_folder):
    """Extrae imágenes de un documento DOCX usando directamente el archivo ZIP"""
    os.makedirs(output_folder, exist_ok=True)
    
    try:
        with zipfile.ZipFile(docx_path, 'r') as zip_ref:
            # Listar todos los archivos
            all_files = zip_ref.namelist()
            print(f"Total de archivos en el DOCX: {len(all_files)}")
            
            # Buscar todos los archivos que podrían ser imágenes
            potential_images = []
            for file in all_files:
                # Buscar en word/media o carpetas similares
                if 'media' in file.lower() or 'image' in file.lower():
                    potential_images.append(file)
            
            print(f"Archivos potenciales de imágenes: {len(potential_images)}")
            for img in potential_images:
                print(f"  - {img}")
            
            extracted_count = 0
            
            # Extraer cualquier archivo que parezca una imagen
            for file in all_files:
                if any(ext in file.lower() for ext in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.emf', '.wmf']):
                    try:
                        image_data = zip_ref.read(file)
                        image_name = os.path.basename(file)
                        output_path = os.path.join(output_folder, image_name)
                        
                        with open(output_path, 'wb') as f:
                            f.write(image_data)
                        
                        print(f"Imagen extraída: {image_name} ({len(image_data)} bytes)")
                        extracted_count += 1
                        
                    except Exception as e:
                        print(f"Error extrayendo {file}: {e}")
            
            # Si no se encontraron imágenes con extensiones, intentar extraer archivos de media
            if extracted_count == 0:
                print("No se encontraron imágenes con extensiones conocidas, buscando en carpeta media...")
                for file in all_files:
                    if 'word/media/' in file:
                        try:
                            image_data = zip_ref.read(file)
                            # Determinar extensión por magic bytes
                            if image_data.startswith(b'\x89PNG'):
                                ext = '.png'
                            elif image_data.startswith(b'\xff\xd8'):
                                ext = '.jpg'
                            else:
                                ext = '.bin'
                            
                            image_name = f"image_{extracted_count + 1}{ext}"
                            output_path = os.path.join(output_folder, image_name)
                            
                            with open(output_path, 'wb') as f:
                                f.write(image_data)
                            
                            print(f"Imagen extraída: {image_name} ({len(image_data)} bytes)")
                            extracted_count += 1
                            
                        except Exception as e:
                            print(f"Error extrayendo {file}: {e}")
            
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
    
    count = extract_images_from_docx_zip(docx_file, output_dir)
    print(f"\nProceso completado. {count} imágenes extraídas en {output_dir}")
