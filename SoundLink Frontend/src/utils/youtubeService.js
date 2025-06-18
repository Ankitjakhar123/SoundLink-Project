const YOUTUBE_API_KEY = 'AIzaSyAnpKfM4TXIwIXovM73PBQUZxEYl_5Y0ss'; // Replace with your API key

class YouTubeService {
    static async searchVideos(query, isDirectSearch = false) {
        console.log('Searching YouTube videos:', { query, isDirectSearch });
        try {
            // Add music-specific parameters
            const searchParams = new URLSearchParams({
                part: 'snippet',
                q: isDirectSearch ? query : `${query} audio song`,
                type: 'video',
                videoCategoryId: '10', // Music category
                videoLicense: 'any',
                key: YOUTUBE_API_KEY,
                maxResults: '5', // Limit to 5 results to save quota
                videoEmbeddable: 'true',
                fields: 'items(id/videoId,snippet/title,snippet/channelTitle,snippet/thumbnails/default)', // Only get fields we need
                safeSearch: 'none' // Reduce quota usage
            });

            const url = `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`;
            console.log('Making YouTube API request:', url);

            const response = await fetch(url);
            const data = await response.json();
            
            if (!response.ok) {
                console.error('YouTube API error:', data.error);
                throw new Error(data.error?.message || 'YouTube API error');
            }
            
            console.log('YouTube search results:', data.items);
            return data.items;
        } catch (error) {
            console.error('YouTube search error:', error);
            throw error;
        }
    }

    static async getVideoDetails(videoId) {
        console.log('Getting video details for:', videoId);
        try {
            const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}&fields=items(id,snippet)`;
            console.log('Making YouTube API request:', url);

            const response = await fetch(url);
            const data = await response.json();
            
            if (!response.ok) {
                console.error('YouTube API error:', data.error);
                throw new Error(data.error?.message || 'YouTube API error');
            }
            
            if (!data.items || data.items.length === 0) {
                throw new Error('Video not found');
            }

            console.log('Video details:', data.items[0]);
            return data.items[0];
        } catch (error) {
            console.error('Error fetching video details:', error);
            throw error;
        }
    }

    static formatDuration(duration) {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        
        const hours = (match[1] || '').replace('H', '');
        const minutes = (match[2] || '').replace('M', '');
        const seconds = (match[3] || '').replace('S', '');
        
        let formatted = '';
        if (hours) formatted += `${hours}:`;
        formatted += `${minutes.padStart(2, '0')}:`;
        formatted += seconds.padStart(2, '0');
        
        return formatted;
    }

    // Helper method to extract audio URL from YouTube video
    static getAudioUrl(videoId) {
        return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=0&showinfo=0&modestbranding=1&rel=0&playsinline=1`;
    }

    static validateVideoId(videoId) {
        if (!videoId || typeof videoId !== 'string') {
            throw new Error('Invalid video ID');
        }
        // YouTube video IDs are typically 11 characters
        if (videoId.length !== 11) {
            throw new Error('Invalid video ID length');
        }
        return true;
    }
}

export default YouTubeService; 