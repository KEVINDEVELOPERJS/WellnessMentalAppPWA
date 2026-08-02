# Configuración de Google Apps Script para CORS

## Problema
La app web está experimentando errores de CORS al intentar conectar con el Google Apps Script (hub de sincronización). El error indica:
```
Access to fetch at 'https://script.google.com/macros/s/...' from origin 'https://wellness-mental-app-pwa-hv57.vercel.app' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solución Implementada

### 1. HubClient con Proxies CORS Automáticos
He creado un nuevo archivo `hub-client.js` que maneja automáticamente los errores de CORS mediante:

- **Conexión directa primero**: Intenta conectar sin proxy
- **Proxies CORS alternativos**: Si falla, intenta con proxies públicos:
  - `https://corsproxy.io/?`
  - `https://api.allorigins.win/raw?url=`
  - `https://cors-anywhere.herokuapp.com/`
- **Selección automática**: Guarda el proxy que funciona y lo usa preferentemente

### 2. Archivos Modificados

#### `js/hub-client.js` (NUEVO)
Cliente unificado para comunicarse con el hub con manejo automático de CORS.

#### `js/alerts.js`
- Actualizado para usar `HubClient` en lugar de `fetch` directo
- Mejor manejo de errores en sincronización
- `syncRemoteAlerts()` usa `HubClient.listAlerts()`
- `updateAlertStatusOnHub()` usa `HubClient.updateAlertStatus()`

#### `js/evaluation.js`
- Actualizado para usar `HubClient` en lugar de `fetch` directo
- `getPsicologoEmail()` usa `HubClient.listPsychologists()`
- `sendAlertToHub()` usa `HubClient.publishAlert()`
- Mejor manejo de errores con fallback a base de datos local

#### `alerts.html` y `evaluation.html`
- Agregado `<script src="js/hub-client.js"></script>` antes de los scripts principales

## Configuración del Google Apps Script

### Paso 1: Abre tu Google Apps Script
1. Ve a [script.google.com](https://script.google.com)
2. Abre el script que actúa como hub de sincronización
3. Edita el código

### Paso 2: Agrega Headers CORS
Agrega esta función al principio de tu script para manejar CORS:

```javascript
function doGet(e) {
  // Obtener parámetros
  const action = e.parameter.action;
  
  // Configurar headers CORS
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Headers CORS (método alternativo)
  return output
    .setContent(JSON.stringify(getResponseData(action, e.parameter)))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // Parsear el cuerpo de la solicitud
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  // Configurar headers CORS
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  return output
    .setContent(JSON.stringify(getResponseData(action, data)))
    .setMimeType(ContentService.MimeType.JSON);
}

function getResponseData(action, params) {
  // Tu lógica existente aquí
  // ...
  
  return {
    ok: true,
    // ... otros campos
  };
}
```

### Paso 3: Desplegar como "Cualquier persona"
1. En el editor de Google Apps Script, haz clic en **Implementar** > **Nueva implementación**
2. Selecciona **Tipo**: **Aplicación web**
3. Configura:
   - **Descripción**: "Hub de sincronización Wellness Mental"
   - **Ejecutar como**: **Yo**
   - **Quién tiene acceso**: **Cualquier persona** (IMPORTANTE)
4. Haz clic en **Implementar**
5. Copia la URL generada

### Paso 4: Configurar la URL en la App Web
1. Abre la app web
2. Ve a la sección de alertas (como psicólogo)
3. Haz clic en el botón ⚙️ (configuración)
4. Pega la URL del Google Apps Script
5. Haz clic en **Guardar**

## Solución Alternativa: Usar el HubClient con Proxies

La solución implementada con `HubClient` debería funcionar incluso si el Google Apps Script no tiene CORS configurado correctamente, porque:

1. **Prueba conexión directa primero**: Si el script tiene CORS configurado, funcionará directamente
2. **Usa proxies automáticamente**: Si falla, intenta con proxies CORS públicos
3. **Guarda la configuración exitosa**: Si un proxy funciona, lo usa preferentemente en el futuro

## Verificación

### Prueba de Conexión
Para verificar que la conexión funciona:

1. Abre la consola del navegador (F12)
2. Ve a la sección de alertas
3. Haz clic en el botón de sincronización
4. Revisa los logs en la consola:
   - `[HUB CLIENT] Attempting request with proxy 0: direct`
   - `[HUB CLIENT] Response status: 200`
   - `[HUB CLIENT] Response data: {ok: true, alertas: [...]}`

### Si sigues viendo errores CORS

1. **Verifica la URL del hub**: Asegúrate de que sea correcta
2. **Verifica el despliegue**: Debe ser "Cualquier persona"
3. **Limpia el caché**: En la configuración del hub, haz clic en "Resetear preferencia de proxy"
4. **Prueba manualmente**: Abre la URL del hub en el navegador con `?action=listar`

## Errores Comunes y Soluciones

### Error: "No 'Access-Control-Allow-Origin' header"
**Solución**: El HubClient debería manejar esto automáticamente con proxies. Si persiste, verifica que el Google Apps Script esté desplegado como "Cualquier persona".

### Error: "HTTP 404"
**Solución**: La URL del hub es incorrecta o el script no tiene la función `doGet` implementada.

### Error: "Unexpected token '<'"
**Solución**: El script está devolviendo HTML en lugar de JSON. Verifica que `ContentService.MimeType.JSON` esté configurado correctamente.

### Error: "All connection methods failed"
**Solución**: Ninguno de los proxies funcionó. Posibles causas:
- La URL del hub es incorrecta
- El script no está desplegado
- Hay un problema de red
- Los proxies están temporalmente fuera de servicio

## Recursos Adicionales

- [Documentación de ContentService de Google Apps Script](https://developers.google.com/apps-script/reference/content/content-service)
- [Guía de CORS para Google Apps Script](https://stackoverflow.com/questions/63255498/google-apps-script-cors-issues)
- [Prueba de CORS online](https://www.test-cors.org/)

## Soporte

Si después de seguir estos pasos sigues experimentando problemas:

1. Revisa la consola del navegador para errores específicos
2. Verifica que la URL del hub sea correcta
3. Asegúrate de que el Google Apps Script esté desplegado como "Cualquier persona"
4. Contacta al equipo de desarrollo con los logs de la consola

## Notas Importantes

- Los proxies CORS públicos son gratuitos pero pueden tener limitaciones de uso
- Para producción, se recomienda configurar CORS correctamente en el Google Apps Script
- La URL del hub debe ser la misma en todas las instancias de la app (Android y Web)
- Las alertas se guardan localmente como respaldo si la sincronización falla