// Profile.jsx 

import React, { useState, useEffect } from 'react';
import { getAuth } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const auth = getAuth(); // Get the Firebase Auth instance
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser; // Get the currently logged-in user

    if (user) {
      setUserName(user.displayName); // Set the user's display name
      setIsLoggedIn(true); // User is logged in
    } else {
      setIsLoggedIn(false); // User is logged out
    }
  }, [auth]);

  if (!isLoggedIn) {
    return (
      <div className="container">
        <h1>Please log in to view your profile.</h1>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Welcome to my profile, my name is {userName ? userName : 'User'}!</h1>
    </div>
  );
};

export default Profile;