//Login.jsx

import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user);

      // Redirect to the profile page after successful login
      navigate('/Profile'); // Redirect to profile page
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
            <label>Log in as:&nbsp;</label>
            <select 
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-control"
            >
              <option value="Instructor">Instructor</option>
              <option value="Student">Student</option>
            </select>
          </div>
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

          <div className="form-field-wrapper">
            <label>Password:</label>
            <input 
              type="password" 
              name="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div className="form-field-wrapper">
            <input 
              type="submit" 
              value="Login"
              className="btn"
            />
          </div>
        </form>

        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;
