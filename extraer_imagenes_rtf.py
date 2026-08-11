import re
import os
import base64
from PIL import Image
import io

def extract_images_from_rtf(rtf_path, output_folder):
    """Extrae imágenes de un archivo RTF"""
    os.makedirs(output_folder, exist_ok=True)
    
    with open(rtf_path, 'r', encoding='utf-8', errors='ignore') as f:
        rtf_content = f.read()
    
    # Buscar patrones de imágenes en RTF
    # Formato: {\pict\pngblip...} o {\pict\jpegblip...}
    image_pattern = r'\{\\pict(?:[^}]*?)(?:\\pngblip|\\jpegblip)(.*?)\}'
    matches = re.findall(image_pattern, rtf_content, re.DOTALL)
    
    # También buscar datos hexadecimales de imágenes
    hex_pattern = r'\{\\pict[^}]*?([0-9a-fA-F\s]+)\}'
    hex_matches = re.findall(hex_pattern, rtf_content, re.DOTALL)
    
    print(f"Se encontraron {len(matches)} imágenes con formato pict")
    print(f"Se encontraron {len(hex_matches)} imágenes con datos hexadecimales")
    
    extracted_count = 0
    
    for i, hex_data in enumerate(hex_matches):
        try:
            # Limpiar datos hexadecimales
            clean_hex = re.sub(r'[^0-9a-fA-F]', '', hex_data)
            
            if len(clean_hex) < 100:  # Muy corto para ser una imagen
                continue
                
            # Convertir hex a bytes
            image_bytes = bytes.fromhex(clean_hex)
            
            # Intentar abrir la imagen
            img = Image.open(io.BytesIO(image_bytes))
            
            # Guardar la imagen
            output_path = os.path.join(output_folder, f'web_modulo_{i+1}.png')
            img.save(output_path)
            print(f"Imagen {i+1} guardada: {output_path} ({img.size})")
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
