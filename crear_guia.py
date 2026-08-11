"""
Script para crear documento Word base que el usuario puede completar manualmente
"""
import os

def create_manual_guide():
    """Crea guía para proceso manual"""
    
    guide_content = """
# GUÍA PARA CREAR DOCUMENTO WORD COMPLETO CON IMÁGENES

## PASO 1: Extraer Imágenes del RTF Original

1. Abre el archivo: C:\\Users\\Admin\\Documents\\FOTOS DE MODULOS APP WEB.rtf
2. Para cada imagen en el documento:
   - Clic derecho en la imagen
   - Selecciona "Guardar como imagen"
   - Guarda en la carpeta: WellnessMentalApp(WEB)\\web_images\\
   - Nombra según la lista abajo

## PASO 2: Usar Documento RTF Base

1. Abre el archivo: WellnessMentalApp(WEB)\\INFORME_WEB_COMPLETO.rtf
2. Este documento tiene la estructura completa igual al documento Android
3. Reemplaza cada marcador [Extraer imagen del RTF original: nombre.png] con la imagen correspondiente

## PASO 3: Guardar como Word

1. En Word: Archivo → Guardar como
2. Selecciona "Documento de Word (*.docx)"
3. Nombre: INFORME_FINAL_INTEGRADO_WEB.docx
4. Ubicación: WellnessMentalApp(WEB)\\

## LISTA DE IMÁGENES REQUERIDAS (41 en total)

### Grupo 1 - Registro (3 imágenes)
- web_registro.png
- web_login.png
- web_consentimiento.png

### Grupo 2 - Dashboards (2 imágenes)
- web_dashboard_estudiante.png
- web_dashboard_psicologo.png

### Grupo 3 - Evaluaciones (4 imágenes)
- web_cuestionarios.png
- web_gad7.png
- web_resultados.png
- web_historial.png

### Grupo 4 - Chat (2 imágenes)
- web_chat.png
- web_chat_conversacion.png

### Grupo 5 - Ejercicios (4 imágenes)
- web_ejercicios.png
- web_respiracion.png
- web_meditacion.png
- web_progreso.png

### Grupo 6 - Juegos (7 imágenes)
- web_juegos.png
- web_puzzle.png
- web_arte.png
- web_ritmo.png
- web_jardin.png
- web_logros.png
- web_puntos.png

### Grupo 7 - Comunidad (3 imágenes)
- web_comunidad.png
- web_post.png
- web_interaccion.png

### Grupo 8 - Informes (2 imágenes)
- web_informes.png
- web_informe_previa.png

### Grupo 9 - Perfil (3 imágenes)
- web_perfil.png
- web_privacidad.png
- web_sesiones.png

### Grupo 10 - Editor (2 imágenes)
- web_editor.png
- web_editor_previa.png

### Grupo 11 - Alertas (3 imágenes)
- web_alertas_panel.png
- web_alertas_detalle.png
- web_alertas_bajo_medio.png

### Grupo 12 - Misiones (2 imágenes)
- web_checkin.png
- web_misiones.png

### Grupo 13 - Videos (2 imágenes)
- web_videos.png
- web_video_reproduccion.png

### Grupo 14 - Pausas (2 imágenes)
- web_pausas.png
- web_pausa_config.png

## ESTRUCTURA DEL DOCUMENTO FINAL

El documento INFORME_WEB_COMPLETO.rtf ya contiene:

✅ Portada con metadatos
✅ Resumen Ejecutivo
✅ Arquitectura Técnica Web (Model, View, Controller)
✅ Validación por Criterios de Aceptación para cada módulo
✅ Marcadores para insertar imágenes
✅ Conclusiones

## NOTAS IMPORTANTES

- El documento RTF base tiene la MISMA estructura que el documento Android
- Cada sección ya tiene el formato correcto (encabezados, negritas, etc.)
- Solo necesitas insertar las imágenes donde indica
- Las imágenes deben estar centradas y de tamaño apropiado
- Al guardar como .docx mantendrás todo el formato

## ALTERNATIVA: Uso del Documento Android como Plantilla

Si prefieres, puedes:

1. Abrir el documento Android: INFORME_FINAL_INTEGRADO.docx
2. Guardar como: INFORME_FINAL_INTEGRADO_WEB.docx
3. Reemplazar todo el contenido con la información de la app web
4. Insertar las imágenes extraídas del RTF

Este método puede ser más rápido si estás familiarizado con el formato del documento Android.
"""
    
    guide_path = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)\GUIA_COMPLETAR_DOCUMENTO.md'
    
    with open(guide_path, 'w', encoding='utf-8') as f:
        f.write(guide_content)
    
    print(f"✅ Guía creada: {guide_path}")
    print("📝 Sigue las instrucciones en la guía para completar el documento")
    
    return guide_path

if __name__ == '__main__':
    create_manual_guide()
