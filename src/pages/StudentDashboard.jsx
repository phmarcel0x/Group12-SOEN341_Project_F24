// StudentDashboard.jsx

import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import './studentDB.css';
import { Link, useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupNames, setGroupNames] = useState([]);
  const [students, setStudents] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [selectedTeammate, setSelectedTeammate] = useState(null); // State for selected teammate
  const [filteredEvaluations, setFilteredEvaluations] = useState([]); // Filtered evaluations based on selection
  const [loggedInUserId, setLoggedInUserId] = useState(null); // Store logged-in user's ID
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentTeam = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        setLoggedInUserId(user.uid); // Store logged-in user ID

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

    const fetchEvaluations = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const evaluationsQuery = query(collection(db, "evaluations"), where("evaluatorId", "==", user.uid));
        const evaluationSnapshot = await getDocs(evaluationsQuery);

        const fetchedEvaluations = evaluationSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvaluations(fetchedEvaluations);
      } catch (error) {
        console.error("Error fetching evaluations: ", error);
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
    fetchEvaluations();
    fetchAllGroupsAndStudents();
  }, []);

  // Update filtered evaluations based on the selected teammate
  useEffect(() => {
    if (selectedTeammate) {
      const teammateEvaluations = evaluations.filter(evaluation =>
        Object.keys(evaluation.evaluationData).some(dimension =>
          Object.keys(evaluation.evaluationData[dimension]).includes(selectedTeammate.name)
        )
      );
      setFilteredEvaluations(teammateEvaluations);
    }
  }, [selectedTeammate, evaluations]);

  return (
    <div>
      {team ? (
        <div>
          <h2 className="text-position">You are assigned to: {team.name}</h2>
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
      <div>
        <div className="button-container">
          <button
            className="evaluate-button"
            onClick={() => navigate("/evaluation", { state: { teamMembers } })}
          >
            Evaluate your team members
          </button>
        </div>
      </div>

      {/* Teammate Selection for Viewing Evaluations */}
      <h2 className="text-position">Select a student to view previously submitted evaluations</h2>
      <select
        className="teammate-select"
        value={selectedTeammate ? selectedTeammate.id : ""}
        onChange={(e) => {
          const selected = teamMembers.find(member => member.id === e.target.value);
          setSelectedTeammate(selected);
        }}
      >
        <option value="">Select a teammate</option>
        {teamMembers
          .filter(member => member.id !== loggedInUserId) // Filter out the logged-in user
          .map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
      </select>

      {/* Display selected teammate's evaluations */}
      {selectedTeammate && filteredEvaluations.length > 0 ? (
        <div className="table-container">
          <table className="evaluation-table">
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Member</th>
                <th>Dimension</th>
                <th>Rating</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvaluations.map((evaluation) =>
                Object.keys(evaluation.evaluationData).map((dimension) =>
                  Object.keys(evaluation.evaluationData[dimension]).map((member) => (
                    member === selectedTeammate.name && (
                      <tr key={`${evaluation.id}-${dimension}-${member}`}>
                        <td>{groupNames[evaluation.groupId] || "Unknown Group"}</td>
                        <td>{member}</td>
                        <td>{dimension}</td>
                        <td>{evaluation.evaluationData[dimension][member].rating || "No rating"}</td>
                        <td>{evaluation.evaluationData[dimension][member].comment || "No comment"}</td>
                      </tr>
                    )
                  ))
                )
              )}
            </tbody>
            {/* Display the overall rating in the table footer */}
            <tfoot>
              <tr>
                <td colSpan="3" style={{ fontWeight: 'bold' }}>Overall Rating</td>
                <td colSpan="2">
                  {filteredEvaluations.reduce((acc, evaluation) => {
                    return acc + (evaluation.overallRatings[selectedTeammate.name] || 0);
                  }, 0) / filteredEvaluations.length || "No overall rating"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        selectedTeammate && <p>No evaluations found for {selectedTeammate.name}.</p>
      )}

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
