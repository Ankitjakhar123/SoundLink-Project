import React, { useState, useEffect, useRef } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import YouTubePlayer from './YouTubePlayer';
import { FaYoutube, FaPlay, FaPause, FaExpand, FaCompress } from 'react-icons/fa';

// YouTube Player States
const YT_STATES = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    VIDEO_CUED: 5
};

const YouTubePremiumPlayer = ({ currentYouTubeVideo }) => {
    const [currentVideoId, setCurrentVideoId] = useState(null);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const playerRef = useRef(null);
    const wasPlayingRef = useRef(false);

    // Update currentVideoId when currentYouTubeVideo changes
    useEffect(() => {
        if (currentYouTubeVideo) {
            setCurrentVideoId(currentYouTubeVideo.id);
            setIsPlaying(true); // Auto-play when new video is selected
        }
    }, [currentYouTubeVideo]);

    // Handle visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                wasPlayingRef.current = isPlaying;
            } else if (wasPlayingRef.current) {
                setIsPlaying(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isPlaying]);

    const handleYouTubeStateChange = (event) => {
        console.log('YouTube state changed:', event.data);
        switch (event.data) {
            case YT_STATES.PLAYING:
                setIsPlaying(true);
                break;
            case YT_STATES.PAUSED:
            case YT_STATES.ENDED:
                setIsPlaying(false);
                break;
            case YT_STATES.BUFFERING:
                // Keep the previous playing state during buffering
                break;
            default:
                break;
        }
    };

    const handleYouTubeReady = (event) => {
        console.log('YouTube player ready');
        playerRef.current = event.target;
        if (isPlaying) {
            event.target.playVideo();
        }
    };

    const handleYouTubeError = (event) => {
        console.error('YouTube player error:', event.data);
        setError(`Error playing video: ${event.data}`);
        setIsPlaying(false);
    };

    const togglePlayPause = () => {
        if (!playerRef.current) return;
        
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    if (error) {
        return (
            <div className="fixed bottom-16 right-4 z-[9999] p-4 bg-red-100 text-red-700 rounded-lg shadow-lg">
                {error}
                <button 
                    onClick={() => setError(null)}
                    className="ml-2 text-sm underline hover:text-red-800"
                >
                    Dismiss
                </button>
            </div>
        );
    }

    return (
        <div className={`youtube-premium-player fixed transition-all duration-300 ${
            isExpanded 
                ? 'inset-0 z-[9999] bg-black' 
                : 'h-16 left-0 right-0 bottom-0 z-50 bg-neutral-900'
        }`}>
            {/* Minimized Player */}
            <div className={`flex items-center justify-between px-4 h-16 ${isExpanded ? 'border-b border-white/10' : ''}`}>
                <div className="flex items-center flex-1 min-w-0">
                    {currentYouTubeVideo && (
                        <>
                            <img
                                src={currentYouTubeVideo.thumbnail}
                                alt={currentYouTubeVideo.title}
                                className="w-10 h-10 object-cover rounded"
                            />
                            <div className="ml-3 flex-1 min-w-0">
                                <h3 className="font-semibold text-sm text-white truncate">
                                    {currentYouTubeVideo.title}
                                </h3>
                                <p className="text-xs text-gray-400 truncate">
                                    {currentYouTubeVideo.channelTitle}
                                </p>
                            </div>
                        </>
                    )}
                </div>
                
                <div className="flex items-center space-x-4">
                    <button
                        onClick={togglePlayPause}
                        className="w-8 h-8 flex items-center justify-center text-white hover:text-fuchsia-500 transition-colors"
                    >
                        {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
                    </button>
                    <button
                        onClick={toggleExpand}
                        className="w-8 h-8 flex items-center justify-center text-white hover:text-fuchsia-500 transition-colors"
                    >
                        {isExpanded ? <FaCompress size={18} /> : <FaExpand size={18} />}
                    </button>
                </div>
            </div>

            {/* YouTube Player */}
            {currentVideoId && (
                <div 
                    className={`w-full bg-black transition-all duration-300 ${
                        isExpanded 
                            ? 'h-[calc(100%-4rem)] opacity-100' 
                            : 'h-0 opacity-0'
                    }`}
                >
                    <div className={`w-full h-full ${!isExpanded ? 'pointer-events-none' : ''}`}>
                        <YouTubePlayer
                            videoId={currentVideoId}
                            onStateChange={handleYouTubeStateChange}
                            onError={handleYouTubeError}
                            onReady={handleYouTubeReady}
                            className="w-full h-full"
                            isPlaying={isPlaying}
                            allowBackground={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default YouTubePremiumPlayer; 