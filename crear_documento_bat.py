import os
import sys

def create_simple_rtf_document():
    """Crea un documento RTF simple que Word puede abrir"""
    
    rtf_content = r"""{\rtf1\ansi\ansicpg1252\deff0\deflang1034\deflangfe1034{\fonttbl{\f0\fnil\fcharset0 Calibri;}}
{\colortbl;\red0\green0\blue0;\red0\green0\blue255;\red0\green255\blue255;\red0\green255\blue0;\red255\green0\blue255;\red255\green0\blue0;\red255\green255\blue0;\red255\green255\blue255;}
\viewkind4\uc1\pard\cf1\f0\fs24\par
\pard\qc\f0\fs28\b INFORME TÉCNICO: FUNCIONAMIENTO CORRECTO DE WELLNESS MENTAL APP WEB\par
\pard\cf1\f0\fs24\par
Fecha: 4 de agosto de 2026\par
Versión: 1.0\par
Tipo: Informe de Validación de Criterios de Aceptación - Versión Web\par
\par
\b\fs28 RESUMEN EJECUTIVO\par
\b0\fs24\par
Este informe presenta una validación detallada del funcionamiento correcto de la aplicación web "Wellness Mental App Web", desarrollada con HTML5, CSS3, JavaScript y arquitectura PWA. La aplicación está diseñada para el bienestar mental de estudiantes adolescentes (13-18 años) e implementa múltiples módulos interconectados que cumplen con los criterios de aceptación definidos para cada historia de usuario.\par
\par
\b\fs28 ARQUITECTURA TÉCNICA\par
\b0\fs24\par
\b Estructura Web Implementada\par
\b0\par
\b Capa Model (Datos y Persistencia):\par
• IndexedDB: Base de datos local del navegador\par
• LocalStorage: Gestión de sesión y preferencias\par
• API Hub: Cliente REST para sincronización\par
\par
\b Capa View (Interfaz de Usuario):\par
\b0• index.html: Pantalla principal de login/registro\par
• evaluation.html: Sistema de evaluación psicológica\par
• chat.html: Interfaz de chat con asistente emocional IA\par
• exercises.html: Catálogo de ejercicios de bienestar\par
• games.html: Sistema de gamificación y mini-juegos\par
• community.html: Foros de comunidad estudiantil\par
• alerts.html: Panel de alertas para psicólogos (riesgo alto)\par
• alerts-low-medium.html: Panel de alertas para psicólogos (riesgo bajo/medio)\par
• questionnaire-editor.html: Editor de cuestionarios para psicólogos\par
• profile.html: Gestión de perfil y privacidad\par
• parent-reports.html: Generación de informes para padres\par
• videos.html: Videos guiados de respiración y meditación\par
• active-breaks.html: Configuración de pausas activas\par
• mental-garden.html: Jardín mental interactivo\par
\par
\b Capa Controller (Lógica de Negocio):\par
\b0• app.js: Controlador principal de la aplicación\par
• evaluation.js: Lógica de evaluación psicológica\par
• chat.js: Gestión de conversaciones con IA\par
• exercises.js: Control de ejercicios y temporizadores\par
• games.js: Sistema de gamificación, puntos y niveles\par
• mental-garden.js: Lógica del jardín mental\par
• alerts.js: Gestión de alertas de riesgo alto\par
• alerts-low-medium.js: Gestión de alertas de riesgo bajo/medio\par
• hub-client.js: Cliente API para comunicación con backend\par
\par
\b\fs28 VALIDACIÓN POR CRITERIOS DE ACEPTACIÓN CON EVIDENCIA VISUAL\par
\b0\fs24\par
\b HU-01: REGISTRO Y AUTENTICACIÓN DE USUARIOS\par
\b0\par
Criterios de Aceptación Implementados\par
\par
CA-01.1: Pantalla de Registro de Usuario con validación de campos\par
Implementado en: index.html, app.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_registro.png]\par
\par
CA-01.4: Pantalla de Login con autenticación\par
Implementado en: index.html, app.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_login.png]\par
\par
CA-01.3: Pantalla de Consentimiento Parental\par
Implementado en: index.html\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_consentimiento.png]\par
\page
\par
\b HU-02: DASHBOARD PRINCIPAL\par
\b0\par
Criterios de Aceptación Implementados\par
\par
CA-02.1: Dashboard de Estudiante con estado general\par
Implementado en: index.html, app.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_dashboard_estudiante.png]\par
\par
CA-02.1: Dashboard de Psicólogo con panel de alertas\par
Implementado en: index.html, app.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_dashboard_psicologo.png]\par
\page
\par
\b HU-03: SISTEMA DE EVALUACIÓN PSICOLÓGICA\par
\b0\par
Criterios de Aceptación Implementados\par
\par
CA-03.1: Lista de Cuestionarios Disponibles\par
Implementado en: evaluation.html, evaluation.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_cuestionarios.png]\par
\par
CA-03.1: Cuestionario GAD-7 en Progreso\par
Implementado en: evaluation.html, evaluation.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_gad7.png]\par
\par
CA-03.2: Resultados de Evaluación con nivel de riesgo\par
Implementado en: evaluation.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_resultados.png]\par
\par
CA-03.3: Historial de Evaluaciones\par
Implementado en: evaluation.html, evaluation.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_historial.png]\par
\page
\par
\b HU-04: CHAT CON INTELIGENCIA ARTIFICIAL\par
\b0\par
Criterios de Aceptación Implementados\par
\par
CA-04.1: Interfaz de Chat IA\par
Implementado en: chat.html, chat.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_chat.png]\par
\par
CA-04.2: Conversación con Asistente Emocional\par
Implementado en: chat.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_chat_conversacion.png]\par
\page
\par
\b HU-05: EJERCICIOS DE BIENESTAR\par
\b0\par
Criterios de Aceptación Implementados\par
\par
CA-05.1: Catálogo de Ejercicios\par
Implementado en: exercises.html, exercises.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_ejercicios.png]\par
\par
CA-05.2: Ejercicio de Respiración\par
Implementado en: exercises.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_respiracion.png]\par
\par
CA-05.2: Meditación Guiada\par
Implementado en: exercises.html, exercises.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_meditacion.png]\par
\par
CA-05.3: Progreso de Ejercicios\par
Implementado en: exercises.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_progreso.png]\par
\page
\par
\b HU-08: GAMIFICACIÓN Y JUEGOS\par
\b0\par
Criterios de Aceptación Implementados\par
\par
CA-08.1: Pantalla Principal de Juegos\par
Implementado en: games.html, games.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_juegos.png]\par
\par
CA-08.1: Mini-juego Puzzle Zen\par
Implementado en: puzzle-zen.html, puzzle-zen.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_puzzle.png]\par
\par
CA-08.1: Mini-juego Arte Emocional\par
Implementado en: arte-emocional.html, arte-emocional.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_arte.png]\par
\par
CA-08.1: Mini-juego Ritmo Calma\par
Implementado en: ritmo-calma.html, ritmo-calma.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_ritmo.png]\par
\par
CA-08.1: Jardín Mental\par
Implementado en: mental-garden.html, mental-garden.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_jardin.png]\par
\par
CA-08.4: Logros Desbloqueados\par
Implementado en: games.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_logros.png]\par
\par
CA-08.2-CA-08.3: Sistema de Puntos y Niveles\par
Implementado en: games.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_puntos.png]\par
\page
\par
\b HU-07: COMUNIDAD ESTUDIANTIL\par
\b0\par
Criterios de Aceptación Implementados\par
\par
CA-07.1: Foros de Comunidad\par
Implementado en: community.html, community.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_comunidad.png]\par
\par
CA-07.2: Creación de Post\par
Implementado en: community.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_post.png]\par
\par
CA-07.2: Interacción en Comunidad\par
Implementado en: community.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_interaccion.png]\par
\page
\par
\b HU-09: INFORMES PARA PADRES\par
\b0\par
Criterios de Aceptación Implementados\par
\par
CA-09.1: Generación de Informe\par
Implementado en: parent-reports.html, parent-reports.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_informes.png]\par
\par
CA-09.1: Vista Previa de Informe\par
Implementado en: parent-reports.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_informe_previa.png]\par
\page
\par
\b HU-10: GESTIÓN DE PERFIL Y PRIVACIDAD\par
\b0\par
Criterios de Aceptación Implementados\par
\par
CA-10.1: Perfil de Usuario\par
Implementado en: profile.html, profile.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_perfil.png]\par
\par
CA-10.2: Configuración de Privacidad\par
Implementado en: profile.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_privacidad.png]\par
\par
CA-10.3: Gestión de Sesiones\par
Implementado en: app.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_sesiones.png]\par
\page
\par
\b HU-06: DISEÑO DE CUESTIONARIOS POR PSICÓLOGO\par
\b0\par
Criterios de Aceptación Implementados\par
\par
CA-06.1: Editor de Cuestionarios\par
Implementado en: questionnaire-editor.html, questionnaire-editor.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_editor.png]\par
\par
CA-06.4: Vista Previa de Cuestionario\par
Implementado en: questionnaire-editor.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_editor_previa.png]\par
\page
\par
\b GESTIÓN DE ALERTAS PARA PSICÓLOGOS\par
\b0\par
Criterios de Aceptación Implementados\par
\par
CA-Alerta.1: Panel de Alertas Riesgo Alto\par
Implementado en: alerts.html, alerts.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_alertas_panel.png]\par
\par
CA-Alerta.1: Detalle de Alerta\par
Implementado en: alerts.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_alertas_detalle.png]\par
\par
CA-Alerta.2: Panel de Alertas Riesgo Bajo/Medio\par
Implementado en: alerts-low-medium.html, alerts-low-medium.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_alertas_bajo_medio.png]\par
\page
\par
\b MISIONES DIARIAS Y CHECK-IN\par
\b0\par
Criterios de Aceptación Implementados\par
\par
CA-Mision.1: Check-In Diario\par
Implementado en: index.html, app.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_checkin.png]\par
\par
CA-Mision.2: Misiones Diarias\par
Implementado en: games.html, games.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_misiones.png]\par
\page
\par
\b VIDEOS GUIADOS\par
\b0\par
Criterios de Aceptación Implementados\par
\par
CA-Video.1: Catálogo de Videos\par
Implementado en: videos.html, videos.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_videos.png]\par
\par
CA-Video.2: Reproducción de Video\par
Implementado en: videos.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_video_reproduccion.png]\par
\page
\par
\b PAUSAS ACTIVAS\par
\b0\par
Criterios de Aceptación Implementados\par
\par
CA-Pausa.1: Pantalla de Pausas Activas\par
Implementado en: active-breaks.html, active-breaks.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_pausas.png]\par
\par
CA-Pausa.2: Configuración de Recordatorios\par
Implementado en: active-breaks.js\par
✅ FUNCIONAL\par
[INSERTAR IMAGEN: web_pausa_config.png]\par
\page
\par
\b\fs28 CONCLUSIONES\par
\b0\fs24\par
La aplicación web Wellness Mental App cumple satisfactoriamente con todos los criterios de aceptación establecidos para cada historia de usuario. La implementación web mantiene paridad funcional con la versión Android nativa, aprovechando las ventajas de las tecnologías web modernas para ofrecer una experiencia de usuario consistente y accesible multiplataforma.\par
\par
Todos los módulos están plenamente operativos:\par
• Sistema de autenticación y gestión de usuarios\par
• Evaluaciones psicológicas con cálculo automático de riesgos\par
• Chat con asistente emocional IA\par
• Ejercicios de bienestar interactivos\par
• Sistema de gamificación completo con jardín mental\par
• Comunidad estudiantil\par
• Panel de alertas para psicólogos (alto, medio y bajo riesgo)\par
• Informes para padres\par
• Gestión de perfiles y privacidad\par
• Editor de cuestionarios para psicólogos\par
• Videos guiados y pausas activas\par
\par
La arquitectura web implementada (HTML5, CSS3, JavaScript, IndexedDB, PWA) proporciona una base sólida y escalable para la aplicación.\par
}
"""
    
    output_path = r'C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)\INFORME_WEB_COMPLETO.rtf'
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(rtf_content)
    
    print(f"✅ Documento RTF creado: {output_path}")
    print("📝 Abre este archivo en Microsoft Word")
    print("🖼️ Extrae las imágenes del RTF original e insértalas donde indica [INSERTAR IMAGEN]")
    print("💾 Luego guarda como .docx para el formato final")
    
    return output_path

if __name__ == '__main__':
    create_simple_rtf_document()
