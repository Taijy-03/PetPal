# 🐾 PetPal — Pet Recording & Management App

A fully-featured mobile app built with **React Native** and **Expo SDK 54** for recording and managing pet health, activities, photos, and reminders.

![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.81-green)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-orange)

---

## Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Phase 1 — Environment Setup](#phase-1--environment-setup)
5. [Phase 2 — Development](#phase-2--development)
6. [Phase 3 — Testing & Debugging](#phase-3--testing--debugging)
7. [Phase 4 — Build APK (Preview / Production)](#phase-4--build-apk)
8. [Phase 5 — Publish to Google Play Store](#phase-5--publish-to-google-play-store)
9. [Phase 6 — Publish to Apple App Store](#phase-6--publish-to-apple-app-store)
10. [Configuration Reference](#-configuration-reference)
11. [Troubleshooting](#-troubleshooting)
12. [Quick Reference: Dev to APK in 5 Steps](#-quick-reference-dev-to-apk-in-5-steps)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 **Dashboard** | Overview with stats, recent activity feed, upcoming reminders, pull-to-refresh |
| 🐕 **Pet Profiles** | Add unlimited pets with photo, name, type (9 types), breed, gender, birth date, weight, color, microchip ID, notes |
| 📸 **Photo Gallery** | Camera & gallery picker, per-pet photo grid |
| 🏥 **Health Records** | Track vaccinations, checkups, medications, surgeries, dental, allergies, injuries, weight checks |
| 🏃 **Activity Tracker** | Log walks, feeding, grooming, play, training, baths, sleep — with duration, distance, time |
| ⏰ **Reminders** | Feeding/walk/medicine/vet/grooming reminders with once/daily/weekly/monthly/yearly frequency |
| ⚙️ **Settings** | Dark mode, notifications toggle, data export, clear all data, usage statistics |
| 💾 **Offline Storage** | All data persisted locally via AsyncStorage |

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [Expo](https://expo.dev) | SDK 54 | Development framework & build toolchain |
| [React Native](https://reactnative.dev) | 0.81.4 | Cross-platform mobile UI |
| [React](https://react.dev) | 19.1.0 | UI component library |
| [React Navigation](https://reactnavigation.org) | 7.x | Bottom Tabs + Native Stack navigation |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | 2.x | Persistent local data storage |
| [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) | 17.x | Camera & photo library access |
| [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) | 0.32.x | Push notifications for reminders |
| [Expo Vector Icons](https://icons.expo.fyi) | 15.x | Ionicons icon set |
| [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | 3.x | Smooth animations |

---

## 📁 Project Structure

```
mobileapp/
├── App.js                          # App entry point (providers + navigator)
├── app.json                        # Expo configuration (name, icons, permissions)
├── eas.json                        # EAS Build profiles (dev, preview, production)
├── babel.config.js                 # Babel config (expo preset + reanimated plugin)
├── package.json                    # Dependencies & scripts
├── index.js                        # App registry entry
├── assets/                         # App icons, splash screen
└── src/
    ├── components/
    │   ├── EmptyState.js           # Empty state placeholder with CTA
    │   ├── FormElements.js         # FormInput, FormPicker, FormDateInput, FormButton, ChipGroup
    │   └── PetCard.js              # Pet card (standard + compact modes)
    ├── context/
    │   └── AppContext.js           # Global state (React Context + useReducer)
    ├── navigation/
    │   └── AppNavigator.js         # Tab navigator + stack navigators
    ├── screens/
    │   ├── HomeScreen.js           # Dashboard with stats & overview
    │   ├── PetsListScreen.js       # Pet list with FAB
    │   ├── PetDetailScreen.js      # Pet profile (Info/Health/Activity/Gallery tabs)
    │   ├── AddEditPetScreen.js     # Add or edit pet form
    │   ├── AddHealthRecordScreen.js# Health record form
    │   ├── AddActivityScreen.js    # Activity logging form
    │   ├── AddReminderScreen.js    # Reminder creation form
    │   ├── RemindersScreen.js      # All reminders list
    │   └── SettingsScreen.js       # Settings & data management
    ├── theme/
    │   └── theme.js                # Light & Dark theme definitions
    └── utils/
        ├── helpers.js              # ID generation, date formatting, constants
        └── storage.js              # AsyncStorage CRUD for all data types
```

---

## Phase 1 — Environment Setup

### 1.1 Install Prerequisites

| Requirement | Minimum Version | Install |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | Comes with Node.js |
| Git | 2.x | https://git-scm.com |
| Expo Go (mobile) | SDK 54 | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779) |

> ⚠️ **Important:** Your Expo Go app version must match the project SDK version (54). If you see "Project is incompatible with this version of Expo Go", update Expo Go from the Play Store / App Store, or adjust the `expo` version in `package.json`.

### 1.2 Clone & Install

```bash
# Clone the project
git clone <your-repo-url>
cd mobileapp

# Install dependencies
npm install
```

### 1.3 Verify Installation

```bash
# Check Expo CLI version
npx expo --version

# Check installed expo SDK version
node -e "console.log(require('./node_modules/expo/package.json').version)"
# Should show: 54.x.x
```

---

## Phase 2 — Development

### 2.1 Start the Development Server

```bash
# Start Expo dev server
npm start

# Or with cache cleared (recommended after dependency changes)
npx expo start --clear
```

You will see a QR code in the terminal.

### 2.2 Run on Physical Device

1. Open **Expo Go** on your phone
2. Scan the QR code displayed in the terminal
   - **Android**: Use the Expo Go app's QR scanner
   - **iOS**: Use the native Camera app
3. The app will load on your device

> 💡 Both your computer and phone must be on the **same Wi-Fi network**.

### 2.3 Run on Emulator / Simulator

```bash
# Android Emulator (requires Android Studio + AVD set up)
npm run android

# iOS Simulator (macOS only, requires Xcode)
npm run ios
```

### 2.4 Development Workflow

```
Edit code → Save → App auto-reloads (Fast Refresh)
```

Key shortcuts in the terminal while the dev server is running:

| Key | Action |
|---|---|
| `r` | Reload the app |
| `m` | Toggle dev menu |
| `j` | Open debugger |
| `a` | Open on Android emulator |
| `i` | Open on iOS simulator |
| `w` | Open in web browser |

### 2.5 Key Files to Edit

| To change... | Edit this file |
|---|---|
| App name, icon, splash screen | `app.json` |
| Theme colors & fonts | `src/theme/theme.js` |
| Navigation / add tabs | `src/navigation/AppNavigator.js` |
| Add a new screen | Create in `src/screens/`, register in `AppNavigator.js` |
| Add a new data model | Update `src/utils/storage.js` + `src/context/AppContext.js` |
| Modify form fields | Edit the relevant screen in `src/screens/` |

---

## Phase 3 — Testing & Debugging

### 3.1 Feature Test Checklist

Test each of the following on a real device before building:

- [ ] **Home Screen** — Stats display correctly, pull-to-refresh works
- [ ] **Add Pet** — Fill all fields, take photo with camera, pick from gallery
- [ ] **Pet List** — All pets show, long-press for edit/delete options
- [ ] **Pet Detail** — All 4 tabs work (Info, Health, Activity, Gallery)
- [ ] **Health Records** — Add vaccination/checkup, verify it appears in Health tab
- [ ] **Activity Log** — Log a walk with duration, verify it appears on dashboard
- [ ] **Reminders** — Create reminder, toggle on/off, delete
- [ ] **Photo Gallery** — Add photos, view in grid
- [ ] **Settings** — Toggle dark mode, clear data works
- [ ] **Data Persistence** — Kill app, reopen → all data is still there
- [ ] **Empty States** — App looks correct with no pets added

### 3.2 Debug Tools

```bash
# Start dev server
npx expo start

# Press 'j' in terminal → opens Chrome DevTools debugger
# Shake device → opens Expo dev menu on device
```

### 3.3 Check for Dependency Issues

```bash
# Check if all packages are compatible with the installed expo version
npx expo install --check

# Fix any issues automatically
npx expo install --fix
```

---

## Phase 4 — Build APK

### 4.1 Install EAS CLI

EAS (Expo Application Services) is used to build production binaries in the cloud.

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
# (Create a free account at https://expo.dev/signup if you don't have one)
eas login
```

### 4.2 Verify Build Configuration

The project already includes `eas.json` with three build profiles:

| Profile | Output | Purpose |
|---|---|---|
| `development` | `.apk` | Dev build with hot reload & dev tools |
| `preview` | `.apk` | Standalone APK for testers (no dev tools) |
| `production` | `.aab` | Optimized bundle for Google Play Store |

If you need to re-initialize the config:

```bash
eas build:configure
```

### 4.3 Build a Preview APK (Recommended for Sharing)

This creates a standalone `.apk` file you can install on any Android device — **no Play Store needed**.

```bash
eas build --platform android --profile preview
```

**What happens:**
1. Your code is uploaded to Expo's cloud build servers
2. The build compiles (first build: ~10-15 min; subsequent: ~5-10 min)
3. You receive a **download URL** for the `.apk` file

**To install the APK:**
1. Download the `.apk` on the Android device
2. Go to Settings → Security → Enable "Install from Unknown Sources"
3. Tap the downloaded `.apk` to install

### 4.4 Build a Production AAB (For Google Play)

```bash
eas build --platform android --profile production
```

This produces an `.aab` (Android App Bundle) — the format required by Google Play Store.

### 4.5 Build Locally (Optional — No Cloud)

If you want to build on your own machine (requires Android SDK + JDK installed):

```bash
eas build --platform android --profile preview --local
```

### 4.6 Check Build Status & Download

```bash
# List all your builds
eas build:list

# Or go to https://expo.dev → Your Project → Builds tab
# Click on a completed build to download the APK/AAB
```

---

## Phase 5 — Publish to Google Play Store

### 5.1 Prerequisites

| Requirement | Details |
|---|---|
| Google Play Developer Account | https://play.google.com/console ($25 one-time registration fee) |
| Production `.aab` build | Run `eas build --platform android --profile production` |
| App icon | 512×512 PNG |
| Feature graphic | 1024×500 PNG |
| Screenshots | At least 2 phone screenshots (JPEG or PNG) |
| Short description | Max 80 characters |
| Full description | Max 4000 characters |
| Privacy policy URL | Required — host a simple privacy policy page |

### 5.2 Option A: Automatic Submission via EAS

**Step 1:** Set up a Google Play service account:

1. Go to [Google Play Console](https://play.google.com/console) → Setup → API access
2. Click "Create new service account"
3. Follow the link to Google Cloud Console
4. Create a service account with the "Service Account User" role
5. Create a JSON key for this service account → download it
6. Back in Play Console, grant the service account "Release Manager" permissions
7. Save the JSON key file as `google-services.json` in your project root

**Step 2:** Submit:

```bash
eas submit --platform android
```

> ⚠️ Add `google-services.json` to your `.gitignore` — never commit service account keys.

### 5.3 Option B: Manual Upload

1. Build the production AAB: `eas build --platform android --profile production`
2. Download the `.aab` file from the build URL
3. Go to [Google Play Console](https://play.google.com/console)
4. Click "Create app" → fill in app details
5. Go to **Release** → **Production** → **Create new release**
6. Upload the `.aab` file
7. Fill in release notes
8. Complete the **Store listing** (description, screenshots, icon, feature graphic)
9. Complete the **Content rating** questionnaire
10. Set up **Pricing & distribution**
11. Click **Submit for review**

### 5.4 Review Timeline

- New apps: **1-7 days** for first review
- Updates: Usually **1-3 days**
- You'll receive an email when approved or if changes are required

---

## Phase 6 — Publish to Apple App Store

### 6.1 Prerequisites

| Requirement | Details |
|---|---|
| Apple Developer Account | https://developer.apple.com ($99/year) |
| macOS computer | Required for Xcode and iOS signing |
| App Store Connect access | https://appstoreconnect.apple.com |
| App icon | 1024×1024 PNG (no transparency, no alpha channel) |
| Screenshots | Required for iPhone 6.7", 6.5", 5.5" at minimum |

### 6.2 Build for iOS

```bash
eas build --platform ios --profile production
```

EAS handles code signing and provisioning profiles automatically.

### 6.3 Submit to App Store

```bash
eas submit --platform ios
```

You'll need:
- Your Apple ID
- App-specific password (generate at https://appleid.apple.com → Security → App-Specific Passwords)
- App Store Connect App ID

### 6.4 Manual Submission (Alternative)

1. Download the `.ipa` file from EAS
2. Use [Transporter](https://apps.apple.com/app/transporter/id1450874784) (macOS app) to upload
3. Configure the app in [App Store Connect](https://appstoreconnect.apple.com)
4. Submit for review

### 6.5 Review Timeline

- Typically **24-48 hours**
- Follow [Apple's Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

## 📋 Configuration Reference

### App Configuration (`app.json`)

| Field | Value | Description |
|---|---|---|
| `name` | PetPal | App display name |
| `slug` | petpal | URL-friendly identifier |
| `version` | 1.0.0 | Displayed app version |
| `orientation` | portrait | Screen orientation lock |
| `splash.backgroundColor` | `#FF6B6B` | Splash screen background color |
| `ios.supportsTablet` | true | Enable iPad support |
| `android.permissions` | CAMERA, STORAGE | Required Android permissions |

### Build Profiles (`eas.json`)

| Profile | Output | Distribution | Use Case |
|---|---|---|---|
| `development` | `.apk` | Internal | Dev builds with hot reload |
| `preview` | `.apk` | Internal | Share with testers, direct install |
| `production` | `.aab` / `.ipa` | Store | Upload to Play Store / App Store |

### npm Scripts

| Command | Action |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run android` | Open on Android emulator |
| `npm run ios` | Open on iOS simulator |
| `npm run web` | Open in web browser |

---

## 🔧 Troubleshooting

### "Project is incompatible with this version of Expo Go"

Your Expo Go app version doesn't match the project SDK.

**Fix:** Update Expo Go from the Play Store / App Store to match SDK 54.

### "Cannot find module 'babel-preset-expo'"

```bash
npm install babel-preset-expo
npx expo start --clear
```

### "Network response timed out" when scanning QR code

- Ensure your phone and computer are on the **same Wi-Fi network**
- Try tunnel mode:

```bash
npx expo start --tunnel
```

- If prompted, install ngrok: `npm install -g @expo/ngrok`

### Metro bundler errors after installing packages

```bash
# Clear all caches and restart
npx expo start --clear
```

### Build fails on EAS

```bash
# View your recent builds
eas build:list

# Check detailed build logs at:
# https://expo.dev → Your Project → Builds → Click the failed build
```

### App crashes on startup (production build)

- Check for missing native dependencies
- Run: `npx expo install --check`
- Delete and reinstall:

```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### Data is lost after reinstall

AsyncStorage data is stored on-device. Uninstalling the app or clearing app data removes all stored data. To reset data without reinstalling, use **Settings → Clear All Data** in the app.

---

## 📝 Quick Reference: Dev to APK in 5 Steps

```bash
# Step 1: Install dependencies
npm install

# Step 2: Test in development
npm start
# → Scan QR code with Expo Go → test all features

# Step 3: Install EAS CLI and login
npm install -g eas-cli
eas login

# Step 4: Build the APK
eas build --platform android --profile preview

# Step 5: Download the APK
# → Build completes in ~5-15 minutes
# → Download URL is printed in terminal
# → Also available at https://expo.dev → Builds
```

**That's it!** Share the APK download link with anyone. They can install it directly on their Android device.

---

<p align="center">
  Made with ❤️ for pet lovers everywhere<br/>
  <strong>PetPal v1.0.0</strong> · Expo SDK 54 · React Native 0.81
</p>
