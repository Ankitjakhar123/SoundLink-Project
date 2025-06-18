import React, { useEffect, useState, useRef } from 'react';
import YouTubeService from '../../utils/youtubeService';

const YouTubePlayer = ({ 
    videoId, 
    onStateChange, 
    onReady,
    onError,
    className,
    isPlaying,
    allowBackground = false
}) => {
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [isAPILoaded, setIsAPILoaded] = useState(false);
    const [playerId] = useState(`youtube-player-${Math.random().toString(36).substr(2, 9)}`);
    const lastTimeRef = useRef(0);
    const wasPlayingRef = useRef(false);

    // Load YouTube IFrame API
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                setIsAPILoaded(true);
            };
        } else {
            setIsAPILoaded(true);
        }

        return () => {
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch (error) {
                    console.error('Error destroying player:', error);
                }
                playerRef.current = null;
            }
        };
    }, []);

    // Initialize player when API is loaded
    useEffect(() => {
        if (!isAPILoaded || !containerRef.current || playerRef.current) return;

        try {
            playerRef.current = new window.YT.Player(playerId, {
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 1,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    fs: 1,
                    playsinline: 1,
                    origin: window.location.origin,
                    enablejsapi: 1
                },
                events: {
                    onReady: (event) => {
                        setIsReady(true);
                        if (onReady) onReady(event);
                    },
                    onStateChange: (event) => {
                        // Store current time when playing
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            lastTimeRef.current = event.target.getCurrentTime();
                        }
                        if (onStateChange) onStateChange(event);
                    },
                    onError: (event) => {
                        if (onError) onError(event);
                    }
                }
            });
        } catch (error) {
            console.error('Error initializing YouTube player:', error);
        }
    }, [isAPILoaded, videoId, playerId, onReady, onStateChange, onError]);

    // Update video when videoId changes
    useEffect(() => {
        if (isReady && playerRef.current && videoId) {
            try {
                playerRef.current.loadVideoById({
                    videoId: videoId,
                    startSeconds: 0,
                    suggestedQuality: 'default'
                });
            } catch (error) {
                console.error('Error loading video:', error);
            }
        }
    }, [videoId, isReady]);

    // Handle play/pause state changes
    useEffect(() => {
        if (!isReady || !playerRef.current) return;

        try {
            if (isPlaying) {
                playerRef.current.playVideo();
            } else {
                playerRef.current.pauseVideo();
            }
        } catch (error) {
            console.error('Error controlling playback:', error);
        }
    }, [isPlaying, isReady]);

    // Handle background playback
    useEffect(() => {
        if (!allowBackground) return;

        const handleVisibilityChange = () => {
            if (!playerRef.current || !isReady) return;

            try {
                if (document.hidden) {
                    // Store current state before going to background
                    wasPlayingRef.current = playerRef.current.getPlayerState() === 1; // 1 = playing
                    lastTimeRef.current = playerRef.current.getCurrentTime();
                } else {
                    // Restore state when coming back
                    if (wasPlayingRef.current) {
                        playerRef.current.seekTo(lastTimeRef.current);
                        if (isPlaying) {
                            playerRef.current.playVideo();
                        }
                    }
                }
            } catch (error) {
                console.error('Error handling visibility change:', error);
            }
        };

        // Handle page visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Handle window focus changes
        window.addEventListener('focus', handleVisibilityChange);
        window.addEventListener('blur', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleVisibilityChange);
            window.removeEventListener('blur', handleVisibilityChange);
        };
    }, [isReady, isPlaying, allowBackground]);

    return (
        <div className={`youtube-player-wrapper relative w-full h-full ${className || ''}`} ref={containerRef}>
            <div id={playerId} className="youtube-player absolute inset-0" />
        </div>
    );
};

export default YouTubePlayer; 