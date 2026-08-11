import re
import os
from PIL import Image
import io

def extract_images_from_rtf(rtf_path, output_folder):
    """Extrae imágenes de un archivo RTF"""
    os.makedirs(output_folder, exist_ok=True)
    
    with open(rtf_path, 'r', encoding='utf-8', errors='ignore') as f:
        rtf_content = f.read()
    
    # Buscar secuencias largas de datos hexadecimales (posibles imágenes)
    # Las imágenes RTF suelen tener datos hexadecimales largos
    hex_pattern = r'([0-9a-fA-F]{400,})'
    hex_matches = re.findall(hex_pattern, rtf_content)
    
    print(f"Se encontraron {len(hex_matches)} secuencias hexadecimales largas")
    
    extracted_count = 0
    
    for i, hex_data in enumerate(hex_matches):
        try:
            # Convertir hex a bytes
            image_bytes = bytes.fromhex(hex_data)
            
            # Intentar detectar el formato de imagen
            if image_bytes.startswith(b'\x89PNG'):
                ext = 'png'
            elif image_bytes.startswith(b'\xff\xd8'):
                ext = 'jpg'
            elif image_bytes.startswith(b'GIF'):
                ext = 'gif'
            elif image_bytes.startswith(b'BM'):
                ext = 'bmp'
            else:
                ext = 'png'  # Default
                
            # Intentar abrir la imagen
            img = Image.open(io.BytesIO(image_bytes))
            
            # Guardar la imagen
            output_path = os.path.join(output_folder, f'web_modulo_{i+1}.{ext}')
            img.save(output_path)
            print(f"Imagen {i+1} guardada: {output_path} ({img.size}, {len(image_bytes)} bytes)")
            extracted_count += 1
            
        except Exception as e:
            print(f"Error procesando imagen {i+1}: {e}")
            continue
    
    print(f"\nTotal de imágenes extraídas: {extracted_count}")
    return extracted_count

if __name__ == "__main__":
    rtf_file = r'C:\Users\Admin\Documents\FOTOS DE MODULOS APP WEB.rtf'
    output_dir = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)\web_images'
    
    count = extract_images_from_rtf(rtf_file, output_dir)
    print(f"\nProceso completado. {count} imágenes extraídas en {output_dir}")
