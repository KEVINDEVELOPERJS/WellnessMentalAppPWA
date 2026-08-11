import win32com.client as win32
import os

def create_word_document_com():
    """Crea documento Word usando win32com (método alternativo)"""
    
    try:
        # Crear instancia de Word
        word = win32com.client.Dispatch("Word.Application")
        word.Visible = True
        
        # Crear nuevo documento
        doc = word.Documents.Add()
        
        # Configurar página
        doc.PageSetup.LeftMargin = 36  # 0.5 pulgadas
        doc.PageSetup.RightMargin = 36
        doc.PageSetup.TopMargin = 36
        doc.PageSetup.BottomMargin = 36
        
        # Título principal
        selection = word.Selection
        selection.ParagraphFormat.Alignment = 1  # Centrado
        selection.Font.Name = "Times New Roman"
        selection.Font.Size = 16
        selection.Font.Bold = True
        selection.TypeText("Informe Técnico: Funcionamiento Correcto de Wellness Mental App Web\r\n")
        selection.TypeParagraph()
        
        # Metadatos
        selection.ParagraphFormat.Alignment = 0  # Izquierda
        selection.Font.Size = 11
        selection.Font.Bold = False
        selection.TypeText("Fecha: 4 de agosto de 2026\r\n")
        selection.TypeText("Versión: 1.0\r\n")
        selection.TypeText("Tipo: Informe de Validación de Criterios de Aceptación - Versión Web\r\n")
        selection.TypeParagraph()
        
        # Resumen Ejecutivo
        selection.Font.Bold = True
        selection.Font.Size = 14
        selection.TypeText("Resumen Ejecutivo\r\n")
        selection.Font.Bold = False
        selection.Font.Size = 11
        selection.TypeText("Este informe presenta una validación detallada del funcionamiento correcto de la aplicación web \"Wellness Mental App Web\", desarrollada con HTML5, CSS3, JavaScript y arquitectura PWA. La aplicación está diseñada para el bienestar mental de estudiantes adolescentes (13-18 años) e implementa múltiples módulos interconectados que cumplen con los criterios de aceptación definidos para cada historia de usuario.\r\n")
        selection.TypeParagraph()
        
        # Arquitectura Técnica
        selection.Font.Bold = True
        selection.Font.Size = 14
        selection.TypeText("Arquitectura Técnica\r\n")
        selection.Font.Bold = False
        selection.Font.Size = 12
        selection.TypeText("Estructura Web Implementada\r\n")
        selection.TypeParagraph()
        
        # Capa Model
        selection.Font.Bold = True
        selection.Font.Size = 11
        selection.TypeText("Capa Model (Datos y Persistencia):\r\n")
        selection.Font.Bold = False
        selection.TypeText("• IndexedDB: Base de datos local del navegador\r\n")
        selection.TypeText("• LocalStorage: Gestión de sesión y preferencias\r\n")
        selection.TypeText("• API Hub: Cliente REST para sincronización\r\n")
        selection.TypeParagraph()
        
        # Capa View
        selection.Font.Bold = True
        selection.TypeText("Capa View (Interfaz de Usuario):\r\n")
        selection.Font.Bold = False
        pages = [
            "index.html: Pantalla principal de login/registro",
            "evaluation.html: Sistema de evaluación psicológica",
            "chat.html: Interfaz de chat con asistente emocional IA",
            "exercises.html: Catálogo de ejercicios de bienestar",
            "games.html: Sistema de gamificación y mini-juegos",
            "community.html: Foros de comunidad estudiantil",
            "alerts.html: Panel de alertas para psicólogos (riesgo alto)",
            "alerts-low-medium.html: Panel de alertas para psicólogos (riesgo bajo/medio)",
            "questionnaire-editor.html: Editor de cuestionarios para psicólogos",
            "profile.html: Gestión de perfil y privacidad",
            "parent-reports.html: Generación de informes para padres",
            "videos.html: Videos guiados de respiración y meditación",
            "active-breaks.html: Configuración de pausas activas",
            "mental-garden.html: Jardín mental interactivo"
        ]
        for page in pages:
            selection.TypeText(f"• {page}\r\n")
        selection.TypeParagraph()
        
        # Capa Controller
        selection.Font.Bold = True
        selection.TypeText("Capa Controller (Lógica de Negocio):\r\n")
        selection.Font.Bold = False
        controllers = [
            "app.js: Controlador principal de la aplicación",
            "evaluation.js: Lógica de evaluación psicológica",
            "chat.js: Gestión de conversaciones con IA",
            "exercises.js: Control de ejercicios y temporizadores",
            "games.js: Sistema de gamificación, puntos y niveles",
            "mental-garden.js: Lógica del jardín mental",
            "alerts.js: Gestión de alertas de riesgo alto",
            "alerts-low-medium.js: Gestión de alertas de riesgo bajo/medio",
            "hub-client.js: Cliente API para comunicación con backend"
        ]
        for controller in controllers:
            selection.TypeText(f"• {controller}\r\n")
        selection.TypeParagraph()
        
        # Validación por Criterios
        selection.Font.Bold = True
        selection.Font.Size = 14
        selection.TypeText("Validación por Criterios de Aceptación con Evidencia Visual\r\n")
        selection.Font.Bold = False
        selection.Font.Size = 11
        selection.TypeParagraph()
        
        # Agregar marcadores para imágenes
        modules = [
            ("HU-01: Registro y Autenticación de Usuarios", ["web_registro.png", "web_login.png", "web_consentimiento.png"]),
            ("HU-02: Dashboard Principal", ["web_dashboard_estudiante.png", "web_dashboard_psicologo.png"]),
            ("HU-03: Sistema de Evaluación Psicológica", ["web_cuestionarios.png", "web_gad7.png", "web_resultados.png", "web_historial.png"]),
            ("HU-04: Chat con Inteligencia Artificial", ["web_chat.png", "web_chat_conversacion.png"]),
            ("HU-05: Ejercicios de Bienestar", ["web_ejercicios.png", "web_respiracion.png", "web_meditacion.png", "web_progreso.png"]),
            ("HU-08: Gamificación y Juegos", ["web_juegos.png", "web_puzzle.png", "web_arte.png", "web_ritmo.png", "web_jardin.png", "web_logros.png", "web_puntos.png"]),
            ("HU-07: Comunidad Estudiantil", ["web_comunidad.png", "web_post.png", "web_interaccion.png"]),
            ("HU-09: Informes para Padres", ["web_informes.png", "web_informe_previa.png"]),
            ("HU-10: Gestión de Perfil y Privacidad", ["web_perfil.png", "web_privacidad.png", "web_sesiones.png"]),
            ("HU-06: Diseño de Cuestionarios por Psicólogo", ["web_editor.png", "web_editor_previa.png"]),
            ("Gestión de Alertas para Psicólogos", ["web_alertas_panel.png", "web_alertas_detalle.png", "web_alertas_bajo_medio.png"]),
            ("Misiones Diarias y Check-In", ["web_checkin.png", "web_misiones.png"]),
            ("Videos Guiados", ["web_videos.png", "web_video_reproduccion.png"]),
            ("Pausas Activas", ["web_pausas.png", "web_pausa_config.png"])
        ]
        
        for module_title, images in modules:
            selection.Font.Bold = True
            selection.Font.Size = 12
            selection.TypeText(f"{module_title}\r\n")
            selection.Font.Bold = False
            selection.Font.Size = 11
            selection.TypeText("Criterios de Aceptación Implementados\r\n")
            selection.TypeParagraph()
            
            for image in images:
                criterion = image.replace('.png', '').replace('web_', 'CA-')
                selection.TypeText(f"{criterion}: Implementado ✅ FUNCIONAL\r\n")
                selection.TypeText(f"[INSERTAR IMAGEN: {image}]\r\n")
                selection.TypeParagraph()
            
            selection.InsertBreak(7)  # Page break
        
        # Conclusiones
        selection.Font.Bold = True
        selection.Font.Size = 14
        selection.TypeText("Conclusiones\r\n")
        selection.Font.Bold = False
        selection.Font.Size = 11
        selection.TypeText("La aplicación web Wellness Mental App cumple satisfactoriamente con todos los criterios de aceptación establecidos para cada historia de usuario. La implementación web mantiene paridad funcional con la versión Android nativa, aprovechando las ventajas de las tecnologías web modernas para ofrecer una experiencia de usuario consistente y accesible multiplataforma.\r\n")
        selection.TypeParagraph()
        
        # Guardar documento
        output_path = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)\INFORME_FINAL_INTEGRADO_WEB.docx'
        doc.SaveAs(output_path)
        
        print(f"✅ Documento Word creado: {output_path}")
        print("📝 El documento contiene marcadores para insertar las imágenes manualmente")
        print("🖼️ Debes extraer las imágenes del RTF e insertarlas donde indica [INSERTAR IMAGEN: nombre.png]")
        
        # No cerrar Word para que el usuario pueda ver el documento
        # word.Quit()
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    create_word_document_com()
