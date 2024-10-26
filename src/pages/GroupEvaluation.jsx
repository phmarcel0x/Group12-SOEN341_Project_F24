import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './groupevaluation.css'; 

const GroupEvaluation = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [users, setUsers] = useState([]);

  const dimensions = [
    "Conceptual Contribution",
    "Practical Contribution",
    "Work Ethic",
    "Team Collaboration",
    "Leadership"
  ];

  useEffect(() => {
    // Fetch all groups from Firestore
    const fetchGroups = async () => {
      const groupSnapshot = await getDocs(collection(db, "groups"));
      const fetchedGroups = groupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(fetchedGroups);
    };

    // Fetch all users from Firestore to map evaluator names
    const fetchUsers = async () => {
      const userSnapshot = await getDocs(collection(db, "users"));
      const fetchedUsers = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(fetchedUsers);
    };

    fetchGroups();
    fetchUsers();
  }, []);

  const handleGroupSelect = async (groupId) => {
    setSelectedGroup(groupId);
    setSelectedMember(null); // Reset selected member when group changes

    // Get the members of the selected group
    const group = groups.find(g => g.id === groupId);
    const members = group ? group.members : [];
    setGroupMembers(members);

    // Fetch all evaluations for the selected group
    const q = query(collection(db, "evaluations"), where("groupId", "==", groupId));
    const evaluationSnapshot = await getDocs(q);
    const fetchedEvaluations = evaluationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEvaluations(fetchedEvaluations);

    // Debugging: Log the fetched evaluations to check structure
    console.log('Fetched Evaluations:', fetchedEvaluations);
  };

  const handleMemberSelect = (memberId) => {
    setSelectedMember(memberId);
  };

  const getEvaluatorName = (evaluatorId) => {
    const evaluator = users.find(user => user.id === evaluatorId);
    return evaluator ? evaluator.name : "Unknown Evaluator";
  };

  const getEvaluatedMemberName = (memberId) => {
    const member = users.find(user => user.id === memberId);
    return member ? member.name : "Unknown Member";
  };

  return (
    <div className="groupevaluation-page">
      <div className="groupevaluation-container">
        <h2>Select a Group to View Evaluations</h2>

        {/* Group Selection Dropdown */}
        <select
          className="group-select"
          onChange={(e) => handleGroupSelect(e.target.value)}
          value={selectedGroup || ""}
        >
          <option value="" disabled>Select a Group</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>

        {/* Member Selection Dropdown (only shown after group is selected) */}
        {selectedGroup && (
          <>
            <h3>Select a Member</h3>
            <select
              className="member-select"
              onChange={(e) => handleMemberSelect(e.target.value)}
              value={selectedMember || ""}
            >
              <option value="" disabled>Select a Member</option>
              {groupMembers.map(memberId => {
                const member = users.find(user => user.id === memberId);
                return (
                  <option key={memberId} value={memberId}>
                    {member ? member.name : "Unknown Member"}
                  </option>
                );
              })}
            </select>
          </>
        )}

        {/* Show Evaluations for the Selected Member */}
        {selectedMember && (
          <div className="evaluation-table-container">
            <h3>Evaluations Done by {users.find(user => user.id === selectedMember)?.name || "Unknown Member"}</h3>
            <table className="evaluation-table">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th>Member Evaluated</th> {/* Updated to show evaluated member's name */}
                  <th>Rating</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {evaluations
                  .filter(evaluation => evaluation.evaluatorId === selectedMember) // Filter evaluations done by the selected member
                  .map(evaluation => (
                    dimensions.map((dimension) => (
                      Object.keys(evaluation.evaluationData).map((evaluatedMemberId) => (
                        <tr key={`${evaluation.id}-${dimension}-${evaluatedMemberId}`}>
                          <td>{dimension}</td>
                          <td>{getEvaluatedMemberName(evaluatedMemberId)}</td> {/* Updated to show evaluated member's name */}
                          <td>{evaluation.evaluationData[dimension]?.[evaluatedMemberId]?.rating || "No rating"}</td>
                          <td>{evaluation.evaluationData[dimension]?.[evaluatedMemberId]?.comment || "No comment"}</td>
                        </tr>
                      ))
                    ))
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupEvaluation;
