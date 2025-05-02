import React, { useState, useRef, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { FaCrown, FaBars, FaUser, FaSignOutAlt, FaUserShield, FaCog, FaSearch, FaTimes, FaMusic, FaHeadphones, FaHeart, FaHome, FaList, FaEllipsisH, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import axios from 'axios';
import { PlayerContext } from '../context/PlayerContext';
import QueueComponent from './QueueComponent';

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
    const { playWithId, track, hidePlayer, togglePlayerVisibility } = useContext(PlayerContext);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showMobileDropdown, setShowMobileDropdown] = useState(false);
    const profileDropdownRef = useRef(null);
    const mobileDropdownRef = useRef(null);
    const [showBottomNav, setShowBottomNav] = useState(true);
    const [showQueue, setShowQueue] = useState(false);

    // Mobile keyboard detection for iOS and Android
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    
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
            
            // Handle mobile bottom menu dropdown 
            if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
                setShowMobileDropdown(false);
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
        setShowMobileDropdown(false);
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        
        if (!search.trim()) {
            setSearchResults(null);
            setShowSearchResults(false);
            return;
        }
        
        // If on mobile or user presses Enter, redirect to the search page 
        if ((window.innerWidth < 768 && showSearchBar) || e?.type === 'submit') {
            navigate(`/search?q=${encodeURIComponent(search)}`);
            setShowSearchBar(false);
            return;
        }
        
        setIsSearching(true);
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
            const response = await axios.get(`${backendUrl}/api/search?q=${encodeURIComponent(search)}`);
            
            if (response.data.success) {
                setSearchResults(response.data);
                setShowSearchResults(true);
            } else {
                setSearchResults(null);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults(null);
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
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
        setShowSearchResults(false);
        setShowSearchBar(false);
        
        switch(type) {
            case 'song':
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

    // Helper function to get the user's avatar URL
    const getUserAvatar = () => {
        if (!user) return null;
        
        // Try both avatar and image properties since either might be used in the API
        const avatarUrl = user.avatar || user.image;
        
        // Log the avatar URL for debugging
        console.log("Original Avatar URL in Navbar:", avatarUrl);
        console.log("User object in Navbar:", user);
        
        // No avatar URL available
        if (!avatarUrl) {
            console.log("No avatar URL found, using default");
            return '/default-avatar.svg';
        }
        
        // Add cache-busting parameter to prevent browser caching
        const addCacheBuster = (url) => {
            if (!url) return url;
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}t=${new Date().getTime()}`;
        };
        
        // Check if it's a Cloudinary URL and ensure it's using HTTPS
        if (avatarUrl.includes('cloudinary.com')) {
            const fixedUrl = avatarUrl.replace('http://', 'https://');
            console.log("Cloudinary URL fixed:", fixedUrl);
            return addCacheBuster(fixedUrl);
        }
        
        // If it's a data URL or base64 image, return it directly
        if (avatarUrl.startsWith('data:') || avatarUrl.startsWith('blob:')) {
            console.log("Data/Blob URL detected");
            return avatarUrl; // No need for cache buster on blob URLs
        }
        
        // If it's a local path starting with /uploads, prepend the backend URL
        if (avatarUrl.startsWith('/uploads')) {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
            const fullUrl = `${backendUrl}${avatarUrl}`;
            console.log("Local upload URL constructed:", fullUrl);
            return addCacheBuster(fullUrl);
        }
        
        // Handle full URLs
        if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
            console.log("Full URL detected");
            return addCacheBuster(avatarUrl);
        }
        
        // For other relative paths, also prepend backend URL
        if (!avatarUrl.startsWith('/')) {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
            const fullUrl = `${backendUrl}/${avatarUrl}`;
            console.log("Relative path converted:", fullUrl);
            return addCacheBuster(fullUrl);
        }
        
        // For any other case, just return the URL as is
        console.log("Using URL as is");
        return addCacheBuster(avatarUrl);
    };

    return (
        <>
            <div className="w-full flex items-center justify-between py-2 px-2 md:py-3 md:px-8 bg-black sticky top-0 z-30 backdrop-blur-xl">
                {/* Left: Mobile controls */}
                <div className="flex items-center gap-2">
                    {/* Hamburger for mobile */}
                    <button className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 transition text-white border border-neutral-800" onClick={props.onHamburgerClick}>
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
                <div className={`${showSearchBar ? 'absolute left-0 right-0 top-0 bottom-0 bg-black z-40 px-2 py-2' : 'hidden'} md:flex md:static md:bg-transparent md:flex-1 md:justify-center md:px-0 md:py-0 search-container`}>
                    <form 
                        onSubmit={handleSearch}
                        className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-neutral-900/80 border border-neutral-800 transition-all duration-300 ring-0 focus-within:border-fuchsia-500 w-full max-w-md`}
                    >
                        <FaSearch className="text-neutral-400 flex-shrink-0" size={16} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => search.trim() && setShowSearchResults(true)}
                            placeholder="Search for songs, albums, artists..."
                            className="bg-transparent outline-none border-none text-white flex-1 min-w-0 placeholder-neutral-500"
                        />
                        {search && (
                            <button 
                                type="button"
                                onClick={clearSearch}
                                className="text-neutral-400 hover:text-white flex-shrink-0"
                            >
                                <FaTimes size={16} />
                            </button>
                        )}
                        {isSearching && (
                            <div className="w-4 h-4 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {/* Mobile Close Button */}
                        <button 
                            type="button"
                            onClick={() => setShowSearchBar(false)}
                            className="md:hidden ml-2 text-neutral-400 hover:text-white flex-shrink-0"
                        >
                            <FaTimes size={18} />
                        </button>
                    </form>
                    
                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults && (
                        <div 
                            ref={searchResultsRef}
                            className="absolute top-full left-0 right-0 mt-2 mx-auto max-w-md z-50 bg-neutral-800 rounded-xl shadow-xl max-h-[80vh] overflow-y-auto border border-neutral-700"
                        >
                            <div className="p-4">
                                <SearchResults 
                                    results={searchResults} 
                                    onResultClick={handleResultClick}
                                />
                                <div className="mt-3 flex justify-center">
                                    <button 
                                        onClick={() => {
                                            navigate(`/search?q=${encodeURIComponent(search)}`);
                                            setShowSearchResults(false);
                                            setShowSearchBar(false);
                                        }}
                                        className="text-fuchsia-400 hover:text-fuchsia-300 text-sm font-medium"
                                    >
                                        See all results
                                    </button>
                                </div>
                            </div>
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
                                        <img 
                                            src={getUserAvatar()} 
                                            alt={user.username || 'User'} 
                                            className="w-full h-full object-cover"
                                            loading="eager"
                                            onLoad={(e) => {
                                                console.log("Avatar loaded successfully in Navbar:", e.target.src);
                                            }}
                                            onError={(e) => {
                                                console.error("Failed to load avatar in Navbar:", e.target.src);
                                                e.target.onerror = null;
                                                e.target.src = '/default-avatar.svg';
                                            }}
                                        />
                                    ) : (
                                        <FaUser className="text-white text-lg" />
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
                                                <img 
                                                    src={getUserAvatar()} 
                                                    alt={user.username || 'User'} 
                                                    className="w-full h-full object-cover"
                                                    loading="eager"
                                                    onLoad={(e) => {
                                                        console.log("Dropdown avatar loaded successfully:", e.target.src);
                                                    }}
                                                    onError={(e) => {
                                                        console.error("Failed to load avatar in dropdown:", e.target.src);
                                                        e.target.onerror = null;
                                                        e.target.src = '/default-avatar.svg';
                                                    }}
                                                />
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
                className={`md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-neutral-800 py-1 px-3 z-[60] backdrop-blur-xl ${isKeyboardVisible || !showBottomNav ? 'hidden' : 'block'}`} 
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
                            <img src="/icons/soundlink-icon.svg" alt="SoundLink" className="h-7 w-7" />
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

                    {/* More (Three dots) */}
                    <button 
                        onClick={() => setShowMobileDropdown(!showMobileDropdown)}
                        className="flex flex-col items-center more-button relative"
                    >
                        <FaEllipsisH className="w-5 h-5 text-[#a855f7]" />
                        <span className="text-xs text-white">More</span>
                        
                        {/* Mobile more menu dropdown */}
                        {showMobileDropdown && (
                            <div 
                                ref={mobileDropdownRef}
                                className="absolute bottom-full mb-2 right-0 w-40 rounded-lg overflow-hidden bg-neutral-800 shadow-lg border border-neutral-700 z-[100]"
                                style={{transform: 'translateY(-50px)'}}
                            >
                                {/* Only show Playlists option for small screens */}
                                <button 
                                    onClick={() => { navigate('/playlists'); setShowMobileDropdown(false); }}
                                    className="w-full text-left px-4 py-2 text-white hover:bg-neutral-700 flex items-center gap-2"
                                >
                                    <FaList className="text-fuchsia-400" />
                                    Playlists
                                </button>
                            </div>
                        )}
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
    const hasResults = results.songs?.length > 0 || 
                      results.albums?.length > 0 || 
                      results.artists?.length > 0 || 
                      results.users?.length > 0;
                      
    if (!hasResults) {
        return (
            <div className="text-center py-4">
                <p className="text-neutral-400">No results found</p>
            </div>
        );
    }
    
    return (
        <div className="grid gap-6">
            {results.songs && results.songs.length > 0 && (
                <ResultSection 
                    title="Songs" 
                    items={results.songs.slice(0, 3)} 
                    type="song"
                    onResultClick={onResultClick}
                />
            )}
            
            {results.albums && results.albums.length > 0 && (
                <ResultSection 
                    title="Albums" 
                    items={results.albums.slice(0, 3)} 
                    type="album"
                    onResultClick={onResultClick}
                />
            )}
            
            {results.artists && results.artists.length > 0 && (
                <ResultSection 
                    title="Artists" 
                    items={results.artists.slice(0, 3)} 
                    type="artist"
                    onResultClick={onResultClick}
                />
            )}
            
            {results.users && results.users.length > 0 && (
                <ResultSection 
                    title="Users" 
                    items={results.users.slice(0, 3)} 
                    type="user"
                    onResultClick={onResultClick}
                />
            )}
        </div>
    );
};

// Result Section Component
const ResultSection = ({ title, items, type, onResultClick }) => {
    return (
        <div>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">{title}</h3>
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
                        <div className="min-w-0">
                            <p className="text-white font-medium truncate">{item.name || item.username}</p>
                            <p className="text-neutral-400 text-sm truncate">{item.desc || item.bio || (type === 'user' ? 'User' : '')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Navbar