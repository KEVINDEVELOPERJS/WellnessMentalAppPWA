import re
import os
import base64

def extract_rtf_images_simple(rtf_path, output_folder):
    """Extrae imágenes de RTF de forma más simple"""
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    with open(rtf_path, 'rb') as f:
        content = f.read()
    
    # Buscar patrones de imágenes en RTF
    # Patrón para imágenes PNG en RTF
    hex_pattern = r'([0-9a-fA-F]{2})'
    
    # Buscar bloques de datos hexadecimales largos (posibles imágenes)
    # Las imágenes en RTF suelen estar en bloques {\pict ... }
    pict_blocks = re.findall(r'\{\\pict[^}]*?([0-9a-fA-F\s]{100,})\}', content.decode('latin-1', errors='ignore'))
    
    print(f'Bloques de imagen encontrados: {len(pict_blocks)}')
    
    for i, hex_data in enumerate(pict_blocks):
        try:
            # Limpiar espacios y convertir
            clean_hex = re.sub(r'\s', '', hex_data)
            
            # Asegurar longitud par
            if len(clean_hex) % 2 != 0:
                clean_hex = clean_hex[:-1]
            
            # Convertir a bytes
            image_bytes = bytes.fromhex(clean_hex)
            
            # Guardar como archivo
            output_path = os.path.join(output_folder, f'web_{i+1}.png')
            with open(output_path, 'wb') as img_file:
                img_file.write(image_bytes)
            
            print(f'Imagen {i+1} guardada: {output_path} ({len(image_bytes)} bytes)')
            
        except Exception as e:
            print(f'Error en imagen {i+1}: {e}')

if __name__ == '__main__':
    rtf_path = r'C:\Users\Admin\Documents\FOTOS DE MODULOS APP WEB.rtf'
    output_folder = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)\web_images'
    
    extract_rtf_images_simple(rtf_path, output_folder)
