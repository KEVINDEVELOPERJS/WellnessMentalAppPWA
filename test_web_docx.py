import zipfile
import os

docx_file = r'C:\Users\Admin\Documents\FOTOS DE MODULOS APP WEB.docx'

print("Testing web images DOCX...")
try:
    print(f"File exists: {os.path.exists(docx_file)}")
    if os.path.exists(docx_file):
        print(f"File size: {os.path.getsize(docx_file)} bytes")
        
        with zipfile.ZipFile(docx_file, 'r') as zip_ref:
            files = zip_ref.namelist()
            print(f"Number of files in ZIP: {len(files)}")
            print("\nFiles in ZIP:")
            for i, file in enumerate(files):
                print(f"{i+1}. {file}")
    else:
        print("File does not exist!")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
