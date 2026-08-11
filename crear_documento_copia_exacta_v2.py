from docx import Document
import shutil
import os
import zipfile

def create_exact_copy_with_new_images():
    """Crea una copia exacta del documento original reemplazando las imágenes"""
    
    # Rutas de archivos
    original_docx = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp\INFORME_FINAL_INTEGRADO.docx'
    web_images_docx = r'C:\Users\Admin\Documents\FOTOS DE MODULOS APP WEB.docx'
    output_docx = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)\INFORME_FINAL_INTEGRADO_WEB_COPIA_EXACTA.docx'
    
    print("Verificando archivos...")
    print(f"Original existe: {os.path.exists(original_docx)}")
    print(f"Web images existe: {os.path.exists(web_images_docx)}")
    
    # 1. Copiar el documento original
    print("\n1. Copiando documento original...")
    try:
        shutil.copy2(original_docx, output_docx)
        print(f"   Documento copiado exitosamente")
    except Exception as e:
        print(f"   Error copiando documento: {e}")
        return None
    
    # 2. Extraer imágenes del documento web
    print("\n2. Extrayendo imágenes del documento web...")
    web_images = {}
    try:
        with zipfile.ZipFile(web_images_docx, 'r') as zip_ref:
            image_files = [f for f in zip_ref.namelist() if f.startswith('word/media/image')]
            print(f"   Encontradas {len(image_files)} imágenes en documento web")
            
            for img_file in image_files:
                image_data = zip_ref.read(img_file)
                # Extraer número de imagen
                img_name = os.path.basename(img_file)
                img_num = img_name.replace('image', '').replace('.png', '')
                web_images[img_num] = image_data
                print(f"   Imagen extraída: {img_name} ({len(image_data)} bytes)")
    except Exception as e:
        print(f"   Error extrayendo imágenes: {e}")
        return None
    
    # 3. Reemplazar imágenes en el documento copiado
    print("\n3. Reemplazando imágenes en el documento copiado...")
    temp_zip = output_docx + '.temp'
    
    try:
        with zipfile.ZipFile(output_docx, 'r') as original_zip:
            with zipfile.ZipFile(temp_zip, 'w', zipfile.ZIP_DEFLATED) as new_zip:
                replaced_count = 0
                
                for file_info in original_zip.infolist():
                    file_data = original_zip.read(file_info.filename)
                    
                    # Si es una imagen en word/media, reemplazarla
                    if file_info.filename.startswith('word/media/image'):
                        # Obtener el número de imagen
                        img_name = os.path.basename(file_info.filename)
                        img_num = img_name.replace('image', '').replace('.png', '')
                        
                        # Buscar la imagen correspondiente en las imágenes web
                        if img_num in web_images:
                            print(f"   Reemplazando {img_name} con imagen web #{img_num}")
                            new_zip.writestr(file_info.filename, web_images[img_num])
                            replaced_count += 1
                        else:
                            print(f"   Manteniendo original: {img_name} (no hay correspondencia web)")
                            new_zip.writestr(file_info, file_data)
                    else:
                        # Mantener todos los demás archivos igual
                        new_zip.writestr(file_info, file_data)
                
                print(f"   Total de imágenes reemplazadas: {replaced_count}")
        
        # Reemplazar el archivo original con el modificado
        os.remove(output_docx)
        shutil.move(temp_zip, output_docx)
        
        print(f"\n4. Documento final creado exitosamente: {output_docx}")
        print("   El documento tiene la misma estructura que el original pero con las imágenes de la app web")
        
        return output_docx
        
    except Exception as e:
        print(f"   Error reemplazando imágenes: {e}")
        import traceback
        traceback.print_exc()
        # Limpiar archivo temporal si existe
        if os.path.exists(temp_zip):
            os.remove(temp_zip)
        return None

if __name__ == "__main__":
    result = create_exact_copy_with_new_images()
    if result:
        print("\nProceso completado exitosamente")
    else:
        print("\nProceso falló")
