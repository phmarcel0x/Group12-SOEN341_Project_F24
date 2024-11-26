import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import "./css-file/studentDB.css";
import { Link, useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [overallGrade, setOverallGrade] = useState(null); // State to store overall grade
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentTeam = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        setLoggedInUserId(user.uid);

        const q = query(collection(db, "groups"), where("members", "array-contains", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const teamData = querySnapshot.docs[0].data();
          setTeam({ id: querySnapshot.docs[0].id, ...teamData });

          const membersDetails = [];
          for (let memberId of teamData.members) {
            const studentDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", memberId)));
            if (!studentDoc.empty) {
              const studentData = studentDoc.docs[0].data();
              membersDetails.push({ id: memberId, name: studentData.name, email: studentData.email });
            }
          }
          setTeamMembers(membersDetails);
        }
      } catch (error) {
        console.error("Error fetching student team: ", error);
      }
    };

    const fetchOverallGrade = async () => {
      try {
        const user = auth.currentUser; // Ensure the current user is fetched
        if (!user) {
          console.error("User not logged in.");
          return;
        }
    
        const gradeDocRef = doc(db, "overall grades", user.uid); // Fetch grade by UID
        const gradeDoc = await getDoc(gradeDocRef);
    
        if (gradeDoc.exists()) {
          setOverallGrade(gradeDoc.data().grade); // Set the grade in state
        } else {
          console.warn(`No grade found for UID: ${user.uid}`);
          setOverallGrade("N/A");
        }
      } catch (error) {
        console.error("Error fetching overall grade: ", error);
      }
    };
    

    const fetchAllGroupsAndStudents = async () => {
      try {
        const groupSnapshot = await getDocs(collection(db, "groups"));
        const fetchedGroups = [];

        groupSnapshot.forEach(doc => {
          const groupData = doc.data();
          fetchedGroups.push({
            id: doc.id,
            name: groupData.name,
            members: groupData.members
          });
        });

        const studentSnapshot = await getDocs(query(collection(db, "users"), where("role", "==", "Student")));
        const fetchedStudents = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Populate groups with student names for display
        const groupsWithNames = fetchedGroups.map(group => ({
          ...group,
          memberNames: group.members.map(memberId => {
            const student = fetchedStudents.find(student => student.id === memberId);
            return student ? student.name : "Unknown Student";
          })
        }));

        setGroups(groupsWithNames);
        setStudents(fetchedStudents);
      } catch (error) {
        console.error("Error fetching groups and students:", error);
      }
    };

    fetchStudentTeam();
    fetchOverallGrade();
    fetchAllGroupsAndStudents();
  }, []);

  return (
    <div>
      {team ? (
        <div>
          <h2 className="text-position">You are assigned to: {team.name}</h2>
          <div className="grade-card-container">
          <div className="grade-card">
            <h3 className="grade-title">Your Overall Grade</h3>
            <div className="grade-value">
              {overallGrade !== null ? overallGrade : "Loading..."}
            </div>
            <button
              className="contest-grade-button"
              onClick={() => navigate("/contest-grade")}
            >
              Contest Grade
            </button>
          </div>
        </div>
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
      <div className="button-container">
        <button
          className="evaluate-button"
          onClick={() => navigate("/evaluation", { state: { teamMembers } })}
        >
          Evaluate your team members
        </button>
      </div>
      <h2 className="text-position">The other groups of this course are as follows:</h2>
      <table className="group-table-student">
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Members</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(group => (
            <tr key={group.id}>
              <td><strong>{group.name}</strong></td>
              <td>{group.memberNames.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentDashboard;
