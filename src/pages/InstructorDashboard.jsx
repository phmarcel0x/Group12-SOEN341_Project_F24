// InstructorDashboard.jsx

import React, { useState } from 'react';
import { getDatabase, ref, set, push } from "firebase/database";

const InstructorDashboard = () => {
  const [teamName, setTeamName] = useState('');
  const [studentName, setStudentName] = useState(''); // Store student name
  const [studentEmail, setStudentEmail] = useState(''); // Store student email
  const [message, setMessage] = useState('');

  // Function to create a team and assign a student manually
  const handleCreateTeam = async (e) => {
    e.preventDefault();

    if (teamName === '' || studentName === '' || studentEmail === '') {
      setMessage('Please provide all the details (team name, student name, and student email).');
      return;
    }

    try {
      const db = getDatabase();
      const teamRef = push(ref(db, 'teams')); // Generate unique team ID
      await set(teamRef, {
        teamName: teamName,
        members: [{ name: studentName, email: studentEmail }]
      });

      setMessage(`Team ${teamName} created and ${studentName} assigned successfully!`);
      setTeamName(''); // Reset the form fields
      setStudentName('');
      setStudentEmail('');

    } catch (error) {
      console.error('Error creating team:', error);
      setMessage('Error creating team');
    }
  };

  return (
    <div className="instructor-dashboard">
      {/* <h1>Dashboard:</h1> */}

      {/* Create Team and Assign Student Form */}
      <form onSubmit={handleCreateTeam}>
        <input
          type="text"
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Student Name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Student Email"
          value={studentEmail}
          onChange={(e) => setStudentEmail(e.target.value)}
        />
        <button type="submit">Create Team and Assign Student</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default InstructorDashboard;