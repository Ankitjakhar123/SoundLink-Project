import React, { useState, useRef, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { FaCrown, FaBars, FaUser, FaSignOutAlt, FaUserShield, FaCog, FaSearch, FaTimes, FaMusic, FaHeadphones, FaHeart, FaHome, FaList, FaEllipsisH, FaChevronUp, FaChevronDown, FaYoutube } from 'react-icons/fa';
import axios from 'axios';
import { PlayerContext } from '../../context/PlayerContext';
import QueueComponent from '../QueueComponent';
import { MdRadio } from 'react-icons/md';
import LazyImage from '../LazyImage';
import YouTubeService from '../../utils/youtubeService';
import SearchResultsSection from '../SearchResultsSection';

// Default avatar path - ensure this SVG file exists in the public directory
const DEFAULT_AVATAR = '/default-avatar.svg';

const Navbar = (props) => {
    const navigate = useNavigate()
    const [search, setSearch] = useState("")
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const inputRef = useRef(null)
    const searchResultsRef = useRef(null);
    const { user, logout } = useContext(AuthContext);
    const { playWithId, track, hidePlayer, togglePlayerVisibility, useYouTubePlayer, setUseYouTubePlayer, playYouTubeVideo } = useContext(PlayerContext);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileDropdownRef = useRef(null);
    const [showBottomNav, setShowBottomNav] = useState(true);
    const [showQueue, setShowQueue] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const touchStartY = useRef(null);
    const [youtubeResults, setYoutubeResults] = useState([]);
    const [isYoutubeSearching, setIsYoutubeSearching] = useState(false);

    // Mobile keyboard detection for iOS and Android
    useEffect(() => {
        const detectKeyboard = () => {
            // On iOS and many Android devices, when keyboard shows, the viewport height changes
            const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
            const windowHeight = window.innerHeight;
            
            // If the viewport height is significantly less than window height, keyboard is likely visible
            setIsKeyboardVisible(viewportHeight < windowHeight * 0.8);
        };
        
        window.addEventListener('resize', detectKeyboard);
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', detectKeyboard);
        }
        
        return () => {
            window.removeEventListener('resize', detectKeyboard);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', detectKeyboard);
            }
        };
    }, []);

    // Store user preference for bottom nav in localStorage
    useEffect(() => {
        const savedPref = localStorage.getItem('showBottomNav');
        if (savedPref !== null) {
            setShowBottomNav(savedPref === 'true');
        }
    }, []);

    // Handle click outside of dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Handle profile dropdown in header
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
            
            if (searchResultsRef.current && !searchResultsRef.current.contains(event.target) && 
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
            
            // Close search bar on small screens when clicking outside
            if (showSearchBar && window.innerWidth < 768 && 
                event.target.closest('.search-container') === null &&
                !event.target.closest('.search-button')) {
                setShowSearchBar(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSearchBar]);

    const handleLogout = () => {
        logout();
        navigate('/auth');
        setShowProfileDropdown(false);
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        
        if (!search.trim()) {
            setSearchResults(null);
            setYoutubeResults([]);
            setShowSearchResults(false);
            return;
        }
        
        setIsSearching(true);
        setIsYoutubeSearching(true);

        try {
            // Regular database search
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
            const response = await axios.get(`${backendUrl}/api/search?q=${encodeURIComponent(search)}`);
            
            if (response.data.success) {
                setSearchResults({...response.data, isFullSearch: false});
                setShowSearchResults(true);
            } else {
                setSearchResults(null);
            }

            // YouTube search
            const ytResults = await YouTubeService.searchVideos(search, true);
            setYoutubeResults(ytResults || []);

        } catch (error) {
            console.error('Search error:', error);
            setSearchResults(null);
            setYoutubeResults([]);
        } finally {
            setIsSearching(false);
            setIsYoutubeSearching(false);
        }
    };

    // Handle keydown events for the search input
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            // Prevent form submission and just trigger search
            e.preventDefault();
            handleSearch();
        }
    };

    const clearSearch = () => {
        setSearch('');
        setSearchResults(null);
        setShowSearchResults(false);
    };

    const toggleSearchBar = () => {
        setShowSearchBar(!showSearchBar);
        if (!showSearchBar) {
            // Focus the input when showing the search bar
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 100);
        }
    };

    const handleResultClick = (type, item) => {
        console.log('Database result clicked:', { type, item });
        setShowSearchResults(false);
        setShowSearchBar(false);
        
        switch(type) {
            case 'song':
                console.log('Playing song:', item._id);
                // Play the song directly instead of navigating to a song page
                playWithId(item._id);
                break;
            case 'album':
                navigate(`/album/${item._id}`);
                break;
            case 'artist':
                navigate(`/artist/${item._id}`);
                break;
            case 'user':
                // Check if there's a profile route; if not, handle appropriately
                navigate(`/profile/${item._id}`);
                break;
            default:
                break;
        }
    };

    const handleYouTubeResultClick = (video) => {
        console.log('YouTube result clicked:', video);
        setShowSearchResults(false);
        setShowSearchBar(false);
        setUseYouTubePlayer(true);
        playYouTubeVideo(video.id.videoId, video);
    };

    // Helper function to get the user's avatar URL
    const getUserAvatar = () => {
        if (!user) return null;
        
        // Try both avatar and image properties since either might be used in the API
        const avatarUrl = user.avatar || user.image;
        
        // No avatar URL available or using default avatar
        if (!avatarUrl || avatarUrl === '/default-avatar.png' || avatarUrl === '/default-avatar.svg') {
            return null;
        }
        
        // Check if it's a Cloudinary URL and ensure it's using HTTPS
        if (avatarUrl.includes('cloudinary.com')) {
            return avatarUrl.replace('http://', 'https://');
        }
        
        // If it's a data URL or base64 image, return it directly
        if (avatarUrl.startsWith('data:') || avatarUrl.startsWith('blob:')) {
            return avatarUrl;
        }
        
        // If it's a local path starting with /uploads, prepend the backend URL
        if (avatarUrl.startsWith('/uploads')) {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
            return `${backendUrl}${avatarUrl}`;
        }
        
        // Handle full URLs
        if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
            return avatarUrl;
        }
        
        // For other relative paths, also prepend backend URL
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
        return `${backendUrl}${avatarUrl}`;
    };

    const handleTouchStart = (e) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        if (touchStartY.current !== null) {
            const touchEndY = e.changedTouches[0].clientY;
            if (touchEndY - touchStartY.current > 50) { // 50px threshold
                setShowSearchResults(false);
            }
            touchStartY.current = null;
        }
    };

    return (
        <>
            <div className="w-full flex items-center justify-between py-2 px-2 md:py-3 md:px-8 bg-black fixed top-0 left-0 right-0 z-40 backdrop-blur-xl shadow-sm pt-[env(safe-area-inset-top)]">
                {/* Logo and company name for large screens */}
                <div className="hidden md:flex items-center cursor-pointer" onClick={() => navigate('/')}> 
                    <img src="/icons/soundlink-icon.svg?v=2" alt="SoundLink Logo" className="h-10 w-10 mr-3" />
                    <span className="text-xl font-bold text-white">SoundLink</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-neutral-900"></div>
                {/* Left: Mobile controls */}
                <div className="flex items-center gap-2 md:hidden">
                    {/* Hamburger for mobile */}
                    <button className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 transition text-white border border-neutral-800" onClick={props.onHamburgerClick}>
                        <FaBars className="w-5 h-5" />
                    </button>
                    
                    {/* Home Icon - show on all screens */}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 transition text-white border border-neutral-800"
                        title="Home"
                    >
                        <FaHome className="w-5 h-5" />
                    </button>
                </div>

                {/* Center: Search Bar - Shown on desktop or when activated on mobile */}
                <div className={`${showSearchBar ? 'absolute left-0 right-0 top-0 bottom-0 bg-black z-40 flex items-center px-2 py-2 pt-[calc(env(safe-area-inset-top)+1rem)]' : 'hidden'} md:flex md:static md:bg-transparent md:flex-1 md:justify-center md:px-0 md:py-0 search-container`}>
                    <form 
                        onSubmit={handleSearch}
                        className="relative flex items-center w-full max-w-md mx-auto bg-neutral-900 rounded-full shadow-md focus-within:ring-2 focus-within:ring-fuchsia-500 transition"
                    >
                        <FaSearch className="absolute left-4 text-neutral-400" size={18} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => search.trim() && setShowSearchResults(true)}
                            placeholder="Search for songs, albums, artists..."
                            className="pl-12 pr-12 py-3 bg-transparent outline-none border-none text-white flex-1 min-w-0 placeholder-neutral-500 rounded-full"
                            style={{ outline: 'none' }}
                            aria-label="Search"
                        />
                        {search && (
                            <button 
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-4 text-neutral-400 hover:text-white flex-shrink-0 focus:outline-none"
                                aria-label="Clear search"
                            >
                                <FaTimes size={18} />
                            </button>
                        )}
                        {isSearching && (
                            <div className="absolute right-12 w-4 h-4 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                    </form>
                    
                    {/* Search Results Dropdown */}
                    {showSearchResults && (
                        <div ref={searchResultsRef} className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-lg overflow-hidden max-h-[80vh] overflow-y-auto z-50">
                            <SearchResultsSection 
                                databaseResults={searchResults}
                                youtubeResults={youtubeResults}
                                onDatabaseResultClick={handleResultClick}
                                onYouTubeResultClick={handleYouTubeResultClick}
                                isSearching={isSearching}
                                isYoutubeSearching={isYoutubeSearching}
                            />
                        </div>
                    )}
                </div>

                {/* Right: Action buttons & Profile */}
                <div className='flex items-center gap-2 md:gap-4'>
                    {/* Mobile search button */}
                    <button 
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 transition text-white border border-neutral-800 search-button"
                        onClick={toggleSearchBar}
                        aria-label="Search"
                    >
                        <FaSearch className="w-5 h-5" />
                    </button>

                    {/* Library button - Hidden on smallest screens and when not logged in */}
                    {user && (
                        <button 
                            onClick={() => navigate('/library')}
                            className="hidden sm:flex md:flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-full border border-neutral-800 transition-colors text-sm"
                        >
                            <FaHeadphones className="text-fuchsia-400" />
                            <span className="hidden md:inline">Library</span>
                        </button>
                    )}

                    {/* Favorites button - hidden on smallest screens and when not logged in */}
                    {user && (
                        <button 
                            onClick={() => navigate('/favorites')}
                            className="hidden sm:flex md:flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-full border border-neutral-800 transition-colors text-sm"
                        >
                            <FaHeart className="text-fuchsia-400" />
                            <span className="hidden md:inline">Favorites</span>
                        </button>
                    )}

                    {/* Premium button */}
                    <button 
                        onClick={() => navigate('/premium')}
                        className="flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-full hover:scale-105 transition-transform text-sm md:text-base"
                    >
                        <FaCrown className="text-lg md:text-xl" />
                        <span className="hidden md:inline">Buy Premium</span>
                    </button>
                    
                    {/* Profile Dropdown or Sign In Button */}
                    <div className="relative" ref={profileDropdownRef}>
                        {user ? (
                            <>
                                <button 
                                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                    className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border-2 border-fuchsia-500 hover:border-fuchsia-400 transition-colors"
                                >
                                    {getUserAvatar() ? (
                                        <LazyImage 
                                            src={getUserAvatar()} 
                                            alt={user.username || 'User'} 
                                            className="w-full h-full object-cover"
                                            fallbackSrc="/default-avatar.svg"
                                            width={40}
                                            height={40}
                                            loadingStyles="bg-neutral-800 animate-pulse"
                                            onError={(e) => {
                                                e.target.parentNode.classList.add('bg-fuchsia-600');
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-fuchsia-600 flex items-center justify-center text-white font-bold text-lg">
                                            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                </button>
                                
                                {/* Dropdown Menu */}
                                {showProfileDropdown && (
                                    <div 
                                        className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg py-1 z-50 border border-neutral-700 max-h-[80vh] overflow-y-auto"
                                    >
                                        {/* User Info */}
                                        <div className="px-4 py-2 border-b border-neutral-700 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                                {getUserAvatar() ? (
                                                    <LazyImage 
                                                        src={getUserAvatar()} 
                                                        alt={user.username || 'User'} 
                                                        className="w-full h-full object-cover"
                                                        fallbackSrc="/default-avatar.svg"
                                                        width={32}
                                                        height={32}
                                                        loadingStyles="bg-neutral-800 animate-pulse"
                                                        onError={(e) => {
                                                            e.target.parentNode.classList.add('bg-fuchsia-600');
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-fuchsia-600 flex items-center justify-center text-white font-bold text-sm">
                                                        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white font-medium truncate">{user.username || 'User'}</p>
                                                <p className="text-neutral-400 text-sm truncate">{user.email || ''}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Menu Items */}
                                        <button 
                                            onClick={() => { navigate('/profile'); setShowProfileDropdown(false); }}
                                            className="w-full text-left px-4 py-2 text-white hover:bg-neutral-700 flex items-center gap-2"
                                        >
                                            <FaUser className="text-fuchsia-400" />
                                            Profile
                                        </button>
                                        
                                        {user.role === 'admin' && (
                                            <button 
                                                onClick={() => { navigate('/admin'); setShowProfileDropdown(false); }}
                                                className="w-full text-left px-4 py-2 text-white hover:bg-neutral-700 flex items-center gap-2"
                                            >
                                                <FaUserShield className="text-fuchsia-400" />
                                                Admin Dashboard
                                            </button>
                                        )}
                                        
                                        <button 
                                            onClick={() => { navigate('/settings'); setShowProfileDropdown(false); }}
                                            className="w-full text-left px-4 py-2 text-white hover:bg-neutral-700 flex items-center gap-2"
                                        >
                                            <FaCog className="text-fuchsia-400" />
                                            Settings
                                        </button>
                                        
                                        <div className="border-t border-neutral-700 my-1"></div>
                                        
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-red-400 hover:bg-neutral-700 flex items-center gap-2"
                                        >
                                            <FaSignOutAlt />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <button 
                                onClick={() => navigate('/auth')}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-medium rounded-full hover:shadow-lg hover:from-fuchsia-600 hover:to-purple-700 transition-all"
                            >
                                <FaUser className="text-sm" />
                                <span>Sign In</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation Bar - Only visible on small screens when preferred and no keyboard */}
            <div 
                className={`md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-neutral-900 py-1 px-3 z-[60] backdrop-blur-xl ${isKeyboardVisible || !showBottomNav ? 'hidden' : 'block'}`} 
            >
                <div className="flex items-center justify-between">
                    {/* Home */}
                    <button 
                        onClick={() => navigate('/')}
                        className="flex flex-col items-center"
                    >
                        <FaHome className="w-5 h-5 text-[#a855f7]" />
                        <span className="text-xs text-white">Home</span>
                    </button>

                    {/* Library */}
                    <button 
                        onClick={() => navigate('/library')}
                        className="flex flex-col items-center"
                    >
                        <FaHeadphones className="w-5 h-5 text-[#a855f7]" />
                        <span className="text-xs text-white">Library</span>
                    </button>

                    {/* Player Toggle Button in Center instead of SoundLink logo */}
                    {track ? (
                        <button 
                            onClick={togglePlayerVisibility}
                            className="flex flex-col items-center cursor-pointer"
                        >
                            {hidePlayer ? (
                                <>
                                    <FaChevronUp className="w-5 h-5 text-[#a855f7]" />
                                    <span className="text-xs text-white">Player</span>
                                </>
                            ) : (
                                <>
                                    <FaChevronDown className="w-5 h-5 text-[#a855f7]" />
                                    <span className="text-xs text-white">Player</span>
                                </>
                            )}
                        </button>
                    ) : (
                        <div 
                            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                            className="flex flex-col items-center cursor-pointer"
                        >
                            <img src="/icons/soundlink-icon.svg?v=2" alt="SoundLink" className="h-7 w-7" />
                            <span className="text-xs text-white">SoundLink</span>
                        </div>
                    )}

                    {/* Queue */}
                    <button 
                        onClick={() => setShowQueue(!showQueue)}
                        className="flex flex-col items-center"
                    >
                        <FaList className="w-5 h-5 text-[#a855f7]" />
                        <span className="text-xs text-white">Queue</span>
                    </button>

                    {/* Radio */}
                    <button 
                        onClick={() => navigate('/radio')}
                        className="flex flex-col items-center"
                    >
                        <MdRadio className="w-5 h-5 text-[#a855f7]" />
                        <span className="text-xs text-white">Radio</span>
                    </button>
                </div>
            </div>
            
            {/* Queue panel */}
            <QueueComponent isOpen={showQueue} onClose={() => setShowQueue(false)} />
        </>
    )
}

// Search Results Component
const SearchResults = ({ results, onResultClick }) => {
    return (
        <div className="search-results">
            {/* Regular search results */}
            {results && Object.entries(results).map(([category, items]) => (
                items.length > 0 && (
                    <ResultSection
                        key={category}
                        title={category.charAt(0).toUpperCase() + category.slice(1)}
                        items={items}
                        type={category}
                        onResultClick={onResultClick}
                        showAll={results.isFullSearch}
                    />
                )
            ))}

            {/* YouTube Results */}
            {youtubeResults && youtubeResults.length > 0 && (
                <div className="mt-4 border-t border-white/10 pt-4">
                    <div className="flex items-center mb-2">
                        <FaYoutube className="text-red-600 mr-2 text-xl" />
                        <h3 className="text-white font-semibold">YouTube Results</h3>
                    </div>
                    <div className="space-y-2">
                        {youtubeResults.map((video) => (
                            <div
                                key={video.id.videoId}
                                className="flex items-center space-x-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                                onClick={() => handleYouTubeResultClick(video)}
                            >
                                <img
                                    src={video.snippet.thumbnails.default.url}
                                    alt={video.snippet.title}
                                    className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white text-sm font-medium truncate">
                                        {video.snippet.title}
                                    </h4>
                                    <p className="text-gray-400 text-xs truncate">
                                        {video.snippet.channelTitle}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Results Message */}
            {!isSearching && !isYoutubeSearching && 
             (!results || Object.values(results).every(arr => arr.length === 0)) && 
             (!youtubeResults || youtubeResults.length === 0) && (
                <div className="text-white text-center py-4">
                    No results found
                </div>
            )}
        </div>
    );
};

// Result Section Component
const ResultSection = ({ title, items, type, onResultClick, showAll }) => {
    return (
        <div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                {title} {!showAll && items.length > 3 && <span>({items.length} total)</span>}
            </h3>
            <div className="space-y-2">
                {items.map(item => (
                    <div 
                        key={item._id}
                        className="flex items-center gap-3 p-2 hover:bg-neutral-700 rounded-lg cursor-pointer transition-colors"
                        onClick={() => onResultClick(type, item)}
                    >
                        <div className="w-10 h-10 rounded bg-neutral-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {item.image ? (
                                <img src={item.image} alt={item.name || item.username} className="w-full h-full object-cover" />
                            ) : (
                                <FaMusic className="text-neutral-500" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-white font-medium truncate max-w-[200px]">{item.name || item.username}</p>
                            <p className="text-neutral-400 text-sm truncate max-w-[200px]">{item.desc || item.bio || (type === 'user' ? 'User' : '')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Navbar