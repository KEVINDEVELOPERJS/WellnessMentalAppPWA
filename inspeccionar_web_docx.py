import zipfile
import os

docx_file = r'C:\Users\Admin\Documents\FOTOS DE MODULOS APP WEB.docx'

print("Inspeccionando archivo de imágenes web...")
print(f"File exists: {os.path.exists(docx_file)}")
print(f"File size: {os.path.getsize(docx_file)} bytes")

try:
    with zipfile.ZipFile(docx_file, 'r') as zip_ref:
        files = zip_ref.namelist()
        print(f"Number of files in ZIP: {len(files)}")
        print("\nFiles in ZIP:")
        for i, file in enumerate(files):
            print(f"{i+1}. {file}")
        
        # Buscar imágenes
        image_files = [f for f in files if 'media' in f.lower() or any(ext in f.lower() for ext in ['.png', '.jpg', '.jpeg', '.gif'])]
        print(f"\nPotential image files: {len(image_files)}")
        for img in image_files:
            print(f"  - {img}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
