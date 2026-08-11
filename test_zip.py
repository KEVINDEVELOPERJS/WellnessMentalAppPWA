import zipfile
import os

docx_file = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp\INFORME_FINAL_INTEGRADO.docx'

print("Testing ZIP file...")
print(f"File exists: {os.path.exists(docx_file)}")
print(f"File size: {os.path.getsize(docx_file)} bytes")

try:
    with zipfile.ZipFile(docx_file, 'r') as zip_ref:
        files = zip_ref.namelist()
        print(f"Number of files in ZIP: {len(files)}")
        print("\nFiles in ZIP:")
        for i, file in enumerate(files):
            print(f"{i+1}. {file}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
