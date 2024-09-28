import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig'; // Import Firebase Auth and Firestore

const Register = () => {
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(''); // Role selected from dropdown
  const [error, setError] = useState('');
  const [instructorKey, setInstructorKey] = useState(''); // For instructor key validation
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that passwords match
    if (password1 !== password2) {
      setError("Passwords do not match");
      return;
    }

    // Validate Instructor key if the selected role is "Instructor"
    const instructorValidationKey = "IAMOPTIMUSPRIME"; // Hardcoded validation key
    if (role === 'Instructor' && instructorKey !== instructorValidationKey) {
      setError("Invalid Instructor Key");
      return;
    }

    try {
      // Create user in Firebase Authentication with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password1);
      const user = userCredential.user;

      // Update Firebase Auth user profile with display name
      await updateProfile(user, { displayName: name });

      // Save the user details and role in Firestore (automatically creates the document and collection)
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        role: role // This role will either be "Instructor" or "Student"
      });

      // Redirect to profile page after successful registration
      navigate('/profile');
      
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
            <label>Role:</label>
            <select required value={role} onChange={(e) => setRole(e.target.value)} className="form-control">
              <option value="">Select Role</option>
              <option value="Instructor">Instructor</option>
              <option value="Student">Student</option>
            </select>
          </div>

          {role === "Instructor" && (
            <div className="form-field-wrapper">
              <label>Instructor Key:</label>
              <input
                type="password"
                placeholder="Enter Instructor Key..."
                value={instructorKey}
                onChange={(e) => setInstructorKey(e.target.value)}
              />
            </div>
          )}

          <div className="form-field-wrapper">
            <label>Name:</label>
            <input
              required
              type="text"
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
              placeholder="Enter email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-field-wrapper">
            <label>Password:</label>
            <input
              type="password"
              placeholder="Enter password..."
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
            />
          </div>

          <div className="form-field-wrapper">
            <label>Confirm Password:</label>
            <input
              type="password"
              placeholder="Confirm password..."
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div className="form-field-wrapper">
            <input type="submit" value="Register" className="btn" />
          </div>
        </form>

        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;