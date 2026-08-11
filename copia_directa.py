import shutil
import zipfile
import os

original = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp\INFORME_FINAL_INTEGRADO.docx'
web_doc = r'C:\Users\Admin\Documents\FOTOS DE MODULOS APP WEB.docx'
output = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)\INFORME_FINAL_INTEGRADO_WEB_COPIA_EXACTA.docx'

try:
    # Copiar documento original
    print("1. Copiando documento original...")
    shutil.copy2(original, output)
    
    # Extraer imágenes del documento web
    print("2. Extrayendo imágenes del documento web...")
    web_images = {}
    with zipfile.ZipFile(web_doc, 'r') as z:
        for f in z.namelist():
            if f.startswith('word/media/image'):
                num = f.replace('word/media/image', '').replace('.png', '')
                web_images[num] = z.read(f)
    
    print(f"   Imágenes extraídas: {len(web_images)}")
    
    # Reemplazar imágenes
    print("3. Reemplazando imágenes...")
    temp = output + '.tmp'
    with zipfile.ZipFile(output, 'r') as z1:
        with zipfile.ZipFile(temp, 'w', zipfile.ZIP_DEFLATED) as z2:
            for info in z1.infolist():
                data = z1.read(info.filename)
                if info.filename.startswith('word/media/image'):
                    num = info.filename.replace('word/media/image', '').replace('.png', '')
                    if num in web_images:
                        z2.writestr(info.filename, web_images[num])
                    else:
                        z2.writestr(info, data)
                else:
                    z2.writestr(info, data)
    
    os.remove(output)
    shutil.move(temp, output)
    
    print(f"4. Documento final creado: {output}")
    print("Proceso completado exitosamente")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
