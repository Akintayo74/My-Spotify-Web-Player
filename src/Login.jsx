import React from "react"

function Login(){
    const handleLogin = (e) => {
        e.preventDefault();
        console.log("Login button clicked");
        window.location.href = "/auth/login";
    }

    return(
        <div className="App">
            <header className="App-header">
                <button 
                    className="btn-spotify" 
                    onClick={handleLogin}
                >
                    Login with Spotify
                </button>
            </header>
        </div>
    )
}

export default Login