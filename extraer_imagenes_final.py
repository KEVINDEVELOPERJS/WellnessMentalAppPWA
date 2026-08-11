import zipfile
import os

def extract_images_from_docx_final(docx_path, output_folder):
    """Extrae imágenes de un documento DOCX"""
    os.makedirs(output_folder, exist_ok=True)
    
    try:
        with zipfile.ZipFile(docx_path, 'r') as zip_ref:
            # Buscar archivos de imagen en word/media
            image_files = [f for f in zip_ref.namelist() if f.startswith('word/media/image')]
            
            print(f"Se encontraron {len(image_files)} imágenes en word/media")
            
            extracted_count = 0
            
            for image_file in image_files:
                try:
                    # Extraer el archivo de imagen
                    image_data = zip_ref.read(image_file)
                    
                    # Usar el nombre original
                    image_name = os.path.basename(image_file)
                    output_path = os.path.join(output_folder, image_name)
                    
                    # Guardar la imagen
                    with open(output_path, 'wb') as f:
                        f.write(image_data)
                    
                    print(f"Imagen extraída: {image_name} ({len(image_data)} bytes)")
                    extracted_count += 1
                    
                except Exception as e:
                    print(f"Error extrayendo {image_file}: {e}")
            
            # También extraer el thumbnail
            try:
                thumbnail_data = zip_ref.read('docProps/thumbnail.jpeg')
                thumbnail_path = os.path.join(output_folder, 'thumbnail.jpeg')
                with open(thumbnail_path, 'wb') as f:
                    f.write(thumbnail_data)
                print(f"Thumbnail extraído: thumbnail.jpeg ({len(thumbnail_data)} bytes)")
                extracted_count += 1
            except:
                pass
            
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
    
    count = extract_images_from_docx_final(docx_file, output_dir)
    print(f"\nProceso completado. {count} imágenes extraídas en {output_dir}")
