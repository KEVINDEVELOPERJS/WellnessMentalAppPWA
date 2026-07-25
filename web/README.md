# Wellness Mental - iOS PWA

Progressive Web App implementation of Wellness Mental for iOS using Capacitor.

## Features Implemented

### ✅ Core Functionality
- **Authentication System**: User registration and login with JWT tokens
- **Database**: IndexedDB for local data storage
- **Dashboard**: Main interface with role-based access (student/psychologist)
- **Questionnaires**: GAD-7 (anxiety) and PHQ-9 (depression) evaluations
- **Chat IA**: Emotional support assistant with risk detection
- **Points System**: Gamification with levels and achievements

### 📱 iOS-Specific Features
- PWA manifest for iOS Safari
- Service Worker for offline support
- Capacitor configuration for native iOS app
- Touch-optimized UI
- iOS-style navigation and components

## Project Structure

```
web/
├── package.json              # Dependencies and scripts
├── capacitor.config.json     # Capacitor configuration
├── www/
│   ├── index.html           # Main dashboard
│   ├── evaluation.html      # Questionnaires interface
│   ├── chat.html           # Chat IA interface
│   ├── manifest.json       # PWA manifest
│   ├── service-worker.js   # Offline support
│   ├── css/
│   │   ├── styles.css      # Main styles
│   │   ├── evaluation.css  # Evaluation styles
│   │   └── chat.css        # Chat styles
│   ├── js/
│   │   ├── app.js          # Main app logic
│   │   ├── evaluation.js   # Evaluation controller
│   │   └── chat.js         # Chat controller
│   └── icons/              # App icons (to be added)
```

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Xcode (for iOS build)

### Setup

1. **Install dependencies:**
```bash
cd web
npm install
```

2. **Add Capacitor platforms:**
```bash
npx cap add android
npx cap add ios
```

3. **Sync Capacitor:**
```bash
npx cap sync
```

4. **Run locally:**
```bash
npm start
```

5. **Open in Xcode (iOS):**
```bash
npx cap open ios
```

## Configuration

### OpenAI API Key (Optional)

To enable AI-powered responses in the chat:

1. Add your OpenAI API key to local configuration:
```javascript
// In chat.js, set the API key
chatController.setApiKey('your-openai-api-key');
```

2. Or add it to the Capacitor config:
```json
{
  "plugins": {
    "OpenAI": {
      "apiKey": "your-openai-api-key"
    }
  }
}
```

### SMTP Configuration (Optional)

For email notifications, configure SMTP in the Android local.properties file (this will be adapted for iOS in future updates).

## Development

### Adding New Features

1. **Create new HTML page** in `www/`
2. **Add corresponding CSS** in `www/css/`
3. **Add JavaScript logic** in `www/js/`
4. **Update navigation** in `app.js`
5. **Sync Capacitor** after changes:
```bash
npx cap sync
```

### Database Schema

The app uses IndexedDB with the following tables:
- `users` - User accounts
- `questionnaires` - Evaluation templates
- `questions` - Individual questions
- `responses` - User answers
- `results` - Evaluation results
- `chat_sessions` - Chat conversations
- `chat_messages` - Individual messages
- `alerts` - Risk alerts
- `exercises` - Breathing exercises
- `points` - User points and levels
- `achievements` - Available achievements
- `user_achievements` - Unlocked achievements
- `garden` - Mental garden plants
- `check_in` - Daily mood check-ins
- `community` - Community posts
- `active_breaks` - Active breaks scheduling

## Building for iOS

1. **Sync Capacitor:**
```bash
npx cap sync ios
```

2. **Open in Xcode:**
```bash
npx cap open ios
```

3. **Build in Xcode:**
   - Select your target device or simulator
   - Press Cmd+B to build
   - Press Cmd+R to run

4. **Archive for App Store:**
   - Product > Archive
   - Distribute App

## Testing

### Manual Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Dashboard displays correctly
- [ ] Questionnaires can be completed
- [ ] Results are calculated correctly
- [ ] Chat sends and receives messages
- [ ] Risk detection works
- [ ] Points are awarded
- [ ] Offline mode works (service worker)

### iOS-Specific Testing

- [ ] App installs correctly on iOS device
- [ ] Push notifications work
- [ ] Camera permissions work (if needed)
- [ ] Storage permissions work
- [ ] App works in background
- [ ] App handles deep links

## Deployment

### Web Deployment

Deploy the `www` folder to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3

### iOS App Store Deployment

1. **Build archive in Xcode**
2. **Upload to App Store Connect**
3. **Configure app metadata**
4. **Submit for review**

## Future Enhancements

### Planned Features
- [ ] Breathing exercises interface
- [ ] Games and gamification (Calma Match, Puzzle Zen)
- [ ] Mental Garden visualization
- [ ] Community features
- [ ] Parent reports
- [ ] Psychologist dashboard
- [ ] Push notifications
- [ ] Biometric authentication
- [ ] HealthKit integration
- [ ] Siri shortcuts

### Technical Improvements
- [ ] TypeScript migration
- [ ] React/Vue framework integration
- [ ] End-to-end encryption for chat
- [ ] Cloud sync for data
- [ ] Analytics integration
- [ ] Crash reporting

## Troubleshooting

### Common Issues

**Capacitor sync fails:**
```bash
rm -rf node_modules package-lock.json
npm install
npx cap sync
```

**iOS build fails:**
- Clean build folder in Xcode (Cmd+Shift+K)
- Reinstall pods: `cd ios && pod install`
- Check Xcode version compatibility

**Database issues:**
- Clear browser data and reload
- Check IndexedDB support in browser
- Verify database schema version

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Create an issue in the repository
- Contact development team
- Check documentation in `/docs` folder
