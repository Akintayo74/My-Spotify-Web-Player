import React from 'react';

function SearchResults({ results, searchType, onPlayTrack }) {
    if (!results || results.length === 0) {
        return <div className="search-results-empty">No results found</div>;
    }

    const renderTrackItem = (track, isFeatured = false) => (
        <div key={track.id} className={`search-result-item track-item ${isFeatured ? 'featured' : ''}`}>
            <img 
                src={track.album.images[0]?.url || '/placeholder-image.png'} 
                alt={track.name} 
                className="result-image"
            />
            <div className="result-details">
                <div className="result-name">{track.name}</div>
                <div className="result-artist">{track.artists[0].name}</div>
                <div className="result-album">{track.album.name}</div>
                {onPlayTrack && (
                    <button 
                        onClick={() => onPlayTrack(track)} 
                        className="play-button"
                    >
                        Play
                    </button>
                )}
            </div>
        </div>
    );

    const renderArtistItem = (artist, isFeatured = false) => (
        <div key={artist.id} className={`search-result-item artist-item ${isFeatured ? 'featured' : ''}`}>
            <img 
                src={artist.images[0]?.url || '/placeholder-image.png'} 
                alt={artist.name} 
                className="result-image"
            />
            <div className="result-details">
                <div className="result-name">{artist.name}</div>
                <div className="result-genres">{artist.genres.join(', ')}</div>
            </div>
        </div>
    );

    const renderAlbumItem = (album, isFeatured = false) => (
        <div key={album.id} className={`search-result-item album-item ${isFeatured ? 'featured' : ''}`}>
            <img 
                src={album.images[0]?.url || '/placeholder-image.png'} 
                alt={album.name} 
                className="result-image"
            />
            <div className="result-details">
                <div className="result-name">{album.name}</div>
                <div className="result-artist">{album.artists[0].name}</div>
                <div className="result-year">{album.release_date}</div>
            </div>
        </div>
    );

    const renderItems = () => {
        const limitedResults = results.slice(0, 5);
        const firstResult = limitedResults[0];
        const remainingResults = limitedResults.slice(1);

        const getItemByType = (item, isFeatured = false) => {
            switch(searchType) {
                case 'track':
                    return renderTrackItem(item, isFeatured);
                case 'artist':
                    return renderArtistItem(item, isFeatured);
                case 'album':
                    return renderAlbumItem(item, isFeatured);
                default:
                    return null;
            }
        };

        return (
            <div className='search-results'>
                <div className="featured-result">
                    {getItemByType(firstResult, true)}
                </div>
                <div className="remaining-results">
                    {remainingResults.map(item => getItemByType(item, false))}
                </div>
            </div>
        );
    }

    return (
        <div className="search-results-container">
            <h3>Search Results</h3>
            <div className="search-results-grid">
                {renderItems()}
            </div>
        </div>
    );
}

export default SearchResults;