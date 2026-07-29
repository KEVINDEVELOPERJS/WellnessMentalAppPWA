# Guía de Diagnóstico - Sistema de Alertas Web

## Problema Reportado
Las evaluaciones de estudiantes no aparecen en el panel de alertas del psicólogo, ni se envían notificaciones al dispositivo ni correos al Gmail del psicólogo.

## Pasos para Diagnosticar

### 1. Verificar que la alerta se envió al hub

**Como estudiante:**
1. Completa una evaluación con riesgo alto (GAD-7 > 14 o PHQ-9 > 19)
2. Abre la consola del navegador (F12)
3. Busca los logs que comienzan con `[EVALUATION]`
4. Deberías ver:
   - `[EVALUATION] Starting alert sending process`
   - `[EVALUATION] Risk level: Alto` o `Moderado`
   - `[EVALUATION] Alert sent to hub successfully`
   - `[EVALUATION] Remote ID: web_eval_...`

Si NO ves estos logs, el problema está en el envío desde la web.

### 2. Verificar que el hub recibió y guardó la alerta

**Como psicólogo:**
1. Abre `alerts.html`
2. Haz clic en el botón 🧪 (probar conexión) en la cabecera
3. Revisa el mensaje que aparece:
   - Si dice "Alertas en hub: 0" → El hub no está recibiendo alertas
   - Si muestra alertas pero no la tuya → Hub está recibiendo pero hay un problema de sincronización
   - Si muestra tu alerta → El problema está en el panel web

### 3. Verificar la hoja de cálculo de Google Sheets

1. Abre tu hoja de cálculo de Google Sheets conectada al Apps Script
2. Ve a la hoja "AlertasRiesgo"
3. Verifica si hay filas con tus alertas
4. Revisa las columnas:
   - `remoteId` - ID único de la alerta
   - `emailEstudiante` - Email del estudiante
   - `nombreEstudiante` - Nombre del estudiante
   - `nivelRiesgo` - Debe ser "alto" para enviar correo
   - `emailPsicologo` - Email del psicólogo para notificaciones

### 4. Verificar configuración del Google Apps Script

1. Abre el editor de Apps Script (Extensiones > Apps Script)
2. Verifica que el script esté desplegado como "Aplicación web"
3. **IMPORTANTE**: "Quién tiene acceso" debe ser "Cualquier persona"
4. Ejecuta la función `inicializarHoja` si la hoja está vacía
5. Revisa los logs de ejecución (Ejecuciones) para ver errores

### 5. Verificar envío de correos desde el hub

El envío de correos se hace en el hub (líneas 191-195 de `alertas-sync-google-appscript.gs`):

```javascript
if (nivelRiesgo === 'alto' && alerta.emailPsicologo) {
    enviarCorreoAlerta(alerta);
}
```

**Requisitos para que se envíe el correo:**
- `nivelRiesgo` debe ser exactamente "alto" (minúsculas)
- `emailPsicologo` debe estar presente y ser válido
- El Google Apps Script debe tener permisos para enviar correos

**Para verificar:**
1. En la hoja de cálculo, verifica que `nivelRiesgo` sea "alto" (no "Alto")
2. Verifica que `emailPsicologo` tenga un email válido
3. Revisa los logs de MailApp en el Apps Script

### 6. Verificar que el panel web usa la misma URL del hub

1. En `alerts.html`, haz clic en ⚙️ (configuración)
2. Verifica que la URL sea la MISMA que en `evaluation.js`
3. La URL debe terminar en `/exec` (no `/dev`)

### 7. Verificar notificaciones del navegador

**Como psicólogo:**
1. Abre `alerts.html`
2. Acepta el permiso de notificaciones cuando se solicite
3. Mantén la pestaña abierta
4. El panel hace polling cada 30 segundos
5. Si hay nuevas alertas, debería aparecer una notificación del navegador

## Soluciones Comunes

### Problema: Alertas no llegan al hub
**Causa:** URL del hub incorrecta o hub no accesible públicamente
**Solución:**
1. Verifica que el Apps Script esté desplegado como "Cualquier persona"
2. Usa el botón 🧪 para probar la conexión
3. Verifica que no haya bloqueo CORS

### Problema: Alertas llegan al hub pero no al panel web
**Causa:** Panel web usando URL diferente o localStorage con datos antiguos
**Solución:**
1. Limpia localStorage: `localStorage.clear()`
2. Recarga la página
3. Verifica que la URL del hub sea correcta con ⚙️

### Problema: Correo no se envía
**Causa:** `nivelRiesgo` no es "alto" o `emailPsicologo` está vacío
**Solución:**
1. Verifica en la hoja de cálculo que `nivelRiesgo` sea "alto" (minúsculas)
2. Verifica que `emailPsicologo` tenga un email válido
3. Revisa que el psicólogo esté registrado en el hub

### Problema: Notificaciones del navegador no aparecen
**Causa:** Permiso denegado o pestaña en segundo plano
**Solución:**
1. Acepta el permiso de notificaciones
2. Mantén la pestaña abierta
3. Verifica que el navegador permita notificaciones para este sitio

## Logs Importantes

### En evaluation.js (estudiante)
- `[EVALUATION] Starting alert sending process`
- `[EVALUATION] Risk level: Alto/Moderado`
- `[EVALUATION] Psychologist email: ...`
- `[EVALUATION] Sending alert to hub: ...`
- `[EVALUATION] Hub response: ...`
- `[EVALUATION] Alert sent to hub successfully`

### En alerts.js (psicólogo)
- `[ALERTS PANEL] Fetching alerts from hub`
- `[ALERTS PANEL] Hub URL: ...`
- `[ALERTS PANEL] Response status: ...`
- `[ALERTS PANEL] Hub response ok: ...`
- `[ALERTS PANEL] Hub alertas count: ...`

## Contacto

Si después de seguir estos pasos el problema persiste:
1. Exporta los logs de la consola del navegador
2. Toma captura de la hoja de cálculo de Google Sheets
3. Toma captura de la configuración del Apps Script
4. Proporciona esta información para diagnóstico adicional
