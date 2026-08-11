import re
import base64
import os
from PIL import Image
import io

def extract_images_from_rtf(rtf_path, output_folder):
    """
    Extrae imágenes de un archivo RTF y las guarda como PNG
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    with open(rtf_path, 'rb') as f:
        rtf_content = f.read()
    
    # Decodificar contenido RTF
    try:
        rtf_text = rtf_content.decode('latin-1')
    except:
        rtf_text = rtf_content.decode('utf-8', errors='ignore')
    
    # Buscar imágenes en formato hexadecimal en RTF
    # Formato típico: {\pict\pngblip... hexadecimal data}
    image_pattern = r'\{\\pict[^}]*((?:[0-9a-fA-F]{2}\s*)+)\}'
    
    matches = re.findall(image_pattern, rtf_text)
    
    print(f'Imágenes encontradas: {len(matches)}')
    
    for i, hex_data in enumerate(matches):
        try:
            # Limpiar datos hexadecimales
            hex_clean = re.sub(r'\s', '', hex_data)
            
            # Convertir a bytes
            image_bytes = bytes.fromhex(hex_clean)
            
            # Intentar abrir como imagen
            img = Image.open(io.BytesIO(image_bytes))
            
            # Guardar como PNG
            output_path = os.path.join(output_folder, f'web_extracted_{i+1}.png')
            img.save(output_path, 'PNG')
            
            print(f'Imagen {i+1} guardada: {output_path} ({img.size})')
            
        except Exception as e:
            print(f'Error procesando imagen {i+1}: {e}')
    
    print(f'Extracción completada. Imágenes guardadas en: {output_folder}')

if __name__ == '__main__':
    rtf_path = r'C:\Users\Admin\Documents\FOTOS DE MODULOS APP WEB.rtf'
    output_folder = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)\web_images'
    
    extract_images_from_rtf(rtf_path, output_folder)
