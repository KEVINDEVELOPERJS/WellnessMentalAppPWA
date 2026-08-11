import zipfile
import os

def extract_all_from_docx(docx_path, output_folder):
    """Extrae todo el contenido de un DOCX para inspección"""
    os.makedirs(output_folder, exist_ok=True)
    
    try:
        with zipfile.ZipFile(docx_path, 'r') as zip_ref:
            # Extraer todo el contenido
            zip_ref.extractall(output_folder)
            print(f"Todo el contenido extraído en: {output_folder}")
            
            # Listar archivos extraídos
            for root, dirs, files in os.walk(output_folder):
                for file in files:
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, output_folder)
                    print(f"  - {rel_path}")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    docx_file = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp\INFORME_FINAL_INTEGRADO.docx'
    output_dir = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)\docx_extracted'
    
    extract_all_from_docx(docx_file, output_dir)
