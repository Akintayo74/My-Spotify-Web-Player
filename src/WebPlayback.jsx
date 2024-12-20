import React, { useState, useEffect, useCallback, useRef } from "react";
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';


const track = {
    name: "",
    album: {
        images: [{ url: "" }],
    },
    artists: [{ name: "" }],
};

function WebPlayback(props) {
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [current_track, setTrack] = useState(track);
    const [isInitialized, setIsInitialized] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState('track');
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const playerRef = useRef(null);
    const initializationTimer = useRef(null);
    const stateCheckInterval = useRef(null);

    // Add new function to check playback state
    const checkPlaybackState = useCallback(async () => {
        if (!playerRef.current || !isInitialized) return;

        const state = await playerRef.current.getCurrentState();
        if (!state) {
            console.error('User is not playing music through the Web Playback SDK');
            setActive(false);
            return;
        }

        setTrack(state.track_window.current_track);
        setPaused(state.paused);
        setPosition(state.position);
        setDuration(state.duration);
        setActive(true);
    }, [isInitialized]);


    const handleSeek = useCallback(async (event) => {
        const seekPosition = parseInt(event.target.value);
        if (!playerRef.current || !isInitialized) return;

        await playerRef.current.seek(seekPosition);
        setPosition(seekPosition);
    }, [isInitialized]);

    // Format time in MM:SS
    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };



    const transferPlaybackHere = useCallback(async (deviceId) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            const response = await fetch("https://api.spotify.com/v1/me/player", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${props.token}`,
                },
                body: JSON.stringify({
                    device_ids: [deviceId],
                    play: true,
                }),
            });
            
            if (response.status === 204) {
                console.log("Playback transferred successfully");
                setActive(true);
            } else if (response.status === 404) {
                console.log("No active device found. Please start playing on any Spotify app first.");
            } else {
                console.error("Failed to transfer playback:", response.status);
            }
        } catch (error) {
            console.error("Error transferring playback:", error);
        }
    }, [props.token]);


    useEffect(() => {
        if (isInitialized) {
            stateCheckInterval.current = setInterval(checkPlaybackState, 1000);
            return () => {
                if (stateCheckInterval.current) {
                    clearInterval(stateCheckInterval.current);
                }
            };
        }
    }, [isInitialized, checkPlaybackState]);


    const handlePlayPause = useCallback(() => {
        if (!playerRef.current || !isInitialized) {
            console.error("Player not initialized");
            return;
        }
        
        playerRef.current.togglePlay().then(() => {
            console.log("Toggled playback");
        }).catch(error => {
            console.error("Error toggling playback:", error);
        });
    }, [isInitialized]);

    const handlePreviousTrack = useCallback(() => {
        if (!playerRef.current || !isInitialized) {
            console.error("Player not initialized");
            return;
        }
        
        playerRef.current.previousTrack().then(() => {
            console.log("Skipped to previous");
        }).catch(error => {
            console.error("Error skipping to previous:", error);
        });
    }, [isInitialized]);

    const handleNextTrack = useCallback(() => {
        if (!playerRef.current || !isInitialized) {
            console.error("Player not initialized");
            return;
        }
        
        playerRef.current.nextTrack().then(() => {
            console.log("Skipped to next");
        }).catch(error => {
            console.error("Error skipping to next:", error);
        });
    }, [isInitialized]);






    const handleSearchResults = (results) => {
        setSearchResults(results);
    };

    const handlePlaySearchTrack = async (selectedTrack) => {
        if (!playerRef.current || !isInitialized) {
            console.error("Player not initialized");
            return;
        }

        try {
            // First, transfer playback to this device
            await fetch("https://api.spotify.com/v1/me/player", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${props.token}`,
                },
                body: JSON.stringify({
                    device_ids: [playerRef.current._deviceId],
                    play: false,
                })
            });

            // Then, play the selected track
            await fetch("https://api.spotify.com/v1/me/player/play", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${props.token}`,
                },
                body: JSON.stringify({
                    uris: [selectedTrack.uri]
                })
            });
        } catch (error) {
            console.error("Error playing track:", error);
        }
    };





    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: "Web Playback SDK",
                getOAuthToken: cb => { cb(props.token) },
                volume: 0.5,

                enableMediaSession: true,
                maxAudioDelay: 150,
                robustnessLevel: "GRACEFUL_DEGRADATION"
            });

            playerRef.current = player;

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                setIsInitialized(true);
                // Clear any existing timer
                if (initializationTimer.current) {
                    clearTimeout(initializationTimer.current);
                }
                transferPlaybackHere(device_id);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
                setActive(false);
                setIsInitialized(false);
            });

            player.addListener('player_state_changed', state => {
                if (!state) {
                    setActive(false);
                    return;
                }

                setTrack(state.track_window.current_track);
                setPaused(state.paused);
                setActive(true);
            });

            player.connect().then(success => {
                if (success) {
                    console.log('The Web Playback SDK successfully connected to Spotify!');
                    // Set a timeout to check initialization
                    initializationTimer.current = setTimeout(() => {
                        if (!isInitialized) {
                            console.log('Player initialization timed out. Try refreshing the page.');
                        }
                    }, 10000); // 10 second timeout
                }
            });
        };

        return () => {
            if (playerRef.current) {
                playerRef.current.disconnect();
            }
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
            if (initializationTimer.current) {
                clearTimeout(initializationTimer.current);
            }
        };
    }, [props.token, transferPlaybackHere, isInitialized]);

    if (!is_active) {
        return (
            <div className="container">
                <div className="main-wrapper">
                    <b>
                        Instance not active. Transfer your playback using your Spotify app
                        <br />
                        or refresh the page if the player doesn't appear.
                        {!isInitialized && <br />}
                        {!isInitialized && "Waiting for player to initialize..."}
                    </b>
                </div>
            </div>
        );
    }

   
    return (
        <div className="app-container">
            <div className="main-content">
                <div className="search-wrapper">
                    <SearchInput 
                        token={props.token} 
                        onSearchResults={handleSearchResults} 
                    />
                    {searchResults.length > 0 && (
                        <SearchResults 
                            results={searchResults} 
                            searchType={searchType}
                            onPlayTrack={handlePlaySearchTrack}
                        />
                    )}
                </div>

                <div className="main-wrapper">
                    {/* Main content can remain mostly the same, 
                        but we'll remove the album cover and player controls */}
                </div>
            </div>

            {/* Sidebar */}
            <div className="sidebar">
                {current_track.album.images[0].url && (
                    <img 
                        src={current_track.album.images[0].url} 
                        className="sidebar-album-cover" 
                        alt={`${current_track.name} album cover`} 
                    />
                )}

                <div className="now-playing__name">{current_track.name}</div>
                <div className="now-playing__artist">{current_track.artists[0].name}</div>

                <div className="sidebar-player-controls">
                    <button 
                        className="btn-spotify" 
                        onClick={handlePreviousTrack}
                        disabled={!is_active || !isInitialized}
                    >
                        Previous
                    </button>

                    <button 
                        className="btn-spotify" 
                        onClick={handlePlayPause}
                        disabled={!is_active || !isInitialized}
                    >
                        {is_paused ? "Play" : "Pause"}
                    </button>

                    <button 
                        className="btn-spotify" 
                        onClick={handleNextTrack}
                        disabled={!is_active || !isInitialized}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Sticky Seek Bar */}
            <div className="seek-bar-container">
                <div className="seek-bar">
                    <span className="time-position">{formatTime(position)}</span>
                    <input
                        type="range"
                        value={position}
                        min={0}
                        max={duration}
                        className="seek-slider"
                        onChange={handleSeek}
                    />
                    <span className="time-duration">{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
}

export default WebPlayback;