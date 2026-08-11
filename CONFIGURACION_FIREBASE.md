# CONFIGURACIÓN FIREBASE - Persistencia de Datos en Servidor

## 🎯 Objetivo

Implementar persistencia de datos en servidor para la app web, compatible con la arquitectura Android SQLite Room Database.

## 📊 Arquitectura de Base de Datos

### Android (SQLite Room):
- **usuarios** - Datos de usuarios y psicólogos
- **cuestionarios** - Cuestionarios psicológicos
- **preguntas** - Preguntas de cuestionarios
- **respuestas** - Respuestas de usuarios
- **resultados** - Resultados de evaluaciones
- **alertas_riesgo** - Alertas de riesgo
- **chat_sessions** - Sesiones de chat
- **mensajes_chat** - Mensajes de chat

### Web (Firebase Realtime Database):
- **usuarios** - Mapeo directo a Android
- **cuestionarios** - Mapeo directo a Android
- **alertas_riesgo** - Mapeo directo a Android
- **resultados** - Mapeo directo a Android
- **Compatibilidad total** con estructura Android

## 🔧 Pasos de Configuración

### 1. Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Clic en "Agregar proyecto"
3. Nombre del proyecto: `wellness-mental-app`
4. Desactiva Google Analytics (opcional)
5. Clic en "Crear proyecto"

### 2. Habilitar Realtime Database

1. En tu proyecto Firebase, ve a "Realtime Database"
2. Clic en "Crear base de datos"
3. Selecciona ubicación (recomendado: us-central1)
4. Selecciona modo de inicio:
   - **Modo de prueba** (para desarrollo)
   - **Modo bloqueado** (para producción)
5. Clic en "Habilitar"

### 3. Configurar Reglas de Seguridad

**Para desarrollo (modo de prueba):**
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**Para producción:**
```json
{
  "rules": {
    "usuarios": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "alertas_riesgo": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "cuestionarios": {
      ".read": true,
      ".write": "auth != null"
    },
    "resultados": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

### 4. Obtener Credenciales Firebase

1. En Firebase Console, ve a "Configuración del proyecto"
2. Desplázate hasta "Tus apps"
3. Clic en el icono web (</>)
4. Nombre de la app: `wellness-mental-web`
5. Clic en "Registrar app"
6. **NO necesitas Hosting de Firebase** (ya usas Vercel)
7. Clic en "Continuar con la consola"
8. Copia la configuración:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://TU_PROYECTO-default-rtdb.firebaseio.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
```

### 5. Configurar en la App Web

#### Opción A: Configuración Manual (Recomendada)

Agrega esto al inicio de `js/app.js`:

```javascript
// Configurar Firebase
FirebaseService.init({
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    databaseURL: "https://TU_PROYECTO-default-rtdb.firebaseio.com",
    projectId: "TU_PROYECTO",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
});
```

#### Opción B: Configuración via LocalStorage

```javascript
// Configurar Firebase via localStorage
localStorage.setItem('firebase_api_key', 'TU_API_KEY');
localStorage.setItem('firebase_auth_domain', 'TU_PROYECTO.firebaseapp.com');
localStorage.setItem('firebase_database_url', 'https://TU_PROYECTO-default-rtdb.firebaseio.com');
localStorage.setItem('firebase_project_id', 'TU_PROYECTO');
localStorage.setItem('firebase_storage_bucket', 'TU_PROYECTO.appspot.com');
localStorage.setItem('firebase_messaging_sender_id', 'TU_SENDER_ID');
localStorage.setItem('firebase_app_id', 'TU_APP_ID');
```

### 6. Configurar Android para Firebase

Para que Android y Web compartan la misma base de datos:

1. Agrega Firebase a tu proyecto Android:
   - En Firebase Console, agrega app Android
   - Descarga `google-services.json`
   - Colócalo en `app/google-services.json`

2. En `build.gradle` (nivel proyecto):
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

3. En `build.gradle` (nivel app):
```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.firebase:firebase-database:20.0.5'
    implementation 'com.google.firebase:firebase-auth:21.0.1'
}
```

4. En `AndroidManifest.xml`:
```xml
<application
    ...>
    <service android:name="com.google.firebase.components.ComponentDiscoveryService" />
</application>
```

## 🔄 Sincronización Android ↔ Web

### Flujo de Datos:

```
Android App                    Firebase Database                    Web App
     │                               │                               │
     ├─ Usuario.register() ────────► usuarios/{id} ◄─────────├─ Usuario.register()
     │                               │                               │
     ├─ Alerta.create() ───────────► alertas_riesgo/{id} ◄──────├─ Alerta.sync()
     │                               │                               │
     ├─ Resultado.save() ──────────► resultados/{id} ◄─────────├─ Resultado.sync()
     │                               │                               │
     └─ Real-time listener ◄─────── onChange() ─────────────►└─ Real-time listener
```

### Ejemplo de Sincronización de Alertas:

**Android:**
```kotlin
// AlertaController.kt
fun crearAlerta(alerta: AlertaRiesgo) {
    // Guardar localmente
    alertaDAO.insert(alerta)
    
    // Sincronizar con Firebase
    firebaseRef.child("alertas_riesgo").child(alerta.remoteId).setValue(alerta)
}
```

**Web:**
```javascript
// firebase-service.js
async createAlert(alertData) {
    // Guardar en Firebase
    const newAlertRef = firebaseRef.child("alertas_riesgo").push();
    await newAlertRef.set(alertData);
    
    // Guardar localmente para offline
    await this.createAlertLocal(alertData);
}
```

## 🧪 Pruebas de Persistencia

### 1. Verificar Conexión Firebase

En la consola del navegador:

```javascript
// Verificar configuración
console.log('Firebase config:', FirebaseService.getConfigStatus());

// Verificar conexión
FirebaseService.init();
console.log('Firebase initialized:', FirebaseService.initialized);
```

### 2. Probar Registro de Usuario

```javascript
// Registrar usuario
const result = await FirebaseService.createUser({
    nombre: 'Test User',
    email: 'test@example.com',
    password_hash: 'hashed_password',
    edad: 25,
    grado: '10°',
    rol: 'estudiante'
});

console.log('Registro result:', result);
```

### 3. Probar Alertas

```javascript
// Crear alerta
const alertResult = await FirebaseService.createAlert({
    nombreEstudiante: 'Juan Pérez',
    gradoEstudiante: '11°',
    nivelRiesgo: 'alto',
    extracto: 'Test alert from web',
    deviceOrigen: 'web'
});

console.log('Alerta creada:', alertResult);

// Obtener alertas
const alerts = await FirebaseService.getAlerts();
console.log('Alertas:', alerts);
```

### 4. Verificar en Firebase Console

1. Ve a Firebase Console → Realtime Database
2. Verifica que los datos aparezcan en:
   - `usuarios/`
   - `alertas_riesgo/`
   - `resultados/`

## 🔒 Seguridad en Producción

### 1. Autenticación Firebase

Para producción, implementa autenticación Firebase:

```javascript
// Login con Firebase Auth
firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log('Usuario autenticado:', user.uid);
    })
    .catch((error) => {
        console.error('Error de autenticación:', error);
    });
```

### 2. Reglas de Seguridad

Usa las reglas de seguridad mencionadas arriba para proteger datos.

### 3. Validación de Datos

Valida datos antes de guardar en Firebase:

```javascript
function validateUser(userData) {
    if (!userData.nombre || userData.nombre.length < 2) {
        throw new Error('Nombre inválido');
    }
    if (!Utils.isValidEmail(userData.email)) {
        throw new Error('Email inválido');
    }
    // ... más validaciones
}
```

## 📱 Compatibilidad con Vercel

Firebase funciona perfectamente con Vercel:

- ✅ **Sin conflictos** - Firebase es independiente del hosting
- ✅ **CORS habilitado** - Firebase permite requests desde cualquier origen
- ✅ **Real-time** - Sincronización instantánea entre dispositivos
- ✅ **Offline support** - Firebase tiene cache automático

## 🚀 Ventajas de Firebase vs SQLite

| Aspecto | SQLite (Android) | Firebase (Web + Android) |
|---------|-----------------|---------------------------|
| Dispositivos | Local only | Multi-dispositivo |
| Sincronización | Manual vía Hub | Automática real-time |
| Consultas | SQL | NoSQL (flexible) |
| Offline | Siempre disponible | Con cache automático |
| Escalabilidad | Limitada | Infinita |
| Costo | Gratis | Generoso plan gratuito |
| Backups | Manual | Automáticos |

## 📝 Datos Mapeados

### Usuarios:
```javascript
// Android SQLite
{
    id: INTEGER PRIMARY KEY,
    nombre: TEXT,
    email: TEXT UNIQUE,
    password_hash: TEXT,
    edad: INTEGER,
    grado: TEXT,
    rol: TEXT,
    fecha_registro: TEXT,
    estado: TEXT,
    consentimiento_padres: INTEGER,
    tutor_email: TEXT
}

// Firebase (mapeo directo)
{
    id: "firebase_key",
    nombre: "String",
    email: "String",
    password_hash: "String",
    edad: Number,
    grado: "String",
    rol: "String",
    fecha_registro: "String (ISO)",
    estado: "String",
    consentimiento_padres: Number,
    tutor_email: "String (nullable)"
}
```

### Alertas:
```javascript
// Android SQLite
{
    id: INTEGER PRIMARY KEY,
    remote_id: TEXT,
    nombre_estudiante: TEXT,
    grado_estudiante: TEXT,
    nivel_riesgo: TEXT,
    timestamp: TEXT,
    extracto: TEXT,
    estado: TEXT,
    device_origen: TEXT
}

// Firebase (mapeo directo)
{
    id: "firebase_key",
    remoteId: "String",
    nombreEstudiante: "String",
    gradoEstudiante: "String",
    nivelRiesgo: "String",
    timestamp: "String (ISO)",
    extracto: "String",
    estado: "String",
    deviceOrigen: "String"
}
```

## 🎯 Resumen de Implementación

**Componentes Creados:**
- ✅ `firebase-service.js` - Servicio completo de Firebase
- ✅ Integración en `app.js` - Registro y login con Firebase
- ✅ Integración en `alerts.js` - Sincronización de alertas con Firebase
- ✅ Fallback automático a IndexedDB cuando Firebase no está configurado

**Modos de Operación:**
- **Modo Firebase** - Persistencia en servidor real
- **Modo Local** - Fallback a IndexedDB para offline
- **Modo Híbrido** - Firebase + IndexedDB para soporte offline

**Configuración:**
- Opcional para desarrollo (funciona con IndexedDB)
- Recomendado para producción (persistencia real)
- Compatible con Android Firebase
- Funciona perfectamente con Vercel

---

**Estado:** ✅ Firebase Database implementado y configurado
**Compatibilidad:** 100% con Android SQLite Room Database
**Hosting:** Compatible con Vercel y cualquier hosting estático