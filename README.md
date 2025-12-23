# VeXachat - Premium Social Platform

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 16+ (for Firebase CLI)
- Firebase account (free)
- Modern web browser

### 2. Firebase Setup

#### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Name: `vexachat-pro`
4. Disable Google Analytics (optional)
5. Click "Create project"

#### Step 2: Enable Services
1. **Authentication** → Sign-in method → Enable:
   - Email/Password
   - Google
   - Anonymous
2. **Firestore Database** → Create database → Start in test mode
3. **Storage** → Get started → Start in test mode
4. **Hosting** → Get started

#### Step 3: Get Configuration
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click Web icon (</>)
4. App nickname: "VeXachat-Web"
5. Click "Register app"
6. Copy the configuration object

#### Step 4: Update Configuration
Edit `services/firebase-config.js` and replace with your Firebase config:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 3. Local Development

#### Option A: Simple HTTP Server
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx serve public
```

Then open: http://localhost:8000

#### Option B: Firebase Local Emulator
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize emulators
firebase init emulators

# Start emulators
firebase emulators:start
```

### 4. Deployment Options

#### Option 1: Firebase Hosting (Recommended - FREE)
```bash
# Initialize Firebase project
firebase init hosting

# Select your project
# Public directory: public
# Configure as SPA: Yes

# Deploy
firebase deploy --only hosting
```

#### Option 2: Netlify (FREE)
1. Go to [netlify.com](https://netlify.com)
2. Drag & drop the `public` folder
3. Your site will be live instantly!

#### Option 3: Vercel (FREE)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Option 4: GitHub Pages (FREE)
1. Create GitHub repository
2. Push code to `main` branch
3. Go to Settings → Pages
4. Source: `main branch` → `/public` folder
5. Save

### 5. Features Included

✅ **Multi-language Support** (EN, AR, RU, TH)  
✅ **Guest Login** (No registration required)  
✅ **Real-time Chat** with Firebase  
✅ **User Profiles** with photo upload  
✅ **Nearby Users Discovery**  
✅ **WhatsApp Integration**  
✅ **Social Media Links**  
✅ **Glassmorphism UI**  
✅ **Responsive Design**  
✅ **Age Verification System**  

### 6. File Structure

```
vexachat-pro/
├── public/                    # Web files
│   ├── index.html            # Main HTML
│   ├── assets/              # Images, icons
│   └── styles/              # CSS files
├── services/                # JavaScript services
│   ├── firebase-config.js   # Firebase setup
│   ├── auth-service.js      # Authentication
│   ├── chat-service.js      # Real-time chat
│   └── profile-service.js   # User profiles
├── firebase.json           # Firebase config
├── firestore.rules         # Database rules
├── storage.rules           # Storage rules
└── main.js                # Main app logic
```

### 7. Testing

1. Open the app in browser
2. Click "Continue as Guest"
3. Test features:
   - Profile picture upload
   - Chat with simulated users
   - Language switching
   - Nearby users discovery

### 8. Customization

#### Change Colors
Edit `styles/main.css`:
```css
:root {
  --primary-orange: #FF6B00;    /* Main orange */
  --secondary-cyan: #00F0FF;    /* Cyan accent */
  --accent-pink: #FF00C8;       /* Pink accent */
}
```

#### Add New Language
1. Add translation in `main.js`
2. Add language button in `index.html`
3. Add text elements with `data-lang` attribute

#### Modify Features
- Edit services in `services/` folder
- Update UI in `public/index.html`
- Modify styles in `styles/main.css`

### 9. Troubleshooting

#### Common Issues:

1. **"Firebase not initialized"**
   - Check if Firebase config is correct
   - Ensure Firebase scripts are loading

2. **"Permission denied" errors**
   - Update Firestore rules in console
   - Check if user is authenticated

3. **Images not uploading**
   - Check Storage rules
   - Verify file size (< 5MB)
   - Check internet connection

4. **Chat not working**
   - Check Firestore database is created
   - Verify authentication status

### 10. Support

For issues:
1. Check browser console (F12)
2. Verify Firebase project setup
3. Review error messages
4. Contact support if needed

---

## 📱 Mobile Apps (Future)

Plan for mobile apps:
- React Native for iOS/Android
- PWA for mobile web
- Capacitor for hybrid apps

---

**Happy Coding! 🚀**
