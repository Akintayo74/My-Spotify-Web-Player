{/* 
  Visual representation of component hierarchy and class structure
  Components remain in separate files - this is for CSS reference only
*/}

// Main App Container
<div className="app-container">
  {/* Main Content Area */}
  <div className="main-content">
    {/* Search Section */}
    <div className="search-wrapper">
      {/* Search Input Component */}
      <div className="search-container">
        <form className="search-form">
          <div className="search-input-wrapper">
            <i className="search-icon" />
            <input className="search-input" />
          </div>
        </form>
        <div className="search-error" />
      </div>

      {/* Search Results Component */}
      <div className="search-results-container">
        <h3>Search Results</h3>
        <div className="search-results-grid">
          <div className="search-results">
            {/* Featured Result */}
            <div className="featured-result">
              <div className="search-result-item track-item featured">
                <img className="result-image" />
                <div className="result-details">
                  <div className="result-name" />
                  <div className="result-artist" />
                  <div className="result-album" />
                  <button className="play-button" />
                </div>
              </div>
            </div>

            {/* Remaining Results */}
            <div className="remaining-results">
              <div className="search-result-item track-item">
                {/* Same structure as featured item */}
              </div>
              <div className="search-result-item artist-item">
                <img className="result-image" />
                <div className="result-details">
                  <div className="result-name" />
                  <div className="result-genres" />
                </div>
              </div>
              <div className="search-result-item album-item">
                <img className="result-image" />
                <div className="result-details">
                  <div className="result-name" />
                  <div className="result-artist" />
                  <div className="result-year" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="main-wrapper">
      {/* Main content placeholder */}
    </div>
  </div>

  {/* Sidebar */}
  <div className="sidebar">
    <img className="sidebar-album-cover" />
    <div className="now-playing__name" />
    <div className="now-playing__artist" />
    
    <div className="sidebar-player-controls">
      <button className="btn-spotify" />
      <button className="btn-spotify" />
      <button className="btn-spotify" />
    </div>
  </div>

  {/* Seek Bar */}
  <div className="seek-bar-container">
    <div className="seek-bar">
      <span className="time-position" />
      <input className="seek-slider" />
      <span className="time-duration" />
    </div>
  </div>
</div>