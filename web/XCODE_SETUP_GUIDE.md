# Guía de Configuración de Xcode - Wellness Mental

Esta guía te ayudará a configurar el proyecto iOS en Xcode paso a paso.

## Archivos Ya Configurados ✅

Los siguientes archivos ya han sido configurados automáticamente:

### 1. Info.plist (`ios/App/App/Info.plist`)
- **Permisos de cámara**: Para fotos de perfil
- **Permisos de galería**: Para seleccionar fotos
- **Permisos de Face ID**: Para autenticación biométrica
- **Modos de background**: Para notificaciones push
- **Seguridad de transporte**: Configurado para HTTPS con excepción para localhost
- **Encriptación**: Marcado como sin encriptación no exenta

### 2. AppDelegate.swift (`ios/App/App/AppDelegate.swift`)
- **Solicitud de permisos de notificación**: Al iniciar la app
- **Registro de notificaciones push**: Token de dispositivo
- **Manejo de notificaciones**: Recepción y procesamiento
- **Deep links**: Soporte para URLs universales

## Pasos de Configuración en Xcode

### Paso 1: Abrir el Proyecto en Xcode

```bash
cd web
npx cap open ios
```

### Paso 2: Configurar el Target

1. **Selecciona el proyecto** en el navegador izquierdo (icono azul del proyecto)
2. **Selecciona el target "App"**
3. **General tab**:

#### Bundle Identifier
- Cambia a: `com.wellnessmental.app`
- Este debe ser único en Apple Developer

#### Version
- **Version**: `1.0`
- **Build**: `1`

#### Deployment Info
- **Deployment Target**: `14.0` (o superior)
- **Devices**: iPhone (o Universal si quieres iPad también)

#### App Icons and Launch Screen
- Los iconos se configuran en `Assets.xcassets/AppIcon.appiconset`
- Launch screen en `Assets.xcassets/LaunchScreen.imageset`

### Paso 3: Configurar Signing & Capabilities

1. Ve a la tab **Signing & Capabilities**
2. **Team**: Selecciona tu equipo de Apple Developer
   - Si no tienes cuenta de desarrollador, usa tu Apple ID personal
3. **Signing Certificate**: Deja en "Automatic"
4. **Provisioning Profile**: Deja en "Automatic"

#### Agregar Capabilities (opcional pero recomendado)

**Push Notifications**:
1. Click en "+ Capability"
2. Busca "Push Notifications"
3. Agrégalo

**Background Modes** (ya configurado en Info.plist):
1. Click en "+ Capability"
2. Busca "Background Modes"
3. Activa "Remote notifications"

### Paso 4: Configurar Build Settings

1. Ve a la tab **Build Settings**
2. Busca y configura:

#### Swift Compiler
- **Swift Language Version**: `Swift 5`
- **Optimization Level**: 
  - Debug: `None [-O0]`
  - Release: `Fastest, Smallest [-Os]`

#### Deployment
- **iOS Deployment Target**: `14.0`

#### Packaging
- **Product Bundle Identifier**: `com.wellnessmental.app`

### Paso 5: Configurar Scheme

1. **Product > Scheme > Edit Scheme...**
2. **Run**:
   - **Build Configuration**: Debug
   - **Executable**: App
3. **Archive**:
   - **Build Configuration**: Release
4. Click OK

### Paso 6: Agregar Iconos de la App

1. En Xcode, navega a `App/Assets.xcassets/AppIcon.appiconset`
2. Prepara iconos en estos tamaños:
   - **1024x1024** (App Store)
   - **180x180** (iPhone @3x)
   - **167x167** (iPad @2x)
   - **152x152** (iPad @2x)
   - **120x120** (iPhone @3x)
   - **87x87** (iPhone @2x)
   - **80x80** (iPhone @2x)
   - **76x76** (iPad @1x)
   - **60x60** (iPhone @2x)
   - **58x58** (iPhone @2x)
   - **40x40** (iPhone @2x)
   - **29x29** (iPhone @1x)

3. Arrastra los iconos a las casillas correspondientes

### Paso 7: Configurar Launch Screen

1. Navega a `App/Assets.xcassets/LaunchScreen.imageset`
2. Agrega una imagen de launch (1125x2436 para iPhone X)
3. O crea un storyboard personalizado en `Base.lproj/LaunchScreen.storyboard`

### Paso 8: Probar la App

#### En Simulador
1. Selecciona un simulador (iPhone 14, iPhone 15, etc.)
2. Presiona **Cmd+R** para correr
3. Verifica que la app cargue correctamente

#### En Dispositivo Físico
1. Conecta tu iPhone/iPad via USB
2. Selecciona tu dispositivo en el toolbar
3. Presiona **Cmd+R** para correr
4. Acepta el certificado de desarrollo en tu dispositivo

### Paso 9: Configurar Info.plist Adicional (si es necesario)

Si necesitas agregar más permisos, agrégalos en Info.plist:

```xml
<!-- Location -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Necesitamos tu ubicación para servicios personalizados</string>

<!-- Microphone -->
<key>NSMicrophoneUsageDescription</key>
<string>Se requiere acceso al micrófono para grabar notas de voz</string>

<!-- Contacts -->
<key>NSContactsUsageDescription</key>
<string>Se requiere acceso a contactos para invitar amigos</string>
```

### Paso 10: Configurar App Store Connect (para distribución)

1. Ve a [App Store Connect](https://appstoreconnect.apple.com)
2. **My Apps > + > New App**
3. Completa la información:
   - **Platform**: iOS
   - **Name**: Wellness Mental
   - **Bundle ID**: com.wellnessmental.app
   - **SKU**: WELLNESS-001 (o tu preferencia)
4. Crea la app

## Solución de Problemas Comunes

### Error: "Signing for 'App' requires a development team"
1. Ve a Signing & Capabilities
2. Selecciona tu Team en el dropdown
3. Si no aparece, agrega tu Apple ID en Xcode > Preferences > Accounts

### Error: "No matching provisioning profile found"
1. En Signing & Capabilities, cambia a "Automatically manage signing"
2. O crea manualmente un provisioning profile en Apple Developer

### Error: "Build failed with code 65"
1. Limpia el build folder: **Product > Clean Build Folder** (Cmd+Shift+K)
2. Borra derived data: **Xcode > Preferences > Locations > Derived Data > Arrow**
3. Intenta build nuevamente

### CocoaPods no se instalan correctamente
```bash
cd ios/App
pod install
cd ../..
npx cap sync ios
```

### La app no muestra notificaciones
1. Verifica que Push Notifications capability esté agregada
2. Verifica que el dispositivo tenga conexión a internet
3. Revisa la consola de Xcode para errores

## Checklist de Configuración

- [ ] Bundle Identifier configurado
- [ ] Team seleccionado
- [ ] Version y Build configurados
- [ ] Deployment Target configurado (14.0+)
- [ ] Signing configurado
- [ ] Push Notifications capability agregada
- [ ] Background Modes configurado
- [ ] Iconos de app agregados
- [ ] Launch screen configurado
- [ ] App funciona en simulador
- [ ] App funciona en dispositivo físico
- [ ] Notificaciones funcionan
- [ ] Permisos solicitados correctamente

## Próximos Pasos

Una vez configurado Xcode:

1. **Desarrollo**: Usa Cmd+R para correr y probar
2. **Testing**: Prueba en diferentes dispositivos y simuladores
3. **Archive**: Product > Archive para crear build de producción
4. **TestFlight**: Sube a TestFlight para beta testing
5. **App Store**: Submit para revisión y distribución

## Recursos Útiles

- [Xcode Documentation](https://developer.apple.com/documentation/xcode)
- [App Distribution Guide](https://help.apple.com/xcode/mac/current/#/dev048ed29f6)
- [Capacitor iOS Guide](https://capacitorjs.com/docs/ios)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

## Soporte

Si encuentras problemas:
1. Revisa la consola de Xcode para errores específicos
2. Limpia el build folder y reintenta
3. Verifica que todas las dependencias estén instaladas
4. Consulta la guía `IOS_SETUP_GUIDE.md` para más detalles
