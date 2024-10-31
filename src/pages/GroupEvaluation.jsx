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
    const fetchGroups = async () => {
      const groupSnapshot = await getDocs(collection(db, "groups"));
      const fetchedGroups = groupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(fetchedGroups);
    };

    const fetchUsers = async () => {
      const userSnapshot = await getDocs(collection(db, "users"));
      const fetchedUsers = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(fetchedUsers);
      
      console.log('Loaded Users:', fetchedUsers);  // Debug to check loaded users
    };

    fetchGroups();
    fetchUsers();
  }, []);

  const handleGroupSelect = async (groupId) => {
    setSelectedGroup(groupId);
    setSelectedMember(null);

    const group = groups.find(g => g.id === groupId);
    const members = group ? group.members : [];
    setGroupMembers(members);

    const q = query(collection(db, "evaluations"), where("groupId", "==", groupId));
    const evaluationSnapshot = await getDocs(q);
    const fetchedEvaluations = evaluationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEvaluations(fetchedEvaluations);

    console.log('Fetched Evaluations:', fetchedEvaluations);  // Debug fetched evaluations
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

        {selectedGroup && (
          <>
            <h3>Select a Member</h3>
            <select
              className="member-select"
              onChange={(e) => handleMemberSelect(e.target.value)}
              value={selectedMember || ""}
            >
              <option value="" disabled>Select a Member</option>
              {groupMembers.map(memberId => (
                <option key={memberId} value={memberId}>
                  {getEvaluatedMemberName(memberId)}
                </option>
              ))}
            </select>
          </>
        )}

        {selectedMember && (
          <div className="evaluation-table-container">
            <h3>Evaluations Done by {getEvaluatorName(selectedMember)}</h3>
            <table className="evaluation-table">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th>Member Evaluated</th>
                  <th>Rating</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {evaluations
                  .filter(evaluation => evaluation.evaluatorId === selectedMember)
                  .flatMap(evaluation =>
                    dimensions.map(dimension =>
                      Object.keys(evaluation.evaluationData[dimension] || {}).map(evaluatedMemberId => {
                        const rating = evaluation.evaluationData[dimension]?.[evaluatedMemberId]?.rating || "No rating";
                        const comment = evaluation.evaluationData[dimension]?.[evaluatedMemberId]?.comment || "No comment";
                        return (
                          <tr key={`${evaluation.id}-${dimension}-${evaluatedMemberId}`}>
                            <td>{dimension}</td>
                            <td>{getEvaluatedMemberName(evaluatedMemberId)}</td>
                            <td>{rating}</td>
                            <td>{comment}</td>
                          </tr>
                        );
                      })
                    )
                  )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupEvaluation;
