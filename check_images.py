import zipfile
import os

web_doc = r'C:\Users\Admin\Documents\FOTOS DE MODULOS APP WEB.docx'
original_doc = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp\INFORME_FINAL_INTEGRADO.docx'

try:
    print("IMAGENES EN DOCUMENTO WEB:")
    z = zipfile.ZipFile(web_doc, 'r')
    web_images = [f for f in z.namelist() if f.startswith('word/media/image')]
    print(f"Total: {len(web_images)}")
    for i, img in enumerate(web_images):
        print(f"{i+1}. {os.path.basename(img)}")
    z.close()
except Exception as e:
    print(f"Error web: {e}")

try:
    print("\nIMAGENES EN DOCUMENTO ORIGINAL:")
    z = zipfile.ZipFile(original_doc, 'r')
    orig_images = [f for f in z.namelist() if f.startswith('word/media/image')]
    print(f"Total: {len(orig_images)}")
    for i, img in enumerate(orig_images):
        print(f"{i+1}. {os.path.basename(img)}")
    z.close()
except Exception as e:
    print(f"Error original: {e}")

print(f"\nWeb: {len(web_images)} vs Original: {len(orig_images)}")
