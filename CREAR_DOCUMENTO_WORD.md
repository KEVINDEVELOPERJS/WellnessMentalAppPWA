# INSTRUCCIONES PARA CREAR EL DOCUMENTO WORD FINAL

## MÉTODO MANUAL RECOMENDADO

Dado que los scripts automatizados tienen problemas de ejecución, te recomiendo seguir este proceso manual que es más confiable:

### PASO 1: Extraer Imágenes del RTF

1. **Abre el archivo RTF** en Microsoft Word:
   - `C:\Users\Admin\Documents\FOTOS DE MODULOS APP WEB.rtf`

2. **Extrae cada imagen manualmente**:
   - Clic derecho en cada imagen → "Guardar como imagen"
   - Guarda en la carpeta: `WellnessMentalApp(WEB)\web_images\`
   - Nombra las imágenes secuencialmente según la lista abajo

### PASO 2: Usar Plantilla del Documento Android

1. **Abre el documento de referencia**:
   - `C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp\INFORME_FINAL_INTEGRADO.docx`

2. **Guarda como nueva plantilla**:
   - Archivo → Guardar como
   - Nombre: `INFORME_FINAL_INTEGRADO_WEB.docx`
   - Ubicación: `WellnessMentalApp(WEB)\`

### PASO 3: Modificar Contenido para App Web

Reemplaza el contenido siguiendo esta estructura:

#### PORTADA
- Cambia título a: "Informe Técnico: Funcionamiento Correcto de Wellness Mental App Web"
- Fecha: 4 de agosto de 2026
- Tipo: Informe de Validación de Criterios de Aceptación - Versión Web

#### RESUMEN EJECUTIVO
Reemplaza con:
"Este informe presenta una validación detallada del funcionamiento correcto de la aplicación web "Wellness Mental App Web", desarrollada con HTML5, CSS3, JavaScript y arquitectura PWA. La aplicación está diseñada para el bienestar mental de estudiantes adolescentes (13-18 años) e implementa múltiples módulos interconectados que cumplen con los criterios de aceptación definidos para cada historia de usuario. La versión web mantiene paridad funcional con la versión Android nativa."

#### ARQUITECTURA TÉCNICA
Reemplaza las secciones MVC con:

**Capa Model (Datos y Persistencia):**
- IndexedDB: Base de datos local del navegador
- LocalStorage: Gestión de sesión y preferencias
- API Hub: Cliente REST para sincronización

**Capa View (Interfaz de Usuario):**
- index.html: Login/registro
- evaluation.html: Evaluaciones psicológicas
- chat.html: Chat con IA
- exercises.html: Ejercicios de bienestar
- games.html: Gamificación y juegos
- community.html: Comunidad estudiantil
- alerts.html: Alertas riesgo alto
- alerts-low-medium.html: Alertas riesgo bajo/medio
- questionnaire-editor.html: Editor cuestionarios
- profile.html: Perfil y privacidad
- parent-reports.html: Informes padres
- videos.html: Videos guiados
- active-breaks.html: Pausas activas
- mental-garden.html: Jardín mental

**Capa Controller (Lógica de Negocio):**
- app.js: Controlador principal
- evaluation.js: Lógica evaluaciones
- chat.js: Gestión chat IA
- exercises.js: Control ejercicios
- games.js: Sistema gamificación
- mental-garden.js: Lógica jardín
- alerts.js: Alertas riesgo alto
- alerts-low-medium.js: Alertas riesgo bajo/medio
- hub-client.js: Cliente API

#### VALIDACIÓN POR CRITERIOS

Para cada módulo, reemplaza las imágenes y descripciones:

**HU-01: Registro y Autenticación**
- CA-01.1: [Imagen web_registro.png] - Registro web
- CA-01.4: [Imagen web_login.png] - Login web
- CA-01.3: [Imagen web_consentimiento.png] - Consentimiento web

**HU-02: Dashboard Principal**
- CA-02.1: [Imagen web_dashboard_estudiante.png] - Dashboard estudiante
- CA-02.1: [Imagen web_dashboard_psicologo.png] - Dashboard psicólogo

**HU-03: Evaluación Psicológica**
- CA-03.1: [Imagen web_cuestionarios.png] - Lista cuestionarios
- CA-03.1: [Imagen web_gad7.png] - GAD-7 en progreso
- CA-03.2: [Imagen web_resultados.png] - Resultados
- CA-03.3: [Imagen web_historial.png] - Historial

**HU-04: Chat con IA**
- CA-04.1: [Imagen web_chat.png] - Interfaz chat
- CA-04.2: [Imagen web_chat_conversacion.png] - Conversación

**HU-05: Ejercicios de Bienestar**
- CA-05.1: [Imagen web_ejercicios.png] - Catálogo
- CA-05.2: [Imagen web_respiracion.png] - Respiración
- CA-05.2: [Imagen web_meditacion.png] - Meditación
- CA-05.3: [Imagen web_progreso.png] - Progreso

**HU-08: Gamificación y Juegos**
- CA-08.1: [Imagen web_juegos.png] - Pantalla juegos
- CA-08.1: [Imagen web_puzzle.png] - Puzzle Zen
- CA-08.1: [Imagen web_arte.png] - Arte Emocional
- CA-08.1: [Imagen web_ritmo.png] - Ritmo Calma
- CA-08.1: [Imagen web_jardin.png] - Jardín Mental
- CA-08.4: [Imagen web_logros.png] - Logros
- CA-08.2-CA-08.3: [Imagen web_puntos.png] - Puntos

**HU-07: Comunidad Estudiantil**
- CA-07.1: [Imagen web_comunidad.png] - Foros
- CA-07.2: [Imagen web_post.png] - Crear post
- CA-07.2: [Imagen web_interaccion.png] - Interacción

**HU-09: Informes para Padres**
- CA-09.1: [Imagen web_informes.png] - Generar informe
- CA-09.1: [Imagen web_informe_previa.png] - Vista previa

**HU-10: Perfil y Privacidad**
- CA-10.1: [Imagen web_perfil.png] - Perfil
- CA-10.2: [Imagen web_privacidad.png] - Privacidad
- CA-10.3: [Imagen web_sesiones.png] - Sesiones

**HU-06: Editor de Cuestionarios**
- CA-06.1: [Imagen web_editor.png] - Editor
- CA-06.4: [Imagen web_editor_previa.png] - Vista previa

**Alertas**
- CA-Alerta.1: [Imagen web_alertas_panel.png] - Panel alto
- CA-Alerta.1: [Imagen web_alertas_detalle.png] - Detalle
- CA-Alerta.2: [Imagen web_alertas_bajo_medio.png] - Panel bajo/medio

**Misiones**
- CA-Mision.1: [Imagen web_checkin.png] - Check-in
- CA-Mision.2: [Imagen web_misiones.png] - Misiones

**Videos**
- CA-Video.1: [Imagen web_videos.png] - Catálogo
- CA-Video.2: [Imagen web_video_reproduccion.png] - Reproducción

**Pausas**
- CA-Pausa.1: [Imagen web_pausas.png] - Pausas
- CA-Pausa.2: [Imagen web_pausa_config.png] - Configuración

### LISTA COMPLETA DE IMÁGENES REQUERIDAS (37)

1. web_registro.png
2. web_login.png
3. web_consentimiento.png
4. web_dashboard_estudiante.png
5. web_dashboard_psicologo.png
6. web_cuestionarios.png
7. web_gad7.png
8. web_resultados.png
9. web_historial.png
10. web_chat.png
11. web_chat_conversacion.png
12. web_ejercicios.png
13. web_respiracion.png
14. web_meditacion.png
15. web_progreso.png
16. web_juegos.png
17. web_puzzle.png
18. web_arte.png
19. web_ritmo.png
20. web_jardin.png
21. web_logros.png
22. web_puntos.png
23. web_comunidad.png
24. web_post.png
25. web_interaccion.png
26. web_informes.png
27. web_informe_previa.png
28. web_perfil.png
29. web_privacidad.png
30. web_sesiones.png
31. web_editor.png
32. web_editor_previa.png
33. web_alertas_panel.png
34. web_alertas_detalle.png
35. web_alertas_bajo_medio.png
36. web_checkin.png
37. web_misiones.png
38. web_videos.png
39. web_video_reproduccion.png
40. web_pausas.png
41. web_pausa_config.png

## FORMATO FINAL

El documento debe tener:
- ✅ Misma estructura que el documento Android
- ✅ Mismos encabezados y formato
- ✅ Imágenes centradas de 3 pulgadas de alto
- ✅ Texto descriptivo en negrita antes de cada imagen
- ✅ Indicadores ✅ FUNCIONAL
- ✅ Referencias a archivos .js específicos de la app web

Este método manual garantiza que el documento se cree correctamente con todas las imágenes del RTF.