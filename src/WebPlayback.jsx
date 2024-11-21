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
    const playerRef = useRef(null);
    const initializationTimer = useRef(null);

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
                volume: 0.5
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
        <div className="container">

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

                {current_track.album.images[0].url && (
                    <img 
                        src={current_track.album.images[0].url} 
                        className="now-playing__cover" 
                        alt={`${current_track.name} album cover`} 
                    />
                )}

                <div className="now-playing__side">
                    <div className="now-playing__name">{current_track.name}</div>
                    <div className="now-playing__artist">{current_track.artists[0].name}</div>

                    <button 
                        className="btn-spotify" 
                        onClick={handlePreviousTrack}
                        disabled={!is_active || !isInitialized}
                    >
                        &lt;&lt;
                    </button>

                    <button 
                        className="btn-spotify" 
                        onClick={handlePlayPause}
                        disabled={!is_active || !isInitialized}
                    >
                        {is_paused ? "PLAY" : "PAUSE"}
                    </button>

                    <button 
                        className="btn-spotify" 
                        onClick={handleNextTrack}
                        disabled={!is_active || !isInitialized}
                    >
                        &gt;&gt;
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WebPlayback;