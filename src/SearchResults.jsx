import React from 'react';

function SearchResults({ results, searchType, onPlayTrack }) {
    if (!results || results.length === 0) {
        return <div className="search-results-empty">No results found</div>;
    }

    const renderTrackItem = (track) => (
        <div key={track.id} className="search-result-item track-item">
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

    const renderArtistItem = (artist) => (
        <div key={artist.id} className="search-result-item artist-item">
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

    const renderAlbumItem = (album) => (
        <div key={album.id} className="search-result-item album-item">
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

        const limitedResults = results.slice(0, 5)

        const firstResult = limitedResults[0];
        const remainingResults = limitedResults.slice(1);

        const getItemByType = (item) => {
            switch(searchType) {
                case 'track':
                    return renderTrackItem(item);
                case 'artist':
                    return renderArtistItem(item);
                case 'album':
                    return renderAlbumItem(item); 
                default:
                    return null;
            }
        };
        
    

        return (
            <div className='search-results'>
                <div className="featured-result">
                    {getItemByType(firstResult)}
                </div>
                <div className="remaining-results">
                    {remainingResults.map(item => getItemByType(item))}
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