import React, { useState, useEffect } from 'react';
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import InstructorDashboard from './InstructorDashboard'; // Import Instructor Dashboard
import StudentDashboard from './StudentDashboard'; // Import Student Dashboard

const Profile = () => {
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState(''); // Store the user's role
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const [loading, setLoading] = useState(true); // Track loading state
  const auth = getAuth();
  const db = getDatabase();

  useEffect(() => {
    const user = auth.currentUser; // Get the currently logged-in user

    if (user) {
      setUserName(user.displayName); // Set the user's display name
      setIsLoggedIn(true); // User is logged in

      // Fetch user role from Firebase RTDB
      const userRoleRef = ref(db, `users/${user.uid}/role`);
      onValue(userRoleRef, (snapshot) => {
        const userRole = snapshot.val();
        setRole(userRole);
        setLoading(false); // Set loading to false once the role is fetched
      });
    } else {
      setIsLoggedIn(false); // User is logged out
      setLoading(false); // Stop loading if the user is not logged in
    }
  }, [auth, db]);

  if (!isLoggedIn) {
    return (
      <div className="container">
        <h1>Please sign in to view your profile.</h1>
      </div>
    );
  }

  // Show loading message while role is being fetched
  if (loading) {
    return (
      <div className="container">
        <h1>Loading your profile...</h1>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Welcome to your profile, {userName ? userName : 'User'}.</h1>
      <p> </p>

      {/* Render Instructor or Student Dashboard based on role */}
      {role === 'Instructor' && <InstructorDashboard />}
      {role === 'Student' && <StudentDashboard />}
    </div>
  );
};

export default Profile;