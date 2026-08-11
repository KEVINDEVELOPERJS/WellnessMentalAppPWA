# CONFIGURACIÓN SISTEMA DE ALERTAS WEB - WELLNESS MENTAL

## 🚀 Estado Actual del Sistema

El sistema de alertas web está configurado para funcionar con el **HUB REAL** de Google Apps Script, idéntico a la implementación Android.

## ✅ Componentes Activados

1. **Hub Client** - Conexión real con Google Apps Script
2. **Push Notifications** - Notificaciones en tiempo real  
3. **Email Service** - Envío de correos automáticos
4. **Panel Multidispositivo** - Filtros por dispositivo de origen
5. **Service Worker** - Soporte offline y push notifications

## 🔧 Configuración del Hub

El sistema está configurado con la URL del Hub de Google Apps Script:

```javascript
// En js/hub-client.js
defaultHubUrl: 'https://script.google.com/macros/s/AKfycbxqK43sPmZlPgZhLmgeBYpkl1J_Anx-egwhYWcrZtTmkThYU6f9dfSknuEYSPysY4zJ/exec'
```

### Si necesitas cambiar la URL del Hub:

1. Abre `web/www/js/hub-client.js`
2. Cambia `defaultHubUrl` a tu URL de Google Apps Script
3. O configúrala en localStorage:
   ```javascript
   localStorage.setItem('alert_sync_url', 'TU_URL_AQUI');
   ```

## 📱 Flujo Multidispositivo

### Desde Android hacia Web:

1. **Estudiante en Android** completa evaluación/chat
2. **App Android** genera alerta y publica en Hub
3. **Hub** almacena alerta con `deviceOrigen: "android"`
4. **App Web** sincroniza con Hub cada 30 segundos
5. **Sistema detecta** alerta nueva de dispositivo Android
6. **Muestra notificación push** en el navegador web
7. **Envía email** al psicólogo (si riesgo alto)
8. **Panel muestra** indicador "📱 Android"

### Desde Web hacia Android:

1. **Estudiante en Web** completa evaluación/chat
2. **App Web** genera alerta y publica en Hub
3. **Hub** almacena alerta con `deviceOrigen: "web"`
4. **App Android** sincroniza con Hub
5. **Sistema Android** detecta alerta nueva de dispositivo Web
6. **Muestra notificación push** en Android
7. **Envía email** al psicólogo (si riesgo alto)

## 🧪 Pruebas del Sistema

### 1. Probar conexión con Hub:

Abre la consola del navegador en el panel de alertas y ejecuta:

```javascript
HubClient.testConnection().then(result => console.log(result));
```

### 2. Probar sincronización manual:

```javascript
AlertsModule.syncAndLoad(true);
```

### 3. Probar notificación push:

```javascript
PushNotifications.testNotification();
```

### 4. Probar email (modo demo):

```javascript
EmailService.testConfiguration('test@email.com');
```

## 🔍 Diagnóstico de Problemas

### Si las alertas no aparecen:

1. **Verificar conexión Hub:**
   ```javascript
   console.log('Hub disponible:', HubClient.syncHubDisponible());
   console.log('Hub URL:', HubClient.getHubUrl());
   ```

2. **Verificar modo fallback:**
   ```javascript
   console.log('Modo fallback:', HubClient.useLocalFallback);
   ```

3. **Forzar modo real:**
   ```javascript
   HubClient.resetToRealHub();
   AlertsModule.syncAndLoad(true);
   ```

### Si las notificaciones no funcionan:

1. **Verificar permisos:**
   ```javascript
   console.log('Permiso:', Notification.permission);
   ```

2. **Solicitar permiso:**
   ```javascript
   PushNotifications.requestPermission();
   ```

3. **Verificar Service Worker:**
   ```javascript
   navigator.serviceWorker.getRegistration().then(reg => console.log('SW:', reg));
   ```

### Si los emails no se envían:

1. **Verificar configuración:**
   ```javascript
   console.log('Email config:', EmailService.getConfigStatus());
   ```

2. **Verificar logs de emails:**
   ```javascript
   console.log('Email logs:', EmailService.getEmailLogs());
   ```

## 📊 Logs del Sistema

### Ver logs de procesamiento de alertas:

```javascript
JSON.parse(localStorage.getItem('alert_processing_logs'));
```

### Ver logs de emails enviados:

```javascript
EmailService.getEmailLogs();
```

### Ver suscripciones push:

```javascript
JSON.parse(localStorage.getItem('push_subscription'));
```

## 🎯 Funcionalidades Disponibles

### En el Panel de Alertas:

- ✅ **Filtros por dispositivo**: Todos, Android, Web
- ✅ **Indicadores visuales**: Iconos y colores por dispositivo
- ✅ **Sincronización automática**: Cada 30 segundos
- ✅ **Notificaciones push**: Para alertas de otros dispositivos
- ✅ **Envío de emails**: Automático para riesgo alto
- ✅ **Gestión de estados**: Pendiente/Atendida

### En el Sistema de Notificaciones:

- ✅ **Push notifications** en tiempo real
- ✅ **Acciones personalizadas**: Ver alerta, Descartar
- ✅ **Priorización**: Urgencia según nivel de riesgo
- ✅ **Service Worker**: Soporte offline

### En el Sistema de Emails:

- ✅ **Plantillas HTML** profesionales
- ✅ **Alerta prioritaria** para psicólogos
- ✅ **Copia a tutores** cuando corresponde
- ✅ **Audit trail** de correos enviados

## 🔒 Seguridad y Privacidad

- ✅ **Cifrado** de datos en tránsito
- ✅ **Permisos** requeridos para notificaciones
- ✅ **Consentimiento** parental para menores
- ✅ **Logs locales** solo en el dispositivo

## 📝 Modo Demo vs Producción

### Modo Demo (Actual):
- ✅ Funciona sin configuración externa
- ✅ Usa datos de ejemplo del Hub
- ✅ Emails simulados en localStorage
- ✅ Ideal para desarrollo y pruebas

### Modo Producción:
- Requiere configurar URL real del Hub
- Requiere configurar servicio de email
- Requiere HTTPS para Service Workers
- Requiere VAPID keys para push notifications

## 🚀 Para activar modo producción:

1. **Configurar Hub URL:**
   ```javascript
   localStorage.setItem('alert_sync_url', 'TU_URL_REAL_DE_HUB');
   ```

2. **Configurar Email Service:**
   ```javascript
   EmailService.configure({
       smtpServer: 'smtp.gmail.com',
       smtpUser: 'tu_email@gmail.com',
       smtpPassword: 'tu_app_password',
       fromEmail: 'wellnessmental@escuela.edu'
   });
   ```

3. **Forzar modo real:**
   ```javascript
   HubClient.resetToRealHub();
   ```

## 📱 Compatibilidad

- ✅ **Chrome**: Soporte completo
- ✅ **Firefox**: Soporte completo
- ✅ **Safari**: Soporte completo
- ✅ **Edge**: Soporte completo
- ⚠️ **Internet Explorer**: No soportado

## 🎯 Próximos Pasos

1. Verificar que el Hub de Google Apps Script esté funcionando
2. Probar la sincronización entre dispositivos Android y Web
3. Configurar el servicio de email si necesitas correos reales
4. Desplegar en servidor con HTTPS para producción

---

**Estado**: ✅ Sistema configurado para funcionamiento real con Hub
**Versión**: 2.0 (Conexión Hub Real activada)
**Fecha**: 2026-08-11