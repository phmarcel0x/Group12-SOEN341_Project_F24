//Login.jsx

import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const db = getFirestore();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User logged in:', user);

      // Fetch user role from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User role:', userData.role);

        // Redirect all users to profile page
        setError(""); // Clear any existing error messages
        navigate('/profile');
      } else {
        console.warn("User role not found in Firestore, but user logged in successfully.");
        setError("User role not found");
      }

    } catch (error) {
      console.error("Error logging in:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className="container">
      <div className="login-register-container">
        <form onSubmit={handleSubmit}>
          <div className="form-field-wrapper">
            <label>Email:</label>
            <input
              required
              type="email"
              name="email"
              placeholder="Enter email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-field-wrapper password-input">
            <label>Password:</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter password..."
              value={password}
              onChange={handlePasswordChange}
              className="password-field"
            />
            <div className="checkbox-container">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={handleTogglePasswordVisibility}
                className="show-password-checkbox"
              />
              <label className="checkbox-label">Show password</label>
            </div>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div className="form-field-wrapper">
            <input type="submit" value="Login" className="btn" />
          </div>
        </form>

        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;
