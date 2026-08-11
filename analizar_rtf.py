import re
import os

def analyze_rtf(rtf_path):
    """Analiza el contenido de un archivo RTF"""
    with open(rtf_path, 'r', encoding='utf-8', errors='ignore') as f:
        rtf_content = f.read()
    
    print(f"Tamaño del archivo: {len(rtf_content)} caracteres")
    print(f"Primeros 500 caracteres:\n{rtf_content[:500]}")
    print("\n" + "="*50 + "\n")
    
    # Buscar patrones comunes de imágenes
    patterns = [
        (r'\{\\pict', 'Bloques pict'),
        (r'\\pngblip', 'PNG'),
        (r'\\jpegblip', 'JPEG'),
        (r'\\wmetafile', 'WMF'),
        (r'\{\\object', 'Objetos'),
        (r'\\shpinst', 'Shapes'),
    ]
    
    for pattern, name in patterns:
        matches = re.findall(pattern, rtf_content)
        print(f"{name}: {len(matches)} coincidencias")
    
    print("\n" + "="*50 + "\n")
    
    # Buscar datos hexadecimales de cualquier longitud
    hex_pattern = r'([0-9a-fA-F]{20,})'
    hex_matches = re.findall(hex_pattern, rtf_content)
    print(f"Secuencias hexadecimales (>20 chars): {len(hex_matches)}")
    
    if hex_matches:
        lengths = [len(m) for m in hex_matches]
        print(f"Longitudes: min={min(lengths)}, max={max(lengths)}, avg={sum(lengths)/len(lengths):.1f}")
        print(f"Primeras 5 secuencias: {[m[:50] + '...' if len(m) > 50 else m for m in hex_matches[:5]]}")

if __name__ == "__main__":
    rtf_file = r'C:\Users\Admin\Documents\FOTOS DE MODULOS APP WEB.rtf'
    analyze_rtf(rtf_file)
