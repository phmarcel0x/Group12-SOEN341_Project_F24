// StudentDashboard.jsx

import React, { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";

const StudentDashboard = () => {
  const [team, setTeam] = useState(null);
  const [error, setError] = useState('');
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const db = getDatabase();
      const teamsRef = ref(db, 'teams');

      // Find the team the current student belongs to
      onValue(teamsRef, (snapshot) => {
        const teams = snapshot.val();
        let foundTeam = null;

        for (let teamId in teams) {
          const team = teams[teamId];
          if (team.members.some(member => member.email === user.email)) {
            foundTeam = team;
            break;
          }
        }

        if (foundTeam) {
          setTeam(foundTeam);
        } else {
          setError("You are not assigned to a team yet.");
        }
      });
    }
  }, [user]);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="student-dashboard">
      {/* <h1>Dashboard:</h1> */}
      {team ? (
        <div>
          <h2>Your Team: {team.teamName}</h2>
          <ul>
            {team.members.map((member, index) => (
              <li key={index}>{member.name} ({member.email})</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading your team...</p>
      )}
    </div>
  );
};

export default StudentDashboard;