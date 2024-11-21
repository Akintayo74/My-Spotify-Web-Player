import React, { useState } from 'react';

function SearchInput({ token, onSearchResults }) {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('track');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${searchType}&limit=10`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            onSearchResults(data[`${searchType}s`].items);
        } catch (err) {
            console.error('Search error:', err);
            setError('Unable to perform search. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tracks, artists, albums..."
                    className="search-input"
                />
                
                <select 
                    value={searchType} 
                    onChange={(e) => setSearchType(e.target.value)}
                    className="search-type-select"
                >
                    <option value="track">Tracks</option>
                    <option value="artist">Artists</option>
                    <option value="album">Albums</option>
                </select>
                
                <button 
                    type="submit" 
                    disabled={isLoading || !query.trim()}
                    className="search-button"
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <div className="search-error">{error}</div>}
        </div>
    );
}

export default SearchInput;