from docx import Document
import zipfile
import os

web_doc = r'C:\Users\Admin\Documents\FOTOS DE MODULOS APP WEB.docx'

print("=== ANALIZANDO DOCUMENTO WEB PARA IDENTIFICAR DASHBOARD PSICÓLOGO ===")

# Primero revisar el contenido del documento para entender el orden
doc = Document(web_doc)

print("\n--- CONTENIDO DEL DOCUMENTO WEB ---")
for i, para in enumerate(doc.paragraphs[:30]):
    if para.text.strip():
        print(f"{i+1}. {para.text[:100]}")

print("\n--- IMÁGENES EN DOCUMENTO WEB ---")
with zipfile.ZipFile(web_doc, 'r') as z:
    images = [f for f in z.namelist() if f.startswith('word/media/image')]
    print(f"Total imágenes: {len(images)}")
    for i, img in enumerate(images):
        print(f"{i+1}. {os.path.basename(img)}")

# Ahora voy a crear un documento que analice las imágenes y muestre cuáles podrían ser del dashboard
print("\n=== ANÁLISIS DE IMÁGENES POTENCIALES DE DASHBOARD ===")
print("Basado en el documento web, las imágenes del dashboard psicólogo")
print("probablemente están en posiciones específicas.")
print("Necesito que me indiques qué número de imagen corresponde al dashboard")
print("para poder organizarlas correctamente.")
