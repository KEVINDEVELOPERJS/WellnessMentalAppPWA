# Guía de Despliegue en Vercel - Wellness Mental PWA

Guía paso a paso para desplegar la app Wellness Mental en Vercel (gratis) y probarla en iPhone.

## Requisitos Previos

- Cuenta de GitHub (gratis)
- Repositorio GitHub con el código de Wellness Mental
- Cuenta de Vercel (gratis)

## Paso 1: Preparar el Repositorio en GitHub

### 1.1 Subir el código a GitHub

Si aún no tienes el código en GitHub:

```bash
# En la carpeta raíz del proyecto (no en web/)
git init
git add .
git commit -m "Initial commit - Wellness Mental PWA"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/WellnessMentalApp.git
git branch -M main
git push -u origin main
```

### 1.2 Verificar estructura del repositorio

Tu repositorio debe tener esta estructura:
```
WellnessMentalApp/
├── web/
│   ├── www/
│   │   ├── index.html
│   │   ├── evaluation.html
│   │   ├── chat.html
│   │   ├── exercises.html
│   │   ├── css/
│   │   ├── js/
│   │   └── manifest.json
│   ├── package.json
│   └── capacitor.config.json
├── app/ (código Android)
└── otros archivos...
```

## Paso 2: Crear Cuenta en Vercel

### 2.1 Registrarse en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Click en **"Sign Up"**
3. **Continuar con GitHub** (recomendado)
4. Autoriza Vercel para acceder a tus repositorios
5. Completa tu perfil

## Paso 3: Importar Proyecto en Vercel

### 3.1 Crear nuevo proyecto

1. En el dashboard de Vercel, click en **"Add New..."**
2. Selecciona **"Project"**

### 3.2 Importar desde GitHub

1. Verás la lista de tus repositorios GitHub
2. Busca y selecciona **"WellnessMentalApp"**
3. Click en **"Import"**

### 3.3 Configurar el proyecto

#### Configuración del Framework

Vercel detectará automáticamente que es un proyecto estático. Configura:

```
Framework Preset: Other
Root Directory: web
Build Command: (dejar vacío)
Output Directory: www
```

#### Configuración Avanzada (opcional)

Si necesitas configurar algo más:

**Environment Variables** (no necesario para esta PWA):
- Puedes agregar variables de entorno si usas API keys

**Build Settings**:
```
Install Command: cd web && npm install
Build Command: (vacío - no hay build process)
Output Directory: www
```

### 3.4 Deploy

1. Click en **"Deploy"**
2. Espera unos segundos mientras Vercel compila
3. Verás un check verde cuando termine
4. Obtendrás una URL como: `https://wellness-mental-app.vercel.app`

## Paso 4: Verificar el Despliegue

### 4.1 Abrir la URL

1. Click en la URL generada (ej: `wellness-mental-app.vercel.app`)
2. Verifica que la app cargue correctamente
3. Prueba:
   - Registro de usuario
   - Login
   - Navegación entre pantallas
   - Evaluaciones
   - Chat
   - Ejercicios

### 4.2 Verificar PWA

1. Abre las **DevTools** del navegador (F12)
2. Ve a la tab **Application**
3. Verifica:
   - **Manifest**: Debe cargar `manifest.json`
   - **Service Worker**: Debe estar registrado
   - **Storage**: IndexedDB debe funcionar

## Paso 5: Probar en iPhone

### 5.1 Acceder desde Safari en iPhone

1. **Abre Safari** en tu iPhone
2. **Navega a la URL**: `https://wellness-mental-app.vercel.app`
3. **Verifica** que la app cargue correctamente

### 5.2 Instalar como PWA en iPhone

1. **Tap en el botón Share** (icono de cuadrado con flecha hacia arriba)
2. **Scroll hacia abajo** y selecciona **"Add to Home Screen"** (Agregar a pantalla de inicio)
3. **Verifica el nombre**: "Wellness Mental"
4. **Tap en "Add"** (Agregar)
5. La app aparecerá en tu pantalla de inicio como app nativa

### 5.3 Probar la App Instalada

1. **Tap en el icono** de Wellness Mental en tu pantalla de inicio
2. La app abrirá **sin la barra de Safari** (como app nativa)
3. Prueba todas las funcionalidades:
   - Registro/Login
   - Dashboard
   - Evaluaciones
   - Chat IA
   - Ejercicios de respiración

### 5.4 Verificar Funcionamiento Offline

1. **Abre la app** (instalada en pantalla de inicio)
2. **Activa modo avión** en tu iPhone
3. **Navega** entre las pantallas
4. Verifica que funcione (gracias al Service Worker)

## Paso 6: Configurar Dominio Personalizado (Opcional)

### 6.1 Agregar dominio en Vercel

1. Ve a tu proyecto en Vercel
2. Click en **Settings**
3. Click en **Domains**
4. Click en **"Add"**
5. Ingresa tu dominio (ej: `wellnessmental.com`)

### 6.2 Configurar DNS

1. Vercel te dará instrucciones DNS
2. Ve a tu proveedor de dominios (GoDaddy, Namecheap, etc.)
3. Agrega los registros DNS indicados

### 6.3 Verificar

1. Espera la propagación DNS (puede tomar minutos a horas)
2. Verifica que el dominio funcione
3. Instala la PWA usando el nuevo dominio

## Paso 7: Configurar Actualizaciones Automáticas

### 7.1 Activar GitHub Integration

Vercel ya está conectado a GitHub. Cada vez que hagas push:

```bash
git add .
git commit -m "Nueva funcionalidad"
git push
```

Vercel detectará el cambio y hará deploy automáticamente.

### 7.2 Preview Deployments

Vercel crea URLs de preview para cada commit:
- Pull requests: URLs de preview
- Branches: Deployments separados

## Paso 8: Monitoreo y Analytics

### 8.1 Ver Analytics en Vercel

1. Ve a tu proyecto en Vercel
2. Click en **Analytics**
3. Verás:
   - Visitas
   - Page views
   - Países
   - Dispositivos
   - Browsers

### 8.2 Ver Logs

1. Click en **Deployments**
2. Click en un deployment específico
3. Click en **View Function Logs**
4. Ver errores y warnings

## Solución de Problemas

### Problema: La app no carga en iPhone

**Solución**:
1. Verifica que la URL sea HTTPS (Vercel lo hace automático)
2. Limpia el cache de Safari en iPhone
3. Desinstala y reinstala la PWA
4. Verifica que el Service Worker esté registrado

### Problema: IndexedDB no funciona

**Solución**:
1. Verifica que estés usando HTTPS
2. Limpia datos del sitio en Safari
3. Verifica que no haya errores en la consola

### Problema: La PWA no se instala

**Solución**:
1. Verifica que `manifest.json` sea accesible
2. Verifica que el Service Worker esté registrado
3. Asegúrate de usar Safari (no Chrome en iOS)
4. Verifica que la app cumpla criterios de PWA

### Problema: Deploy falla en Vercel

**Solución**:
1. Verifica la estructura de carpetas
2. Asegúrate que `web/www` existe
3. Revisa los logs de Vercel
4. Verifica que `package.json` esté en `web/`

### Problema: Iconos no aparecen

**Solución**:
1. Verifica que los iconos estén en `www/icons/`
2. Verifica las rutas en `manifest.json`
3. Los iconos deben ser PNG con tamaños correctos

## Checklist de Despliegue

- [ ] Código subido a GitHub
- [ ] Cuenta de Vercel creada
- [ ] Proyecto importado en Vercel
- [ ] Root directory configurado: `web`
- [ ] Output directory configurado: `www`
- [ ] Deploy exitoso
- [ ] URL funciona en navegador
- [ ] PWA funciona en navegador
- [ ] App probada en iPhone Safari
- [ ] App instalada en pantalla de inicio
- [ ] Funcionalidades probadas (auth, eval, chat, ejercicios)
- [ ] Modo offline probado
- [ ] Dominio personalizado (opcional)

## URLs Importantes

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Tu App**: `https://wellness-mental-app.vercel.app` (o tu URL)
- **GitHub Repo**: https://github.com/TU_USUARIO/WellnessMentalApp

## Próximos Pasos

Una vez desplegado:

1. **Compartir la URL** con usuarios para testing
2. **Recibir feedback** de usuarios reales
3. **Iterar** basado en feedback
4. **Actualizar** con `git push` (deploy automático)
5. **Considerar** App Store nativo vía Capacitor (opcional)

## Soporte

Si encuentras problemas:
1. Revisa los logs de Vercel
2. Verifica la consola del navegador
3. Consulta la documentación de Vercel
4. Revisa esta guía para solución de problemas

## Costos

- **Vercel**: 100% gratis para este proyecto
- **GitHub**: 100% gratis
- **Dominio personalizado**: ~$10-15/año (opcional)
- **Total**: $0 (sin dominio personalizado)
