// StudentDashboard.jsx

import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig"; // Import the Firebase utils
import './studentDB.css'; // Import CSS file for styling

const StudentDashboard = () => {
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const fetchStudentTeam = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Query to find the group that contains the logged-in student's UID
        const q = query(collection(db, "groups"), where("members", "array-contains", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const teamData = querySnapshot.docs[0].data();
          setTeam({ id: querySnapshot.docs[0].id, ...teamData });

          // Fetching team members' details
          const membersDetails = [];
          for (let memberId of teamData.members) {
            const studentDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", memberId)));
            if (!studentDoc.empty) {
              const studentData = studentDoc.docs[0].data();
              membersDetails.push({ name: studentData.name, email: studentData.email });
            }
          }
          setTeamMembers(membersDetails);
        }
      } catch (error) {
        console.error("Error fetching student team: ", error);
      }
    };

    fetchStudentTeam();
  }, []);

  return (
    <div>
      {team ? (
        <div>
          <h2>{team.name}</h2>
          <table className="team-table">
            <thead>
              <tr>
                <th>Members</th>
                <th>Emails</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member, index) => (
                <tr key={index}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>You are not assigned to any team yet.</p>
      )}
    </div>
  );
};

export default StudentDashboard;