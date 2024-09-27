// Header.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth"; // Import signOut and onAuthStateChanged from Firebase Auth
import logo from '../../images/4.svg'

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Track the user's login state
    const navigate = useNavigate();
    const auth = getAuth(); // Initialize Firebase Auth

    // Listen for authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true); // User is logged in
            } else {
                setIsLoggedIn(false); // User is logged out
            }
        });

        // Clean up the subscription when the component unmounts
        return () => unsubscribe();
    }, [auth]);

    const logoutClick = async () => {
        if (isLoggedIn) {
            try {
                await signOut(auth); // Sign the user out
                console.log("User signed out.");
                navigate('/login'); // Redirect to login page after logout
            } catch (error) {
                console.error("Error logging out:", error.message);
            }
        } else {
            navigate('/login'); // Redirect to login page if not logged in
        }
    };

    return (
        <div className="header">
            <div>
                <Link id="header-logo" to="/">
                    <img src={logo} alt="Logo" className="logo-image" />
                </Link>
            </div>

            <div className="links--wrapper">
                <>
                    <Link to="/" className="header--link">Home</Link>
                    <Link to="/profile" className="header--link">Profile</Link>

                    <button onClick={logoutClick} className="btn">
                        {isLoggedIn ? "Sign Out" : "Sign In"}
                    </button>
                </>
            </div>
        </div>
    );
};

export default Header;