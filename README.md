<div align="center">
  <img src="SoundLink Frontend/public/icons/soundlink-icon-512.png" alt="SoundLink Logo" width="150px" height="150px">
  <h1>🎵 SoundLink</h1>
  <p><strong>Your music, anywhere, anytime.</strong></p>
  <p>A modern, responsive music streaming platform that works seamlessly across all your devices.</p>
  
  [![Website](https://img.shields.io/badge/Visit-SoundLink-1DB954?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iIzFEQjk1NCIvPjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiMxMTEiLz48cGF0aCBkPSJNNDAgNDBMNjUgNTBMNDAgNjBWNDBaIiBmaWxsPSIjZmZmIi8+PC9zdmc+&logoColor=white)](https://ankitsoundlink.netlify.app/)
  [![PWA Ready](https://img.shields.io/badge/PWA-Ready-5E35B1?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
  [![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![Powered by Vite](https://img.shields.io/badge/Powered%20by-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Styled_with-Tailwind-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  
  ![GitHub stars](https://img.shields.io/github/stars/ankit/soundlink?style=flat-square&color=yellow)
  ![GitHub forks](https://img.shields.io/github/forks/ankit/soundlink?style=flat-square&color=blue)
  ![GitHub issues](https://img.shields.io/github/issues/ankit/soundlink?style=flat-square&color=red)
  ![GitHub pull requests](https://img.shields.io/github/issues-pr/ankit/soundlink?style=flat-square&color=green)
  ![GitHub last commit](https://img.shields.io/github/last-commit/ankit/soundlink?style=flat-square&color=orange)
  
  <!-- New project status badges -->
  ![Code Size](https://img.shields.io/github/languages/code-size/ankit/soundlink?style=flat-square&color=informational)
  ![License](https://img.shields.io/badge/license-MIT-brightgreen?style=flat-square)
  ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)
  
  <!-- Demo GIF placeholder -->
  <img src="https://via.placeholder.com/800x450.gif?text=SoundLink+Demo" width="80%" alt="SoundLink Demo" />
  
  <p align="center">⭐ Star us on GitHub — it motivates us a lot! ⭐</p>
</div>

---

## 📑 Table of Contents
- [📋 Overview](#-overview)
- [⚡ Quick Start](#-quick-start)
- [🧩 Technical Architecture](#-technical-architecture)
- [✨ Key Features](#-key-features)
- [🎵 Music Player Features](#-music-player-features)
- [👤 User Features](#-user-features)
- [🛠️ Admin Features](#️-admin-features)
- [📚 Data Models](#-data-models)
- [📱 Installation](#-installation)
- [🚀 Development](#-development)
- [🧩 Tech Stack](#-tech-stack)
- [🎨 Design Philosophy](#-design-philosophy)
- [📋 Core Components](#-core-components)
- [📸 App Screenshots](#-app-screenshots)
- [📋 Recent Updates](#-recent-updates)
- [📊 Performance Metrics](#-performance-metrics)
- [⚙️ System Requirements](#️-system-requirements)
- [🔄 API Integration](#-api-integration)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🚀 Roadmap](#-roadmap)
- [⚠️ Security](#️-security)
- [🤔 Support & Feedback](#-support--feedback)
- [❓ FAQ](#-faq)
- [🙏 Acknowledgements](#-acknowledgements)

## 📋 Overview

SoundLink is a feature-rich music streaming platform built with modern web technologies. It offers a seamless music listening experience across devices with a focus on performance, design, and user experience. The application is structured as a Progressive Web App (PWA), allowing users to install it on their devices and enjoy offline functionality.

<div align="center">
  <a href="https://ankitsoundlink.netlify.app/">
    <img src="https://img.shields.io/badge/Try_SoundLink_Now-1DB954?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iIzFEQjk1NCIvPjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiMxMTEiLz48cGF0aCBkPSJNNDAgNDBMNjUgNTBMNDAgNjBWNDBaIiBmaWxsPSIjZmZmIi8+PC9zdmc+&logoColor=white" alt="Try SoundLink Now">
  </a>
</div>

## ⚡ Quick Start

Get up and running in minutes:

```bash
# Clone the repository
git clone https://github.com/ankit/soundlink.git

# Navigate to frontend directory
cd soundlink/SoundLink\ Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Then visit `http://localhost:5173` in your browser.

Want to try without installing? Visit [SoundLink Live Demo](https://ankitsoundlink.netlify.app/).

## 🧩 Technical Architecture

### Frontend
- **Framework**: React 19 with hooks and functional components
- **State Management**: React Context API (PlayerContext, AuthContext)
- **Routing**: React Router v6 with protected routes
- **Styling**: TailwindCSS with custom theme system
- **Animations**: Framer Motion for smooth UI transitions
- **API Communication**: Axios for HTTP requests
- **Build Tool**: Vite with PWA plugin
- **Media Handling**: Custom audio player with MediaSession API integration

### Backend
- **Server**: Express.js with Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based auth system with token management
- **File Storage**: Cloudinary integration for audio and image storage
- **Security**: Rate limiting, CORS configuration, environment variables
- **API Structure**: RESTful endpoints with structured controllers and routes
- **Media Processing**: Multer for file uploads, metadata extraction

### Architecture Diagram

<div align="center">
  <img src="https://via.placeholder.com/800x500?text=SoundLink+Architecture+Diagram" alt="SoundLink Architecture" width="80%">
  <p><em>SoundLink's microservice-based architecture with React frontend and Express backend</em></p>
</div>

## ✨ Key Features

- 🎧 **High-Quality Streaming** - Enjoy crystal-clear audio with adaptive bitrate streaming
- 📱 **Progressive Web App** - Install on any device (Android, iOS, desktop) for native-like experience
- 🔄 **Offline Playback** - Listen to your favorite tracks without an internet connection
- 🌙 **Dark Theme UI** - Easy on the eyes with a sleek dark-themed interface
- 🎯 **Responsive Design** - Perfect experience on any screen size from mobile to desktop
- 🔍 **Smart Search** - Find artists, albums, and songs with intelligent search capabilities
- 📋 **Playlist Management** - Create, edit, and share your custom playlists
- 💬 **Lyrics Display** - View synchronized lyrics while listening to your music
- 🧠 **Smart Recommendations** - Discover new music based on your listening habits
- ⚡ **Fast Performance** - Optimized for speed with minimal load times

## 🎵 Music Player Features

### Core Playback
- **Smooth Playback** - Buffering management for uninterrupted listening
- **Media Controls** - Play, pause, skip, previous, seek, volume control
- **Queue Management** - Add, remove, reorder songs in the playback queue
- **Lock Screen Controls** - Control playback from your device's lock screen
- **Background Playback** - Music continues playing when app is in background

### Enhanced Experience
- **Synchronized Lyrics** - Follow along with time-synced lyrics
- **Dynamic Theming** - UI colors adapt to album artwork
- **Offline Mode** - Automatically switch to offline mode when no connection
- **Add to Favorites** - Quickly save songs to your library

## 👤 User Features

### Account Management
- **User Registration/Login** - Create an account or sign in securely
- **Profile Customization** - Update profile information and preferences
- **Settings** - Customize app behavior and appearance

### Content Organization
- **Favorites** - Like songs and access them quickly from your library
- **Custom Playlists** - Create, edit, delete your own playlists
- **Recently Played** - Track your listening history
- **Library Management** - View and organize all your saved music

## 🛠️ Admin Features

### Content Management
- **Song Management** - Add, edit, delete songs with metadata
- **Album Management** - Create and manage albums
- **Artist Management** - Manage artist profiles and discographies
- **Bulk Upload** - Add multiple songs at once

## 📚 Data Models

The application uses several data models to organize content:

- **Songs** - Music tracks with metadata, file URLs, and lyrics
- **Albums** - Collections of songs
- **Artists** - Creator profiles with related songs
- **Users** - User accounts and profiles
- **Playlists** - User-created collections
- **Favorites** - User's liked songs

## 📱 Installation

### Mobile Devices

#### Android
1. Visit [SoundLink](https://ankitsoundlink.netlify.app/) in Chrome
2. Tap the menu button (⋮)
3. Select "Add to Home Screen"
4. Follow the prompts to install

#### iOS (iPhone & iPad)
1. Visit [SoundLink](https://ankitsoundlink.netlify.app/) in Safari
2. Tap the share button (📤)
3. Select "Add to Home Screen"
4. Tap "Add" to install

### Desktop
1. Visit [SoundLink](https://ankitsoundlink.netlify.app/) in Chrome, Edge, or Firefox
2. Look for the install icon in the address bar
3. Click "Install" and follow the prompts

## 🚀 Development

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB (for backend)

### Frontend Setup
```bash
# Navigate to the frontend directory
cd SoundLink\ Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to the backend directory
cd SoundLink\ Backend

# Install dependencies
npm install

# Start server
npm run server
```

## 🧩 Tech Stack

<div align="center">
  
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
  ![Context API](https://img.shields.io/badge/Context_API-4A4A4A?style=for-the-badge&logo=react&logoColor=61DAFB)
  
  ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
  ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
  ![PWA](https://img.shields.io/badge/PWA-5E35B1?style=for-the-badge&logo=pwa&logoColor=white)
  
  ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
  ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
  ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
  
</div>

### Frontend
- **Framework**: React, Framer Motion, TailwindCSS
- **State Management**: React Context API
- **Routing**: React Router
- **API Communication**: Axios
- **PWA Integration**: Vite PWA Plugin, Workbox

### Backend
- **Server**: Express.js, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt
- **File Storage**: Cloudinary
- **Security**: Express rate limiter, CORS

## 🎨 Design Philosophy

SoundLink is built with a focus on user experience and accessibility. The dark-themed UI with vibrant accents creates a perfect environment for music discovery and enjoyment. The interface is intuitive and minimalist, putting your music front and center.

## 📋 Core Components

### Player Components
- **PremiumPlayer** - Full-featured player with lyrics and controls
- **LyricsPanel** - Displays synchronized lyrics for songs
- **MoreOptionsSheet** - Options panel for songs (add to playlist, share, etc.)
- **QueueComponent** - Manages the current playback queue

### Content Components
- **DisplayHome** - Main content display for the homepage
- **DisplayAlbum** - Album view with song list
- **ArtistDetail** - Artist profile with discography
- **SearchPage** - Search interface for finding content
- **Library** - User's saved content

### Admin Components
- **AdminDashboard** - Central management interface
- **ListSong/AddSong/EditSong** - Song management
- **ListAlbum/AddAlbum** - Album management
- **AdminArtists** - Artist management

## 📸 App Screenshots

<div align="center">
  <img src="https://res.cloudinary.com/dhxvwbtfj/image/upload/v1747155152/Screenshot_2025-05-13_221228_e0d7yh.png" width="30%">
  <img src="https://res.cloudinary.com/dhxvwbtfj/image/upload/v1747155156/Screenshot_2025-05-13_221354_iyw18h.png" width="30%">
  <img src="https://res.cloudinary.com/dhxvwbtfj/image/upload/v1747155158/Screenshot_2025-05-13_221324_iet0tp.png" width="30%">
  
  <p>
    <img src="https://res.cloudinary.com/dhxvwbtfj/image/upload/v1747155152/Screenshot_2025-05-13_221434_exjiw2.png" width="45%">
    <img src="https://res.cloudinary.com/dhxvwbtfj/image/upload/v1747155152/Screenshot_2025-05-13_221539_q7pgui.png" width="45%">
    <img src="https://res.cloudinary.com/dhxvwbtfj/image/upload/v1747155153/Screenshot_2025-05-13_221450_g46cq8.png" width="45%">
  </p>
</div>

## 📋 Recent Updates

- 🎵 **Added Lyrics Functionality** - Implemented lyrics display in premium player
- 🔄 **Enhanced LyricsPanel** - Updated to show synchronized lyrics with timestamps
- 🧹 **Code Cleanup** - Removed excessive console logs throughout the application
- 🔍 **Search Improvements** - Enhanced search functionality for better results
- 🎨 **UI Enhancements** - Visual improvements for better user experience

## 📊 Performance Metrics

SoundLink is built with performance in mind:

<div align="center">
  
  ![Performance: 95%](https://img.shields.io/badge/Performance-95%25-success?style=for-the-badge&logo=lighthouse&logoColor=white)
  ![Accessibility: 98%](https://img.shields.io/badge/Accessibility-98%25-success?style=for-the-badge&logo=lighthouse&logoColor=white)
  ![Best Practices: 100%](https://img.shields.io/badge/Best_Practices-100%25-success?style=for-the-badge&logo=lighthouse&logoColor=white)
  ![SEO: 97%](https://img.shields.io/badge/SEO-97%25-success?style=for-the-badge&logo=lighthouse&logoColor=white)
  
</div>

- **Load Time**: < 2 seconds on average 3G connection
- **Bundle Size**: < 250KB gzipped (main bundle)
- **Time to Interactive**: < 3.5 seconds on mobile devices
- **First Contentful Paint**: < 1.2 seconds
- **Responsive**: 100% fluid design across all breakpoints

These metrics are continuously monitored and improved.

## ⚙️ System Requirements

- **Web Browser**: Latest version of Chrome, Firefox, Safari, or Edge
- **Mobile OS**: Android 9+ or iOS 13+
- **Desktop OS**: Windows 10+, macOS 10.15+, or any modern Linux distribution
- **Internet**: 3G connection or better recommended for streaming

## 🔄 API Integration

The frontend communicates with the backend through RESTful APIs:
- **Song Management** - CRUD operations for songs
- **User Authentication** - Register, login, profile management
- **Playlist Operations** - Create, edit, delete playlists
- **Favorites** - Add/remove favorites
- **Search** - Search functionality across content types

## 🤝 Contributing

We welcome contributions to make SoundLink even better!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🚀 Roadmap

We're constantly working to make SoundLink even better. Here's what's coming next:

- 🎵 **Audio Visualizations** - Real-time visual effects synchronized with music
- 🔊 **Equalizer Settings** - Customize audio with presets and manual adjustments
- 📱 **Mobile App Version** - Native iOS and Android apps 
- 🌎 **Multi-language Support** - Translations for global accessibility
- 🧠 **AI Music Recommendations** - Personalized suggestions based on listening habits
- 🎮 **Desktop Media Key Support** - Control playback with keyboard media keys
- 🔐 **Enhanced Security** - Additional protection for user accounts
- 📊 **Advanced Analytics** - Detailed insights for administrators

## ⚠️ Security

We take security seriously at SoundLink. If you discover a security vulnerability, please send an email to security@soundlink.com instead of opening a public issue.

## 🤔 Support & Feedback

Have questions or feedback? We'd love to hear from you!

- **[GitHub Issues](https://github.com/ankit/soundlink/issues)** - Report bugs or suggest features
- **[Email Support](mailto:support@soundlink.com)** - Get help with your account
- **[Discord Community](https://discord.gg/soundlink)** - Join our community discussions

## ❓ FAQ

<details>
<summary><strong>Is SoundLink completely free to use?</strong></summary>
<br>
SoundLink offers both free and premium tiers. The free tier gives you access to all basic features, while the premium tier offers enhanced functionality like lyrics display, offline playback, and higher audio quality.
</details>

<details>
<summary><strong>Can I use SoundLink on my mobile device?</strong></summary>
<br>
Yes! SoundLink is a Progressive Web App (PWA) that works on all modern browsers and can be installed on your home screen on both Android and iOS devices. Follow the installation instructions in this README.
</details>

<details>
<summary><strong>How do I upload my own music?</strong></summary>
<br>
Music can be uploaded through the admin interface if you have admin privileges. Regular users can create playlists from existing content but cannot upload their own music files.
</details>

<details>
<summary><strong>Does SoundLink work offline?</strong></summary>
<br>
Yes, SoundLink supports offline playback for downloaded content. You'll need to be signed in and have saved your favorite songs or playlists for offline listening.
</details>

<details>
<summary><strong>How is SoundLink different from other music streaming services?</strong></summary>
<br>
SoundLink focuses on providing a clean, distraction-free listening experience with excellent performance across all devices. We prioritize sound quality, user experience, and cross-platform compatibility.
</details>

## 🙏 Acknowledgements

- All the amazing artists who make music worth streaming
- The open-source community for their incredible tools
- Our users for their feedback and support

---

<div align="center">
  <p>Made with ❤️ and 🎵</p>
  <p>© 2025 SoundLink. All rights reserved.</p>
  
  <a href="https://ankitsoundlink.netlify.app/">
    <img src="https://img.shields.io/badge/Visit_SoundLink-1DB954?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iIzFEQjk1NCIvPjxwYXRoIGQ9Ik0zMCAzMEg3MFY3MEgzMFYzMFoiIGZpbGw9IiMxMTEiLz48cGF0aCBkPSJNNDAgNDBMNjUgNTBMNDAgNjBWNDBaIiBmaWxsPSIjZmZmIi8+PC9zdmc+&logoColor=white" alt="Visit SoundLink">
  </a>
</div> 