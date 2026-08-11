import zipfile
import os

def inspect_docx(docx_path):
    """Inspecciona el contenido de un documento DOCX"""
    
    try:
        with zipfile.ZipFile(docx_path, 'r') as zip_ref:
            # Listar todos los archivos en el ZIP
            all_files = zip_ref.namelist()
            print(f"Total de archivos en el DOCX: {len(all_files)}")
            print("\nTodos los archivos:")
            for i, file in enumerate(all_files):
                print(f"{i+1}. {file}")
            
            # Buscar archivos de imagen
            image_files = [f for f in all_files if any(ext in f.lower() for ext in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.emf', '.wmf'])]
            print(f"\nArchivos de imagen encontrados: {len(image_files)}")
            for img in image_files:
                print(f"  - {img}")
                
            # Buscar carpeta media
            media_files = [f for f in all_files if 'media' in f.lower()]
            print(f"\nArchivos con 'media' en el nombre: {len(media_files)}")
            for media in media_files:
                print(f"  - {media}")
                
    except Exception as e:
        print(f"Error procesando el archivo DOCX: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    docx_file = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp\INFORME_FINAL_INTEGRADO.docx'
    
    print(f"Inspeccionando: {docx_file}")
    print(f"Archivo existe: {os.path.exists(docx_file)}")
    print(f"Tamaño: {os.path.getsize(docx_file)} bytes")
    print()
    
    inspect_docx(docx_file)
