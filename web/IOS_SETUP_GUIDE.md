# iOS Setup Guide - Wellness Mental PWA

Complete guide to build and deploy the Wellness Mental PWA as an iOS app using Capacitor.

## Prerequisites

### Required Software
- **macOS** (required for iOS development)
- **Xcode** 15.0 or later (from Mac App Store)
- **Node.js** 18+ (from nodejs.org)
- **npm** or **yarn**
- **CocoaPods** (for iOS dependencies)
- **iOS Simulator** (included with Xcode) or physical iOS device

### Optional but Recommended
- **Apple Developer Account** ($99/year) for App Store distribution
- **TestFlight** for beta testing
- **Fastlane** for automated builds

## Initial Setup

### 1. Install Dependencies

```bash
# Navigate to web directory
cd web

# Install npm dependencies
npm install

# Install CocoaPods (if not already installed)
sudo gem install cocoapods
```

### 2. Initialize Capacitor

```bash
# Initialize Capacitor (if not already done)
npx cap init "Wellness Mental" "com.wellnessmental.app" --web-dir=www
```

### 3. Add iOS Platform

```bash
# Add iOS platform to Capacitor
npx cap add ios
```

### 4. Sync Capacitor

```bash
# Sync web assets to native project
npx cap sync ios
```

## iOS Project Configuration

### 1. Open in Xcode

```bash
# Open iOS project in Xcode
npx cap open ios
```

### 2. Configure App Settings in Xcode

#### Bundle Identifier
- Select your project in the navigator
- Choose your target
- Set **Bundle Identifier** to: `com.wellnessmental.app`

#### Version Information
- **Version**: 1.0
- **Build**: 1

#### Deployment Target
- **iOS Deployment Target**: 14.0 or higher

#### Signing & Capabilities
- Select your target
- Go to **Signing & Capabilities** tab
- **Team**: Select your Apple Developer team
- **Signing Certificate**: Automatic (or manual if preferred)

### 3. Configure Info.plist

Add these keys to `Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Se requiere acceso a la cámara para tomar fotos de perfil</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Se requiere acceso a la galería para seleccionar fotos</string>

<key>NSFaceIDUsageDescription</key>
<string>Usa Face ID para autenticación segura</string>

<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>

<key>ITSAppUsesNonExemptEncryption</key>
<false/>
```

### 4. Configure App Icons

1. Prepare app icons in required sizes:
   - 1024x1024 (App Store)
   - 180x180 (iPhone @3x)
   - 167x167 (iPad @2x)
   - 152x152 (iPad @2x)
   - 120x120 (iPhone @3x)
   - 87x87 (iPhone @2x)
   - 80x80 (iPhone @2x)
   - 76x76 (iPad @1x)
   - 60x60 (iPhone @2x)
   - 58x58 (iPhone @2x)
   - 40x40 (iPhone @2x)
   - 29x29 (iPhone @1x)

2. In Xcode:
   - Navigate to `App/Assets.xcassets/AppIcon.appiconset`
   - Drag and drop icons to corresponding slots

### 5. Configure Launch Screen

1. In Xcode, navigate to `App/Assets.xcassets/LaunchScreen.imageset`
2. Add launch screen image (1125x2436 for iPhone X)
3. Or create a custom launch screen storyboard

## Building the App

### Development Build

```bash
# From web directory
npx cap sync ios
npx cap open ios
```

In Xcode:
1. Select target device (simulator or physical device)
2. Press **Cmd+R** to run
3. Press **Cmd+B** to build

### Production Build

```bash
# Ensure latest sync
npx cap sync ios

# Open Xcode
npx cap open ios
```

In Xcode:
1. Select **Any iOS Device** as target
2. **Product > Archive**
3. Wait for archive to complete
4. Distribute App

## Distribution

### TestFlight (Beta Testing)

1. After archiving, click **Distribute App**
2. Select **TestFlight & App Store**
3. Follow the wizard to upload
4. Add testers in App Store Connect

### App Store (Production)

1. After archiving, click **Distribute App**
2. Select **App Store Connect**
3. Complete the metadata:
   - App name: "Wellness Mental"
   - Description: Spanish description of app
   - Keywords: wellness, mental health, anxiety, depression
   - Screenshots (required for each device size)
   - App privacy details
4. Submit for review

## Troubleshooting

### Common Issues

#### "Command line tools are not installed"
```bash
xcode-select --install
```

#### CocoaPods installation fails
```bash
cd ios
pod install
cd ..
npx cap sync ios
```

#### Build fails with signing errors
- Check Apple Developer account status
- Verify Bundle Identifier is unique
- Ensure provisioning profiles are valid

#### Capacitor sync fails
```bash
rm -rf node_modules package-lock.json
npm install
npx cap sync ios
```

#### App crashes on launch
- Check console logs in Xcode
- Verify all web assets are synced
- Check for JavaScript errors in Safari Web Inspector

### Debugging

#### Enable Remote Debugging
1. Run app on simulator or device
2. Open Safari on Mac
3. Develop > [Device Name] > [App Name]
4. Use Web Inspector to debug

#### View Console Logs
```bash
# In Xcode, view console output
# Or use Safari Web Inspector
```

#### Clear App Data
```bash
# Delete app from device/simulator
# Reinstall to start fresh
```

## Performance Optimization

### 1. Enable Code Splitting
```javascript
// In capacitor.config.json
{
  "server": {
    "androidScheme": "https",
    "cleartext": true
  },
  "ios": {
    "contentInset": "automatic",
    "scrollEnabled": false,
    "backgroundColor": "#5BA3B8"
  }
}
```

### 2. Optimize Images
- Use WebP format where possible
- Compress images before adding to project
- Use appropriate sizes for each device

### 3. Enable Caching
- Service Worker is already configured
- Ensure cache strategies are optimal
- Test offline functionality

## Security Considerations

### 1. Data Protection
- Enable Data Protection capability in Xcode
- Use Keychain for sensitive data
- Implement certificate pinning for API calls

### 2. App Transport Security
```xml
<!-- In Info.plist -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
</dict>
```

### 3. Privacy
- Update privacy policy URL
- Configure data collection disclosure
- Implement consent mechanisms

## Testing Checklist

### Functional Testing
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads correctly
- [ ] Questionnaires can be completed
- [ ] Chat sends/receives messages
- [ ] Risk detection works
- [ ] Points are awarded
- [ ] Offline mode works

### iOS-Specific Testing
- [ ] App installs on device
- [ ] Push notifications work
- [ ] App works in background
- [ ] Deep links work
- [ ] Biometric auth works (if implemented)
- [ ] Screen orientation works
- [ ] Safe area handling correct

### Performance Testing
- [ ] App launches in < 3 seconds
- [ ] No memory leaks
- [ ] Smooth animations (60fps)
- [ ] Battery usage acceptable
- [ ] Network usage optimized

## Maintenance

### Regular Updates
```bash
# Update dependencies
npm update

# Sync Capacitor
npx cap sync ios

# Update CocoaPods
cd ios
pod update
cd ..
```

### Version Updates
1. Update version in `package.json`
2. Update version in Xcode
3. Update build number
4. Sync and rebuild

## Support Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Xcode Documentation](https://developer.apple.com/documentation/xcode)

## Next Steps

After completing iOS setup:

1. **Test thoroughly** on various devices
2. **Set up CI/CD** for automated builds
3. **Configure analytics** (Firebase, Mixpanel)
4. **Set up crash reporting** (Firebase Crashlytics)
5. **Implement push notifications**
6. **Add in-app purchases** (if applicable)
7. **Localize** for other languages
8. **Optimize for iPad** if needed
