import React, { useState, useRef, useContext, useEffect } from 'react';
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { FaCrown, FaBars, FaUser, FaSignOutAlt, FaUserShield, FaCog, FaSearch, FaTimes, FaMusic, FaHeadphones, FaHeart } from 'react-icons/fa';
import axios from 'axios';

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
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Handle click outside of dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
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
        navigate('/login');
        setShowDropdown(false);
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
                navigate(`/song/${item._id}`);
                break;
            case 'album':
                navigate(`/album/${item._id}`);
                break;
            case 'artist':
                navigate(`/artist/${item._id}`);
                break;
            case 'user':
                navigate(`/profile/${item._id}`);
                break;
            default:
                break;
        }
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
                    {/* Home Icon */}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-neutral-900 hover:bg-neutral-800 transition text-white border border-neutral-800"
                        title="Home"
                    >
                        <img className="w-5 md:w-6" src={assets.home_icon} alt="Home" />
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

                    {/* Library button - Hidden on smallest screens */}
                    <button 
                        onClick={() => navigate('/library')}
                        className="hidden sm:flex md:flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-full border border-neutral-800 transition-colors text-sm"
                    >
                        <FaHeadphones className="text-fuchsia-400" />
                        <span className="hidden md:inline">Library</span>
                    </button>

                    {/* Favorites button - hidden on smallest screens */}
                    <button 
                        onClick={() => navigate('/favorites')}
                        className="hidden sm:flex md:flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-full border border-neutral-800 transition-colors text-sm"
                    >
                        <FaHeart className="text-fuchsia-400" />
                        <span className="hidden md:inline">Favorites</span>
                    </button>

                    {/* Premium button */}
                    <button 
                        onClick={() => navigate('/premium')}
                        className="flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-full hover:scale-105 transition-transform text-sm md:text-base"
                    >
                        <FaCrown className="text-lg md:text-xl" />
                        <span className="hidden md:inline">Buy Premium</span>
                    </button>
                    
                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border-2 border-fuchsia-500 hover:border-fuchsia-400 transition-colors"
                        >
                            {user && user.image ? (
                                <img 
                                    src={user.image} 
                                    alt={user.username} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/default-avatar.png';
                                    }}
                                />
                            ) : (
                                <FaUser className="text-white text-lg" />
                            )}
                        </button>
                        
                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg py-1 z-50 border border-neutral-700">
                                {/* User Info */}
                                <div className="px-4 py-2 border-b border-neutral-700">
                                    <p className="text-white font-medium truncate">{user?.username || 'User'}</p>
                                    <p className="text-neutral-400 text-sm truncate">{user?.email || ''}</p>
                                </div>
                                
                                {/* Menu Items */}
                                <button 
                                    onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                                    className="w-full text-left px-4 py-2 text-white hover:bg-neutral-700 flex items-center gap-2"
                                >
                                    <FaUser className="text-fuchsia-400" />
                                    Profile
                                </button>
                                
                                {user && user.role === 'admin' && (
                                    <button 
                                        onClick={() => { navigate('/admin'); setShowDropdown(false); }}
                                        className="w-full text-left px-4 py-2 text-white hover:bg-neutral-700 flex items-center gap-2"
                                    >
                                        <FaUserShield className="text-fuchsia-400" />
                                        Admin Dashboard
                                    </button>
                                )}
                                
                                <button 
                                    onClick={() => { navigate('/settings'); setShowDropdown(false); }}
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
                    </div>
                </div>
            </div>
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