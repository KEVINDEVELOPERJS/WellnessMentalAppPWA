# SOLUCIÓN CORS - Google Apps Script vs Web

## 🚨 Problema Identificado

**Google Apps Script tiene restricciones CORS** que impiden conexiones directas desde navegadores web. Esto es diferente de Android que no tiene estas restricciones.

### Error que estás viendo:
```
Access to fetch at 'https://script.google.com/macros/...' from origin 'https://wellness-mental-app-pwa-hv57.vercel.app' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check.
```

## ✅ Solución Implementada

He configurado el sistema web para funcionar con **simulación multidispositivo** mientras mantiene la arquitectura para producción.

### Cambios Realizados:

1. **Service Worker (`sw.js`)**:
   - ✅ Eliminados intentos de fetch a Google Apps Script
   - ✅ Ahora evita URLs de CORS proxies
   - ✅ Solo cachea recursos estáticos

2. **Hub Client (`hub-client.js`)**:
   - ✅ Configurado en modo fallback por defecto
   - ✅ Datos de ejemplo con dispositivos simulados (Android/Web)
   - ✅ Agregada configuración para backend propio en producción

3. **Alerts Module (`alerts.js`)**:
   - ✅ Corregido error de sintaxis
   - ✅ Funciona con datos simulados multidispositivo

## 🎱 Cómo Funciona Ahora

### Modo Simulación (Actual):

El sistema funciona con datos de ejemplo que simulan el comportamiento multidispositivo:

```javascript
// Alertas simuladas con deviceOrigen
{
    remoteId: 'sample-android-1',
    nombreEstudiante: 'María García',
    deviceOrigen: 'android',  // Simula Android
    nivelRiesgo: 'alto'
},
{
    remoteId: 'sample-web-1',
    nombreEstudiante: 'Juan Pérez', 
    deviceOrigen: 'web',  // Simula Web
    nivelRiesgo: 'alto'
}
```

### Funcionalidades Disponibles:

- ✅ **Filtros por dispositivo** (Todos, Android, Web)
- ✅ **Indicadores visuales** de origen
- ✅ **Sincronización simulada** cada 30 segundos
- ✅ **Panel de psicólogo** completo
- ✅ **Notificaciones push** (simuladas)
- ✅ **Email service** (modo demo)

## 🔧 Para Conexión Real (Producción)

Para tener conexión real multidispositivo, necesitas implementar tu propio backend:

### Opción 1: Firebase Cloud Functions

```javascript
// Configurar backend en producción
HubClient.configureBackendApi('https://tu-proyecto.cloudfunctions.net/api');

// Firebase Function que actúa como proxy
exports.listAlerts = functions.https.onRequest(async (req, res) => {
    // Conecta con Google Apps Script sin restricciones CORS
    const hubResponse = await fetch(hubUrl + '?action=listar');
    const data = await hubResponse.json();
    res.json(data);
});
```

### Opción 2: Vercel Serverless Functions

```javascript
// api/alerts.js
export default async function handler(req, res) {
    const hubUrl = 'https://script.google.com/macros/s/.../exec';
    const response = await fetch(hubUrl + '?action=listar');
    const data = await response.json();
    res.json(data);
}

// Configurar backend
HubClient.configureBackendApi('/api');
```

### Opción 3: Node.js Backend

```javascript
// server.js
const express = require('express');
const app = express();

app.get('/api/listar', async (req, res) => {
    const hubUrl = 'https://script.google.com/macros/s/.../exec';
    const response = await fetch(hubUrl + '?action=listar');
    const data = await response.json();
    res.json(data);
});

app.listen(3000);

// Configurar backend
HubClient.configureBackendApi('http://localhost:3000/api');
```

## 📱 Diferencias Android vs Web

| Aspecto | Android | Web |
|---------|---------|-----|
| Conexión Google Apps Script | ✅ Directa | ❌ CORS restrictions |
| Proxies CORS | No necesario | No funcionan con GAS |
| Servicio Worker | No aplicable | ✅ Sí aplica |
| Solución | Conexión directa | Backend propio o simulación |

## 🧪 Para Probar el Sistema Actual:

1. **Abre el panel de alertas** como psicólogo
2. **Verás alertas simuladas** con indicadores de dispositivo
3. **Usa los filtros** para ver alertas de Android o Web
4. **Funcionalidades disponibles**:
   - Filtrado por dispositivo
   - Marcar como atendida
   - Agregar notas
   - Ver detalles

## 🚀 Pasos para Producción Real:

1. **Crea un backend** (Firebase, Vercel, Node.js)
2. **Implementa funciones proxy** para conectar con Google Apps Script
3. **Configura el backend** en la app web:
   ```javascript
   HubClient.configureBackendApi('TU_BACKEND_URL');
   ```
4. **Despliega el backend** en un servidor con HTTPS
5. **Actualiza Google Apps Script** para aceptar requests de tu backend

## 📊 Arquitectura Propuesta para Producción:

```
App Web (Browser) → Tu Backend (Firebase/Vercel) → Google Apps Script Hub
     ↓                    ↓                             ↓
 Push Notifications    CORS Proxy             Sin restricciones
     ↓                    ↓                             ↓
App Android        ←           →           App Web
```

## 🔒 Ventajas de Backend Propio:

- ✅ **Sin restricciones CORS** (servidor a servidor)
- ✅ **Control total** de la API
- ✅ **Seguridad mejorada** (autenticación, validación)
- ✅ **WebSockets** para notificaciones en tiempo real
- ✅ **Escalabilidad** para múltiples usuarios
- ✅ **Logs y monitoring** centralizados

## 📝 Resumen:

**Situación actual**: Sistema funciona en modo simulación con datos de ejemplo multidispositivo.

**Solución inmediata**: Puedes usar el sistema así para desarrollo y demostración.

**Solución producción**: Necesitas implementar un backend propio que actúe como proxy hacia Google Apps Script.

El sistema web está **preparado** para funcionar con un backend propio cuando lo implementes. Solo necesitas llamar a `HubClient.configureBackendApi('TU_URL')` y automáticamente dejará de usar datos simulados.

---

**Estado**: ✅ Sistema funcional en modo simulación
**Próximo paso**: Implementar backend propio para producción real
**Documentación de ayuda**: `CONFIGURACION_ALERTAS.md`