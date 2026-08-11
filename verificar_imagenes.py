import zipfile
import os

web_doc = r'C:\Users\Admin\Documents\FOTOS DE MODULOS APP WEB.docx'
original_doc = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp\INFORME_FINAL_INTEGRADO.docx'

print("=== IMÁGENES EN DOCUMENTO WEB ===")
with zipfile.ZipFile(web_doc, 'r') as z:
    web_images = [f for f in z.namelist() if f.startswith('word/media/image')]
    print(f"Total: {len(web_images)}")
    for i, img in enumerate(web_images):
        data = z.read(img)
        print(f"{i+1}. {os.path.basename(img)} - {len(data)} bytes")

print("\n=== IMÁGENES EN DOCUMENTO ORIGINAL ===")
with zipfile.ZipFile(original_doc, 'r') as z:
    orig_images = [f for f in z.namelist() if f.startswith('word/media/image')]
    print(f"Total: {len(orig_images)}")
    for i, img in enumerate(orig_images):
        data = z.read(img)
        print(f"{i+1}. {os.path.basename(img)} - {len(data)} bytes")

print(f"\n=== COMPARACIÓN ===")
print(f"Web: {len(web_images)} imágenes")
print(f"Original: {len(orig_images)} imágenes")
print(f"Diferencia: {len(web_images) - len(orig_images)} imágenes")
