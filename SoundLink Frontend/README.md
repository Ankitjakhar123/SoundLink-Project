# 🎵 SoundLink

<div align="center">
  <img src="public/icons/soundlink-logo.svg" alt="SoundLink Logo" width="300px">
  <br>
  <h3>Your music, anywhere, anytime.</h3>
  <p>A modern, responsive music streaming platform that works seamlessly across all your devices.</p>
  
  [![PWA Ready](https://img.shields.io/badge/PWA-Ready-c0ff00?style=for-the-badge&logo=pwa&logoColor=black)](https://web.dev/progressive-web-apps/)
  [![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![Powered by Vite](https://img.shields.io/badge/Powered%20by-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Mobile Friendly](https://img.shields.io/badge/Mobile-Friendly-c0ff00?style=for-the-badge&logo=android&logoColor=black)](https://www.apple.com/ios/app-store/)
</div>

---

## ✨ Features

- 🎧 **Stream Music** - Listen to your favorite tracks with high-quality streaming
- 📱 **Progressive Web App** - Install on any device (Android, iOS, desktop)
- 🔄 **Offline Support** - Your music is cached for offline listening
- 🎯 **Responsive Design** - Perfect experience on any screen size
- 🔍 **Advanced Search** - Find exactly what you're looking for
- 📋 **Playlist Management** - Create, edit, and share your playlists
- ⚡ **Fast Performance** - Optimized for speed and efficiency

## 📱 Installation

### Mobile Devices

#### Android
1. Visit SoundLink in Chrome
2. Tap the menu button (⋮)
3. Select "Add to Home Screen"
4. Follow the prompts to install

#### iOS (iPhone & iPad)
1. Visit SoundLink in Safari
2. Tap the share button (📤)
3. Select "Add to Home Screen"
4. Tap "Add" to install

### Desktop
1. Visit SoundLink in Chrome, Edge, or Firefox
2. Look for the install icon in the address bar
3. Click "Install" and follow the prompts

## 🚀 Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/soundlink.git

# Navigate to the project directory
cd soundlink/SoundLink\ Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production
```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

## 🧩 Tech Stack

- **Frontend**: React, Framer Motion, TailwindCSS
- **State Management**: React Context API
- **Routing**: React Router
- **API Communication**: Axios
- **PWA Integration**: Vite PWA Plugin, Workbox
- **Building**: Vite, PostCSS

## 🎨 Design Philosophy

SoundLink is built with a focus on user experience and accessibility. The dark-themed UI with vibrant lime accents creates a perfect environment for music discovery and enjoyment. The interface is intuitive and minimalist, putting your music front and center.

## 📁 Project Structure

### `/public` Directory

The public directory contains static assets that are served directly without being processed by the build system.

#### `/public/icons`
Contains application icons in various sizes for different devices and platforms:
- `soundlink-icon-{size}.png` - App icons in different resolutions (48px to 512px)
- `icon-{size}.svg` - Vector-based icons for better scaling
- `soundlink-logo.svg` - Main logo used throughout the application

#### `/public/assets`
Stores static media files used across the application:
- `screenshot1.png` - Application screenshots for documentation
- `sound-wave-pattern.svg` - Decorative waveform pattern used in the UI
- `default-avatar.svg` - Default user avatar when no profile image is available

#### `/public/manifest.json`
Web App Manifest file that defines how the app appears when installed on a user's device:
```json
{
  "name": "SoundLink",
  "short_name": "SoundLink",
  "description": "Your music streaming platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [...]
}
```

#### `/public/service-worker.js`
Service Worker implementation that enables offline functionality:
- Caches critical application assets for offline use
- Manages background sync for user actions when offline
- Handles push notifications
- Provides strategies for caching media content

#### `/public/robots.txt`
Controls search engine crawling with directives for web crawlers.

#### `/public/sitemap.xml`
XML file that helps search engines efficiently crawl the website structure.

### `/src` Directory

The source directory contains all the application code that gets processed by the build system.

#### `/src/components`
Reusable UI components organized by feature:

##### Player Components
- `Player/PremiumPlayer.jsx` - Enhanced music player with advanced controls for premium users
- `Player/PremiumRadioPlayer.jsx` - Specialized player for radio streams
- `Player/SleepTimer.jsx` - Component to automatically stop playback after a set time
- `Player/SleepTimerButton.jsx` - UI control to access the sleep timer functionality

##### Layout Components
- `Layout/Navbar.jsx` - Top navigation bar with search, user controls, and premium upgrade button
- `Layout/Sidebar.jsx` - Left navigation panel with main app sections
- `Layout/BottomNavigation.jsx` - Mobile navigation bar for touch-friendly control
- `Layout/Footer.jsx` - Application footer with links and copyright information

##### Core UI Components
- `SongItem.jsx` - Individual song display with play controls and metadata
- `AlbumItem.jsx` - Album card with cover art and details
- `PlaylistView.jsx` - Component for viewing and managing playlist contents
- `QueueComponent.jsx` - Displays and controls the current playback queue
- `LyricsPanel.jsx` - Displays synchronized lyrics for the current song

##### Utility Components
- `LazyImage.jsx` - Image component with lazy loading and blur-up effect
- `AccessibleFormInput.jsx` - Accessible form inputs with proper ARIA attributes
- `AccessibleIconButton.jsx` - Accessible icon buttons with tooltips
- `Skeleton.jsx` - Loading state placeholders
- `SEO.jsx` - Component for managing SEO metadata

##### Feature Components
- `InstallPWAButton.jsx` - Button to prompt PWA installation
- `ArtistExplorer.jsx` - UI for exploring artist catalogs
- `EditAlbum.jsx` & `EditSong.jsx` - Forms for content management
- `OTPVerificationForm.jsx` - Two-factor authentication component

#### `/src/context`
React Context providers for state management:
- `AuthContext.jsx` - User authentication state
- `PlayerContext.jsx` - Music player state and controls
- `ThemeContext.jsx` - Application theme preferences
- `LibraryContext.jsx` - User's music library state

#### `/src/utils`
Utility functions and helpers:
- `api.js` - API communication utilities
- `format.js` - Data formatting helpers
- `storage.js` - Local storage abstractions
- `analytics.js` - Usage analytics tools

#### `/src/assets`
Source assets that get processed during build:
- SVG icons processed by the build system
- SCSS/CSS module files
- Static images that need optimization

#### `/src/App.jsx`
The main React component that defines the routing and layout structure of the application.

#### `/src/main.jsx`
The entry point of the application that renders the App component to the DOM.

### Configuration Files

#### `vite.config.js`
Configures the Vite build tool:
```javascript
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'offline.html'],
      manifest: {
        name: 'SoundLink',
        short_name: 'SoundLink',
        // ... other manifest settings
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
```

#### `tailwind.config.js`
Customizes the Tailwind CSS framework:
- Custom color palette with SoundLink brand colors
- Extended theme with responsive breakpoints
- Custom animations for UI interactions
- Plugin configurations

#### `eslint.config.js`
Enforces code quality and consistency:
- React-specific rules
- Accessibility requirements
- Performance best practices

#### `netlify.toml`
Configuration for Netlify deployment:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### `_redirects`
Netlify redirect rules for SPA routing:
```
/* /index.html 200
```

### Build and Optimization

#### `postcss.config.js`
PostCSS configuration for CSS processing:
- Autoprefixer for cross-browser compatibility
- CSS Nano for minification
- PurgeCSS to remove unused styles

#### `/public/hard-refresh.js`
Script to handle version updates:
- Detects new versions of the application
- Clears cache when updates are available
- Prompts users to reload for the latest version

#### File Generation Scripts
- `generate-icons.js` - Generates app icons in various sizes
- `convert-icons.js` - Converts SVG icons to optimized formats

## 📸 Screenshots

<div align="center">
  <img src="public/assets/screenshot1.png" alt="SoundLink Home Screen" width="30%">
  <img src="public/assets/screenshot2.png" alt="SoundLink Player" width="30%">
  <img src="public/assets/screenshot3.png" alt="SoundLink Library" width="30%">
</div>

## 🔄 Data Flow & Architecture

### API Integration

The application communicates with the SoundLink Backend API through a centralized API utility:

#### `/src/utils/api.js`
```javascript
// Base API URL configuration
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Helper function to construct API URLs
export const getApiUrl = (endpoint) => {
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${formattedEndpoint}`;
};

// Authentication header generator
export const getAuthHeaders = (token) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};
```

### Key API Endpoints

- `/api/auth/*` - Authentication and user management
- `/api/songs/*` - Music catalog and streaming
- `/api/albums/*` - Album collections and metadata
- `/api/playlists/*` - User playlist management
- `/api/favorites/*` - User favorites
- `/api/search/*` - Search functionality

### Data Flow Pattern

SoundLink follows a unidirectional data flow pattern:

1. **User Interaction** - User interacts with a component (e.g., clicks play button)
2. **Context Action** - Component calls an action from the relevant context
3. **API Communication** - Context makes API request if needed
4. **State Update** - Context updates its state based on the result
5. **Re-render** - Components subscribed to the context re-render with new data

Example flow for playing a song:
```
User clicks "Play" → 
PlayerContext.playSong(songId) → 
API request to /api/songs/{id}/stream → 
Update PlayerContext state (currentSong, isPlaying) → 
Player components re-render with new state
```

### Caching Strategy

The application employs intelligent caching:

- **Service Worker** - Caches static assets for offline use
- **IndexedDB** - Stores user data and frequently accessed content
- **Memory Cache** - Maintains recently played songs in memory for instant replay
- **Persistent Storage** - Saves user preferences and application state

### Progressive Enhancement

SoundLink is built with progressive enhancement in mind:

1. **Core Functionality** - Basic music playback works without JavaScript
2. **Enhanced Experience** - Additional features load as needed
3. **Offline Support** - Content available offline through Service Worker
4. **Installation** - Full PWA experience when installed on device

## 🔄 Frontend-Backend Integration

The SoundLink Frontend and Backend are tightly integrated but maintained as separate services for scalability and separation of concerns.

### API Communication Layer

Communication between frontend and backend is handled through a structured API layer:

#### `/src/context/PlayerContext.jsx`

The PlayerContext manages music playback and communicates with the backend:

```jsx
import { createContext, useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { API_BASE_URL } from "../utils/api";

export const PlayerContext = createContext();

export const PlayerContextProvider = ({ children }) => {
  // Audio player references
  const audioRef = useRef();
  const { user, token } = useContext(AuthContext);
  
  // Player state
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  
  // Play a song by ID
  const playSong = async (songId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/songs/${songId}/stream`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentSong(response.data);
      audioRef.current.play();
      setIsPlaying(true);
      
      // Record play in analytics
      axios.post(`${API_BASE_URL}/api/analytics/play`, { songId });
    } catch (error) {
      toast.error("Error playing song");
    }
  };
  
  // Other player functions...
};
```

### Content Delivery

Media content (songs and images) flows through specialized endpoints:

1. **Song Streaming**: 
   - Frontend requests: `GET /api/songs/{id}/stream`
   - Backend delivers audio with proper streaming headers
   - Buffered using range requests for efficient playback

2. **Image Loading**:
   - Frontend uses `LazyImage.jsx` component
   - Images load progressively with blur-up effect
   - Multiple resolutions for responsive design

3. **Offline Content**:
   - Selected content cached using IndexedDB
   - Service worker intercepts requests for cached content
   - Backend provides manifest of required offline assets

## ✅ Testing Infrastructure

### Unit Testing

The `tests/` directory contains comprehensive unit tests using React Testing Library and Jest:

- **Component Tests** - Verify component rendering and behavior in isolation
- **Context Tests** - Validate state management and data flow
- **Utility Tests** - Ensure helper functions work as expected

Key test files:
- `PlayerContext.test.jsx` - Tests for the music player
- `AuthContext.test.jsx` - Authentication flow tests
- `SongItem.test.jsx` - Component rendering and interaction tests

### Integration Testing

Integration tests verify that components work together correctly:
- API mock services simulate backend responses
- Component interaction chains are validated
- Context providers are tested with connected components

### E2E Testing

End-to-end tests with Cypress verify the complete user journey:
- User registration and login
- Content browsing and search
- Music playback and controls
- Playlist creation and management

### Testing Commands

```bash
# Run unit tests
npm run test

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests
npm run cypress:open
```

## ♿ Accessibility Features

SoundLink is built with accessibility as a priority:

### Keyboard Navigation

- Full keyboard accessibility for all interactions
- Focus management between components
- Skip links for main content
- Keyboard shortcuts for common actions

### Screen Reader Support

Components are built with proper ARIA attributes:
- `AccessibleFormInput.jsx` - Form inputs with proper labels and descriptions
- `AccessibleIconButton.jsx` - Icon buttons with textual alternatives
- Player controls with descriptive announcements

### Visual Accessibility

- High contrast mode toggle
- Text resizing support
- Motion reduction preference detection
- Color blind friendly design

### WCAG Compliance

The application aims for WCAG 2.1 AA compliance:
- Text alternatives for non-text content
- Adaptable content presentation
- Distinguishable content
- Keyboard accessible functionality
- Enough time to read and use content
- Navigable interface
- Readable text
- Predictable operation

## 💻 Development Workflow

### Setup Process

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/soundlink.git
cd soundlink/SoundLink\ Frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set environment variables**
Create a `.env` file with the following:
```
VITE_BACKEND_URL=http://localhost:4000
VITE_APP_NAME=SoundLink
VITE_CLOUDINARY_URL=https://your-cloudinary-url
```

4. **Start development server**
```bash
npm run dev
```

### Code Standards

The project follows strict coding standards:

- ESLint configuration with React best practices
- Prettier for code formatting
- PropTypes or TypeScript for type checking
- JSDoc comments on critical functions
- Component composition patterns for reuse

### Git Workflow

- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`
- Release branches: `release/v1.2.3`
- Commit messages follow Conventional Commits format

### CI/CD Pipeline

1. **Continuous Integration**
   - GitHub Actions runs tests on each PR
   - ESLint static analysis
   - Jest tests with coverage report
   - Accessibility audit

2. **Continuous Deployment**
   - Auto-deployment to staging for `main` branch
   - Production deployment after manual approval
   - Version tagging for releases

## 🚀 Performance Optimization

### Bundle Optimization

- **Code Splitting**: Routes and large components are code-split
- **Tree Shaking**: Unused code is eliminated during build
- **Dynamic Imports**: Features are loaded on-demand
- **Module Federation**: Shared dependencies across pages

### Media Optimization

- **Responsive Images**: Different sizes for different devices
- **Lazy Loading**: Images load as they enter viewport
- **Format Optimization**: WebP with JPEG fallback
- **Audio Streaming**: Adaptive bitrate streaming

### Rendering Strategy

- **Critical CSS**: Inline critical styles for fast initial render
- **Deferred Loading**: Non-essential content loads after core UI
- **Virtualized Lists**: Only visible list items are rendered
- **Memoization**: React.memo and useMemo prevent unnecessary re-renders

### Performance Metrics

| Metric | Score | Target |
|--------|-------|--------|
| First Contentful Paint | 0.9s | <1s |
| Largest Contentful Paint | 1.7s | <2s |
| Time to Interactive | 2.1s | <3s |
| Speed Index | 1.5s | <2s |
| Total Blocking Time | 120ms | <200ms |
| Cumulative Layout Shift | 0.02 | <0.1 |

## 🧩 State Management Architecture

SoundLink uses a context-based state management approach with specialized contexts for different concerns:

### Authentication State

The `AuthContext` manages user authentication and profile:

```jsx
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(getCombinedToken());
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  
  // Authentication functions
  const login = async (credentials) => { /* ... */ };
  const register = async (userData) => { /* ... */ };
  const logout = () => { /* ... */ };
  const refreshToken = async () => { /* ... */ };
  const updateProfile = async (data) => { /* ... */ };
  
  // Token storage strategy
  function getCombinedToken() {
    // Try cookies first (more secure)
    const cookieToken = Cookies.get('soundlink_auth_token');
    if (cookieToken) return cookieToken;
    
    // Fall back to localStorage if needed
    return localStorage.getItem('soundlink_auth_token');
  }
  
  // Effect to check authentication on load
  useEffect(() => {
    const validateToken = async () => { /* ... */ };
    validateToken();
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, loading, isEmailVerified, 
      login, register, logout, updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### State Flow Diagram

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│  AuthContext   │────▶│ PlayerContext  │────▶│  Components    │
│                │     │                │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
       │                      │                      │
       ▼                      ▼                      ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│  API Service   │◀───▶│ LocalStorage/  │◀───▶│    UI State    │
│                │     │    Cache       │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
```

### State Persistence

SoundLink employs a multi-layered state persistence strategy:

1. **User Authentication**: Secured in HTTP-only cookies with fallback to localStorage
2. **User Preferences**: Stored in localStorage for persistence across sessions
3. **Playback State**: Maintained in SessionStorage for current session continuity
4. **Cached Content**: Stored in IndexedDB for offline access
5. **Temporary UI State**: Kept in React state without persistence

## 🛠️ Troubleshooting Guide

### Common Issues and Solutions

#### Installation Issues

**Issue**: Node modules fail to install
```bash
# Solution: Clear npm cache and retry
npm cache clean --force
rm -rf node_modules
npm install
```

**Issue**: Vite build errors with "Module not found"
```bash
# Solution: Check import paths and rebuild
npm run dev -- --force
```

#### PWA Issues

**Issue**: Service worker not updating
```javascript
// Solution: Add version to cache name in service-worker.js
const CACHE_NAME = 'soundlink-cache-v2';  // Increment version number
```

**Issue**: Offline mode not working
```bash
# Solution: Verify service worker registration
npm run build
npx serve -s dist  # Test production build locally
```

#### Audio Playback Issues

**Issue**: Audio not playing on iOS
```jsx
// Solution: Add user interaction requirement
// In PlayerContext.jsx
const playOnUserInteraction = () => {
  document.addEventListener('touchstart', initializeAudio, { once: true });
};

const initializeAudio = () => {
  audioRef.current.play().then(() => {
    audioRef.current.pause();
  });
};
```

**Issue**: Audio stops when app is in background
```jsx
// Solution: Use MediaSession API
navigator.mediaSession.setActionHandler('play', () => /* play logic */);
navigator.mediaSession.setActionHandler('pause', () => /* pause logic */);
```

### Debug Mode

The application includes a debug mode that can be enabled for troubleshooting:

```javascript
// Enable debug mode in browser console
localStorage.setItem('soundlink_debug', 'true');
// Then reload the page
```

Debug mode provides:
- Detailed console logging
- Performance measurements
- State change tracking
- Network request logging
- Error reporting with stack traces

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- All the amazing artists who make music worth streaming
- The open-source community for their incredible tools
- Our users for their feedback and support

---

<div align="center">
  <p>Made with ❤️ and 🎵</p>
  <p>© 2023 SoundLink. All rights reserved.</p>
</div>
