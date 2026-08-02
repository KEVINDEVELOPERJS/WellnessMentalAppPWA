# 🚨 INSTRUCCIONES URGENTES DE DESPLIEGUE

## Problema Identificado

Los logs muestran "[ALERTS PANEL]" lo que indica que **el código viejo todavía está activo en Vercel**. Los cambios que hice localmente NO se han desplegado al servidor.

**El código nuevo usa `HubClient` con proxies CORS, pero el servidor todavía tiene el código viejo que no lo usa.**

## 🔧 Solución: Desplegar los Cambios

### Paso 1: Verificar cambios locales
```bash
cd "C:\Users\Admin\Documents\INGENIERIA DE SOFTWARE\IV SEMESTRE\ARCHIVOS (.pptx .docx .pdf .xlsx)\APPS WELLNESS MENTAL\WellnessMentalApp(WEB)\web"
git status
```

### Paso 2: Agregar y commitear cambios
```bash
git add .
git commit -m "Fix CORS - use proxies for hub connection - restore psychologist alerts"
```

### Paso 3: Push a Vercel
```bash
git push
```

### Paso 4: Verificar despliegue en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Entra a tu cuenta
3. Busca el proyecto "wellness-mental-app-pwa-hv57"
4. Verifica que el último despliegue sea reciente
5. Si no, haz clic en "Redeploy"

### Paso 5: LIMPIAR CACHÉ DEL NAVEGADOR (CRUCIAL)
```
Chrome: Ctrl+Shift+Delete → Caché → "Todo el tiempo" → Limpiar datos
Firefox: Ctrl+Shift+Delete → Caché → Limpiar
Edge: Ctrl+Shift+Delete → Caché → Limpiar
```

### Paso 6: Recargar la página
```
Ctrl+F5 (o Cmd+Shift+R en Mac)
```

### Paso 7: Verificar en consola
Abre la consola (F12) y deberías ver:
```
[ALERTS] Initializing alerts module
[ALERTS] Hub URL loaded: Configured
[HUB CLIENT] Attempting request with proxy 0: https://corsproxy.io/?...
```

**NO deberías ver "[ALERTS PANEL]"** - eso indica código viejo.

## 📋 Cambios que Deben Estar Activos

### Archivo: `js/hub-client.js`
- ✅ Nueva URL del hub
- ✅ Proxies CORS prioritarios (corsproxy.io primero)
- ✅ Manejo automático de CORS

### Archivo: `js/alerts.js`
- ✅ Usa `HubClient` para sincronización
- ✅ Logs: `[ALERTS]` (NO `[ALERTS PANEL]`)
- ✅ Base de datos local como respaldo

### Archivo: `js/evaluation.js`
- ✅ Usa `HubClient` para enviar alertas
- ✅ Fallback a base de datos local

## ⚠️ Si Después del Despliegue Sigues Viendo Errores

### Opción 1: Verificar que los archivos estén actualizados
Abre los archivos en el repositorio local y verifica que tengan el código nuevo.

### Opción 2: Despliegue manual desde Vercel
1. Ve a vercel.com
2. Entra a tu proyecto
3. Clic en "Settings" → "Git"
4. Verifica que el repositorio esté conectado
5. Clic en "Redeploy" → "Redeploy Branch"

### Opción 3: Usar la app solo con base de datos local
Si el hub sigue fallando, la app funciona perfectamente solo con IndexedDB local:
- Las alertas se guardan localmente
- Los psicólogos pueden verlas
- Todo funciona offline

## 🎯 Verificación de Éxito

Después del despliegue y limpieza de caché, deberías ver:

1. **Logs nuevos en consola**: `[ALERTS]` y `[HUB CLIENT]`
2. **NO logs viejos**: Sin `[ALERTS PANEL]`
3. **Sincronización funcionando**: Alertas del hub aparecen
4. **Sin errores CORS**: Los proxies manejan la conexión

## 📞 Si Sigue Fallando

Si después de desplegar y limpiar caché sigues viendo "[ALERTS PANEL]":

1. Comparte el contenido actual de `js/alerts.js` local
2. Verifica en Vercel qué archivos están desplegados
3. Contacta soporte de Vercel si hay problemas de caché

## 🔄 Resumen

**Estado actual**: Código viejo en servidor, código nuevo local
**Solución**: Desplegar cambios con git push
**Verificación**: Buscar `[ALERTS]` en consola (NO `[ALERTS PANEL]`)

¡Despliega los cambios ahora y limpia el caché!
