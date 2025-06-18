import React from 'react';
import { FaYoutube } from 'react-icons/fa';

const SearchResultsSection = ({ 
    databaseResults, 
    youtubeResults, 
    onDatabaseResultClick, 
    onYouTubeResultClick,
    isSearching,
    isYoutubeSearching
}) => {
    const ResultSection = ({ title, items, type, onResultClick, showAll }) => {
        const itemsToShow = showAll ? items : items.slice(0, 3);
        
        const handleItemClick = (item) => {
            console.log('Result item clicked:', { type, item });
            onResultClick(type, item);
        };
        
        return (
            <div className="mb-4">
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <div className="space-y-2">
                    {itemsToShow.map((item) => (
                        <div
                            key={item._id}
                            className="flex items-center space-x-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                            onClick={() => handleItemClick(item)}
                        >
                            <img
                                src={item.image || '/default-album.png'}
                                alt={item.title || item.name}
                                className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-white text-sm font-medium truncate">
                                    {item.title || item.name}
                                </h4>
                                <p className="text-gray-400 text-xs truncate">
                                    {type === 'song' ? item.artist : (type === 'album' ? 'Album' : type)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const handleYouTubeClick = (video) => {
        console.log('YouTube video clicked:', video);
        onYouTubeResultClick(video);
    };

    if (isSearching || isYoutubeSearching) {
        return <div className="text-white p-4">Searching...</div>;
    }

    if (!databaseResults && (!youtubeResults || youtubeResults.length === 0)) {
        return <div className="text-white text-center py-4">No results found</div>;
    }

    return (
        <div className="search-results p-4">
            {/* Database Results */}
            {databaseResults && Object.entries(databaseResults).map(([category, items]) => (
                items.length > 0 && (
                    <ResultSection
                        key={category}
                        title={category.charAt(0).toUpperCase() + category.slice(1)}
                        items={items}
                        type={category}
                        onResultClick={onDatabaseResultClick}
                        showAll={databaseResults.isFullSearch}
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
                                onClick={() => handleYouTubeClick(video)}
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
        </div>
    );
};

export default SearchResultsSection; 