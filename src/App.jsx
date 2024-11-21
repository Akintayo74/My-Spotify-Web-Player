import React, { useState, useEffect } from 'react';
import WebPlayback from './WebPlayback';
import Login from './Login';
import './App.css'

function App() {
    const [token, setToken] = useState('');

    useEffect(() => {
        async function getToken() {
            try {
                const response = await fetch('/auth/token');
                const json = await response.json();
                setToken(json.access_token);
            } catch (error) {
                console.error('Error getting token:', error);
            }
        }

        getToken();
    }, []);

    return (
        <>
            {(token === '') ? <Login /> : <WebPlayback token={token} />}
        </>
    );
}

export default App;