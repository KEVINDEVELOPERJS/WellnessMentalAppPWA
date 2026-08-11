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
    
    # Carpeta temporal para trabajar
    temp_folder = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)\temp_docx'
    
    print("Creando copia exacta del documento original con nuevas imágenes...")
    
    # 1. Copiar el documento original a un archivo temporal
    print("1. Copiando documento original...")
    shutil.copy2(original_docx, output_docx)
    print(f"   Documento original copiado a: {output_docx}")
    
    # 2. Extraer imágenes del documento web
    print("2. Extrayendo imágenes del documento web...")
    web_images = []
    with zipfile.ZipFile(web_images_docx, 'r') as zip_ref:
        image_files = [f for f in zip_ref.namelist() if f.startswith('word/media/image')]
        for img_file in image_files:
            image_data = zip_ref.read(img_file)
            web_images.append((os.path.basename(img_file), image_data))
    print(f"   Se extrajeron {len(web_images)} imágenes del documento web")
    
    # 3. Reemplazar imágenes en el documento copiado
    print("3. Reemplazando imágenes en el documento copiado...")
    
    # Crear un nuevo ZIP con las imágenes reemplazadas
    temp_zip = output_docx + '.temp'
    
    with zipfile.ZipFile(output_docx, 'r') as original_zip:
        with zipfile.ZipFile(temp_zip, 'w', zipfile.ZIP_DEFLATED) as new_zip:
            # Copiar todos los archivos del original
            for file_info in original_zip.infolist():
                file_data = original_zip.read(file_info.filename)
                
                # Si es una imagen en word/media, reemplazarla
                if file_info.filename.startswith('word/media/image'):
                    # Obtener el número de imagen
                    image_num = file_info.filename.split('image')[-1].replace('.png', '')
                    
                    # Buscar la imagen correspondiente en las imágenes web
                    if image_num and int(image_num) <= len(web_images):
                        new_image_name, new_image_data = web_images[int(image_num) - 1]
                        print(f"   Reemplazando {file_info.filename} con {new_image_name}")
                        new_zip.writestr(file_info.filename, new_image_data)
                    else:
                        # Mantener la imagen original si no hay correspondencia
                        new_zip.writestr(file_info, file_data)
                else:
                    # Mantener todos los demás archivos igual
                    new_zip.writestr(file_info, file_data)
    
    # Reemplazar el archivo original con el modificado
    os.remove(output_docx)
    shutil.move(temp_zip, output_docx)
    
    print(f"4. Documento final creado exitosamente: {output_docx}")
    print("   El documento tiene la misma estructura que el original pero con las imágenes de la app web")
    
    return output_docx

if __name__ == "__main__":
    create_exact_copy_with_new_images()
