import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [name, setName] = useState(''); // Name field
  const [error, setError] = useState('');
  const [role, setRole] = useState(''); // Add this line to define the role state

  const navigate = useNavigate(); // Initialize navigate for redirection

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password1 !== password2) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password1);
      const user = userCredential.user;

      // Update the user's profile with the name
      await updateProfile(user, {
        displayName: name
      });

      console.log('User registered:', user);
      console.log('User display name:', user.displayName);  // Check the name is stored

      // After successful registration, redirect to the login or dashboard
      navigate('/login'); // Redirect to login after successful registration

    } catch (error) {
      console.error("Error registering user:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className="container">
      <div className="login-register-container">
        <form onSubmit={handleSubmit}>

          <div className="form-field-wrapper">
            <label>Role:&nbsp;</label>
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
            <label>Name:</label>
            <input 
              required
              type="text" 
              name="name"
              placeholder="Enter name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
              name="password1" 
              placeholder="Enter password..."
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
            />
          </div>

          <div className="form-field-wrapper">
            <label>Confirm Password:</label>
            <input 
              type="password"
              name="password2" 
              placeholder="Confirm password..."
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div className="form-field-wrapper">
            <input 
              type="submit" 
              value="Register"
              className="btn"
            />
          </div>
        </form>

        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;