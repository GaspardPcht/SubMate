# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SubMate is a subscription management mobile application built with React Native (Expo) and a Node.js/Express backend. The app helps users track their subscriptions, receive notifications about upcoming charges, and analyze their spending patterns.

## Architecture

### Frontend (`front/`)
- **Framework**: React Native with Expo SDK 52
- **State Management**: Redux Toolkit with Redux Persist for offline storage
- **Navigation**: React Navigation v7 with bottom tabs
- **UI Components**: React Native Paper for Material Design components
- **Notifications**: Expo Notifications for push notifications
- **Charts**: React Native Chart Kit for data visualization

### Backend (`back/`)
- **Framework**: Express.js with Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt for password hashing
- **Email**: Nodemailer for email notifications
- **Deployment**: Vercel serverless functions
- **Scheduling**: Node-cron for subscription reminders

### Key Architecture Patterns
- Redux store persists authentication state to AsyncStorage
- API layer in `front/src/services/` handles all backend communication
- Notification service manages both local and push notifications
- Subscription tracking with automated reminder system

## Development Commands

### Frontend Development
```bash
cd front
npm install
npm start              # Start Expo development server
npm run ios           # Start iOS simulator
npm run android       # Start Android emulator
npm run web           # Start web development
```

### Backend Development
```bash
cd back
npm install
npm start             # Start Express server (node ./bin/www)
```

### Mobile App Building
```bash
cd front
eas build --platform ios --profile preview     # Build iOS preview
eas build --platform android --profile preview # Build Android preview
eas build --platform all --profile production  # Production builds
```

## Key Files and Patterns

### State Management
- Redux store in `front/src/redux/store.ts` with persistence configuration
- Auth slice handles user authentication and token management
- Subscriptions slice manages subscription data and CRUD operations

### API Integration
- Base API configuration in `front/src/config/api.ts`
- Service layer in `front/src/services/` for organized API calls
- Backend API base URL: `https://sub-mate-back.vercel.app`

### Database Models
- User model: `back/models/User.ts` (TypeScript) and `back/models/user.js` (JavaScript)
- Subscription model: `back/models/Subscription.ts` and `back/models/Subscription.js`
- Connection setup in `back/models/connection.js`

### Notification System
- Frontend: `front/src/services/notificationService.ts`
- Backend: `back/services/notificationService.js`
- Reminder service: `back/services/reminderService.js`
- Cron jobs: `back/services/cronService.js`

## Development Notes

- The app uses TypeScript in the frontend with strict mode enabled
- Backend mixes JavaScript and TypeScript files
- Expo development client is configured for custom development builds
- App supports both iOS and Android with specific bundle identifiers
- Push notifications require proper Expo configuration and device permissions
- Redux Persist whitelist includes only the 'auth' slice for performance