// StudentDashboard.jsx

import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import './studentDB.css'

const StudentDashboard = () => {
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);

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

    const fetchAllGroupsAndStudents = async () => {
      // Subscribe to changes in the 'groups' collection
      const unsubscribeGroups = onSnapshot(collection(db, "groups"), (snapshot) => {
        const fetchedGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGroups(fetchedGroups);
      });

      // Fetch all users with the role "Student"
      const q = query(collection(db, "users"), where("role", "==", "Student"));
      const querySnapshot = await getDocs(q);
      const fetchedStudents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(fetchedStudents);

      return () => {
        unsubscribeGroups();
      };
    };

    fetchStudentTeam();
    fetchAllGroupsAndStudents();
  }, []);

  return (
    <div>
      {team ? (
        <div>
          <h2>The Official name of your team is: {team.name}</h2>
          <h2>The following are your team members:</h2>
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

      <h2>The other groups of this course are as follows:</h2>
      <ul>
        {groups.map(group => (
          <li key={group.id}>
            <strong>{group.name}</strong>
            <p>Members: {group.members.map(memberId => {
              const student = students.find(student => student.id === memberId);
              return student ? student.name : "Unknown Student";
            }).join(", ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentDashboard;
