import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import InstructorDashboard from './InstructorDashboard';
import StudentDashboard from './StudentDashboard';
import { db } from '../../firebaseConfig';

const Profile = () => {
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('');  // Store the user's role
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      setUserName(user.displayName);  // Set the user's display name
      setIsLoggedIn(true);  // User is logged in

      const userDocRef = doc(db, 'users', user.uid);  // Reference to the Firestore document
      getDoc(userDocRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setRole(userData.role);  // Set role from Firestore
            setLoading(false);  // Stop loading
          } else {
            console.log('No such document!');
            setLoading(false);
          }
        })
        .catch((error) => {
          console.log('Error fetching user data:', error);
          setLoading(false);
        });
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, [auth]);

  if (!isLoggedIn) {
    return (
      <div className="container">
          <h1>Please sign in to view your profile.</h1>
        </div>
    );
  }
  
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
      {role === 'Instructor' && <InstructorDashboard />}
      {role === 'Student' && <StudentDashboard />}
    </div>
  );
};

export default Profile;