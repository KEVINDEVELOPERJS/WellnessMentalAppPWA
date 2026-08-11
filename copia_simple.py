import shutil
import zipfile
import os

# Rutas
original = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp\INFORME_FINAL_INTEGRADO.docx'
web_doc = r'C:\Users\Admin\Documents\FOTOS DE MODULOS APP WEB.docx'
output = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)\INFORME_FINAL_INTEGRADO_WEB_COPIA_EXACTA.docx'

print("Copiando documento original...")
shutil.copy2(original, output)

print("Extrayendo imágenes del documento web...")
web_images = {}
with zipfile.ZipFile(web_doc, 'r') as z:
    for f in z.namelist():
        if f.startswith('word/media/image'):
            num = f.replace('word/media/image', '').replace('.png', '')
            web_images[num] = z.read(f)
            print(f"Imagen {num}: {len(web_images[num])} bytes")

print(f"Total imágenes web: {len(web_images)}")

print("Reemplazando imágenes...")
temp = output + '.tmp'
with zipfile.ZipFile(output, 'r') as z1:
    with zipfile.ZipFile(temp, 'w', zipfile.ZIP_DEFLATED) as z2:
        for info in z1.infolist():
            data = z1.read(info.filename)
            if info.filename.startswith('word/media/image'):
                num = info.filename.replace('word/media/image', '').replace('.png', '')
                if num in web_images:
                    print(f"Reemplazando image{num}.png")
                    z2.writestr(info.filename, web_images[num])
                else:
                    z2.writestr(info, data)
            else:
                z2.writestr(info, data)

os.remove(output)
shutil.move(temp, output)

print(f"Documento final: {output}")
