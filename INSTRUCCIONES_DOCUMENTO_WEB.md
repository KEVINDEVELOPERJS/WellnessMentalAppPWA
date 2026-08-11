# INSTRUCCIONES PARA CREAR EL DOCUMENTO DE LA APP WEB

## ESTRUCTURA DEL DOCUMENTO

Basado en el documento INFORME_FINAL_INTEGRADO.docx de la app Android, aquí está la estructura para la app web:

### 1. PORTADA
- **Título**: "Informe Técnico: Funcionamiento Correcto de Wellness Mental App Web"
- **Fecha**: 4 de agosto de 2026
- **Versión**: 1.0
- **Tipo**: Informe de Validación de Criterios de Aceptación - Versión Web

### 2. RESUMEN EJECUTIVO
Descripción general de la app web:
- Aplicación web PWA desarrollada con HTML5, CSS3, JavaScript
- Arquitectura web moderna con IndexedDB para persistencia local
- Público objetivo: estudiantes adolescentes (13-18 años)
- Módulos interconectados con paridad funcional a versión Android
- Despliegue híbrido mediante Capacitor

### 3. ARQUITECTURA TÉCNICA WEB

#### Capa Model (Datos y Persistencia):
- **IndexedDB**: Base de datos local del navegador
- **LocalStorage**: Gestión de sesión y preferencias
- **API Hub**: Cliente REST para sincronización
- **LocalStorage**: Gestión de configuración

#### Capa View (Interfaz de Usuario):
- **index.html**: Login/registro
- **evaluation.html**: Evaluaciones psicológicas
- **chat.html**: Chat con IA
- **exercises.html**: Ejercicios de bienestar
- **games.html**: Gamificación y juegos
- **community.html**: Comunidad estudiantil
- **alerts.html**: Alertas riesgo alto
- **alerts-low-medium.html**: Alertas riesgo bajo/medio
- **questionnaire-editor.html**: Editor de cuestionarios
- **profile.html**: Perfil y privacidad
- **parent-reports.html**: Informes para padres
- **videos.html**: Videos guiados
- **active-breaks.html**: Pausas activas
- **mental-garden.html**: Jardín mental

#### Capa Controller (Lógica de Negocio):
- **app.js**: Controlador principal
- **evaluation.js**: Lógica de evaluaciones
- **chat.js**: Gestión de chat IA
- **exercises.js**: Control de ejercicios
- **games.js**: Sistema de gamificación
- **mental-garden.js**: Lógica jardín mental
- **alerts.js**: Alertas riesgo alto
- **alerts-low-medium.js**: Alertas riesgo bajo/medio
- **hub-client.js**: Cliente API

### 4. MÓDULOS A DOCUMENTAR CON CAPTURAS

#### HU-01: Registro y Autenticación
- web_registro.png: Pantalla de registro web
- web_login.png: Pantalla de login web
- web_consentimiento.png: Consentimiento parental web

#### HU-02: Dashboard Principal
- web_dashboard_estudiante.png: Dashboard estudiante
- web_dashboard_psicologo.png: Dashboard psicólogo

#### HU-03: Evaluación Psicológica
- web_cuestionarios.png: Lista de cuestionarios
- web_gad7.png: Cuestionario GAD-7 en progreso
- web_resultados.png: Resultados de evaluación
- web_historial.png: Historial de evaluaciones

#### HU-04: Chat con IA
- web_chat.png: Interfaz de chat
- web_chat_conversacion.png: Conversación con IA

#### HU-05: Ejercicios de Bienestar
- web_ejercicios.png: Catálogo de ejercicios
- web_respiracion.png: Ejercicio de respiración
- web_meditacion.png: Meditación guiada
- web_progreso.png: Progreso de ejercicios

#### HU-08: Gamificación y Juegos
- web_juegos.png: Pantalla principal juegos
- web_puzzle.png: Puzzle Zen
- web_arte.png: Arte Emocional
- web_ritmo.png: Ritmo Calma
- web_jardin.png: Jardín Mental
- web_logros.png: Logros desbloqueados
- web_puntos.png: Sistema de puntos

#### HU-07: Comunidad Estudiantil
- web_comunidad.png: Foros de comunidad
- web_post.png: Creación de post
- web_interaccion.png: Interacción en comunidad

#### HU-09: Informes para Padres
- web_informes.png: Generación de informes
- web_informe_previa.png: Vista previa informe

#### HU-10: Perfil y Privacidad
- web_perfil.png: Perfil de usuario
- web_privacidad.png: Configuración privacidad
- web_sesiones.png: Gestión de sesiones

#### HU-06: Editor de Cuestionarios
- web_editor.png: Editor de cuestionarios
- web_editor_previa.png: Vista previa cuestionario

#### Alertas
- web_alertas_panel.png: Panel alertas riesgo alto
- web_alertas_detalle.png: Detalle de alerta
- web_alertas_bajo_medio.png: Panel alertas riesgo bajo/medio

#### Misiones
- web_checkin.png: Check-in diario
- web_misiones.png: Misiones diarias

#### Videos
- web_videos.png: Catálogo de videos
- web_video_reproduccion.png: Reproducción de video

#### Pausas Activas
- web_pausas.png: Pantalla pausas activas
- web_pausa_config.png: Configuración recordatorios

## PROCEDIMIENTO PARA COMPLETAR EL DOCUMENTO

1. **Tomar capturas de pantalla** de cada módulo de la app web
2. **Nombrar las imágenes** según la lista anterior
3. **Colocar las imágenes** en la carpeta: `WellnessMentalApp(WEB)\web_images\`
4. **Ejecutar el script**: `python create_report_web.py`
5. **El documento** se generará automáticamente en formato Word

## FORMATO DE CADA SECCIÓN

Para cada módulo, el documento incluirá:

1. **Título del módulo** (Heading 2)
2. **"Criterios de Aceptación Implementados"** (Heading 3)
3. **Para cada criterio**:
   - **Título del criterio** (Heading 4)
   - **Descripción** con referencia a archivos implementados
   - **Indicador**: ✅ FUNCIONAL
   - **Evidencia Visual**: Captura de pantalla centrada

## NOTAS IMPORTANTES

- Las capturas deben mostrar **ambos dashboards** (estudiante y psicólogo)
- Incluir **diferentes estados** de cada módulo (vacío, con datos, en proceso)
- Asegurar que las **alertas** de riesgo bajo/medio sean visibles
- Mostrar el **jardín mental** con plantas plantadas
- Incluir **sistema de puntos** funcionando
- Mostrar **ejemplos reales** de cada funcionalidad

## ARCHIVO DE REFERENCIA

Usar como modelo: `C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp\INFORME_FINAL_INTEGRADO.docx`