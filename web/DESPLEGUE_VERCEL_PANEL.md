# 🚀 Despliegue desde Vercel Panel (Sin Git)

## Paso 1: Ir a Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Entra con tu cuenta (Google o GitHub)

## Paso 2: Ir a tu proyecto
1. Busca el proyecto: **wellness-mental-app-pwa-hv57**
2. Clic en el proyecto

## Paso 3: Redesplegar
1. Clic en la pestaña **"Deployments"**
2. Busca el despliegue más reciente
3. Clic en los tres puntos **"..."** → **"Redeploy"**
4. Clic en **"Redeploy Branch"**
5. Espera a que complete

## Paso 4: LIMPIAR CACHÉ (CRUCIAL)
Después del redeploy:
```
Chrome: Ctrl+Shift+Delete → Caché → "Todo el tiempo" → Limpiar datos
```

## Paso 5: Recargar
```
Ctrl+F5 (o Cmd+Shift+R en Mac)
```

## Paso 6: Verificar
Abre la consola (F12) y deberías ver:
```
[ALERTS] Initializing alerts module
[ALERTS] Hub URL loaded: Configured
[ALERTS] Hub URL configured automatically: https://script.google.com/macros/s/...
[HUB CLIENT] Attempting request with proxy 0: https://corsproxy.io/?...
```

## ✅ Cambios Realizados

### URL del Hub Configurada Automáticamente
- **hub-client.js**: La URL se configura automáticamente en localStorage
- **alerts.js**: La URL se configura automáticamente si no existe
- **Proxies CORS**: Usan corsproxy.io primero para evitar errores

### Archivos Modificados
1. `js/hub-client.js` - URL configurada automáticamente
2. `js/alerts.js` - URL configurada automáticamente
3. `js/evaluation.js` - Usa HubClient con proxies

## 🧪 Prueba Local

Si quieres probar antes de desplegar:
1. Abre `test_hub_connection.html` en tu navegador
2. Prueba los botones
3. Verifica que funcione con proxies

## 📱 Funcionalidades del Psicólogo (Igual que Android)

✅ Verificación de rol psicólogo
✅ Toolbar rojo oscuro
✅ Contador de alertas pendientes
✅ Sincronización con hub (con proxies CORS)
✅ Lista de alertas con indicadores
✅ Modal de detalle
✅ Marcar como atendida/pendiente
✅ Notas de intervención
✅ Actualización periódica (30s)
✅ Base de datos local como respaldo

## 🎯 Resultado Esperado

Después del redeploy y limpieza de caché:
- ✅ URL del hub configurada automáticamente
- ✅ Proxies CORS manejan la conexión
- ✅ Sin errores CORS
- ✅ Alertas del sincronizadas
- ✅ Apartado del psicólogo igual que Android

**Si después de esto sigues viendo "[ALERTS PANEL]" en la consola**, significa que Vercel no actualizó el código. En ese caso, necesitaré hacer cambios más agresivos.**
