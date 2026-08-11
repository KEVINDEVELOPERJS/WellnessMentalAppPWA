import zipfile
import os

def extract_images_from_web_docx(docx_path, output_folder):
    """Extrae imágenes del documento FOTOS DE MODULOS APP WEB.docx"""
    os.makedirs(output_folder, exist_ok=True)
    
    try:
        with zipfile.ZipFile(docx_path, 'r') as zip_ref:
            # Listar todos los archivos
            all_files = zip_ref.namelist()
            print(f"Total de archivos en el DOCX: {len(all_files)}")
            
            # Buscar archivos de imagen en word/media
            image_files = [f for f in all_files if f.startswith('word/media/image')]
            
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
            
            # También buscar imágenes en otras ubicaciones
            other_images = [f for f in all_files if any(ext in f.lower() for ext in ['.png', '.jpg', '.jpeg', '.gif']) and 'media' not in f.lower()]
            
            if other_images:
                print(f"Se encontraron {len(other_images)} imágenes adicionales")
                for img_file in other_images:
                    try:
                        image_data = zip_ref.read(img_file)
                        image_name = os.path.basename(img_file)
                        output_path = os.path.join(output_folder, f"other_{image_name}")
                        
                        with open(output_path, 'wb') as f:
                            f.write(image_data)
                        
                        print(f"Imagen adicional extraída: {image_name} ({len(image_data)} bytes)")
                        extracted_count += 1
                        
                    except Exception as e:
                        print(f"Error extrayendo {img_file}: {e}")
            
            print(f"\nTotal de imágenes extraídas: {extracted_count}")
            return extracted_count
            
    except Exception as e:
        print(f"Error procesando el archivo DOCX: {e}")
        import traceback
        traceback.print_exc()
        return 0

if __name__ == "__main__":
    docx_file = r'C:\Users\Admin\Documents\FOTOS DE MODULOS APP WEB.docx'
    output_dir = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)\web_images'
    
    print(f"Archivo DOCX: {docx_file}")
    print(f"Carpeta de salida: {output_dir}")
    print(f"Archivo DOCX existe: {os.path.exists(docx_file)}")
    
    count = extract_images_from_web_docx(docx_file, output_dir)
    print(f"\nProceso completado. {count} imágenes extraídas en {output_dir}")
