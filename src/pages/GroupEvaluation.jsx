// GroupEvaluations.jsx

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './groupevaluation.css';

const GroupEvaluation = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
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
    };

    fetchGroups();
    fetchUsers();
  }, []);

  const handleGroupSelect = async (groupId) => {
    setSelectedGroup(groupId);

    const q = query(collection(db, "evaluations"), where("groupId", "==", groupId));
    const evaluationSnapshot = await getDocs(q);
    const fetchedEvaluations = evaluationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEvaluations(fetchedEvaluations);
  };

  const getEvaluatorName = (evaluatorId) => {
    const evaluator = users.find(user => user.id === evaluatorId);
    return evaluator ? evaluator.name : "Unknown Evaluator";
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

        {selectedGroup && evaluations.length > 0 ? (
          evaluations.map((evaluation) => (
            <div key={evaluation.id} className="evaluation-table-section">
              <h3>Evaluator: {getEvaluatorName(evaluation.evaluatorId)}</h3>
              <table className="evaluation-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Dimension</th>
                    <th>Rating</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(evaluation.evaluationData)
                    .flatMap(dimension =>
                      Object.keys(evaluation.evaluationData[dimension] || {}).map(member => ({
                        member,
                        dimension,
                        rating: evaluation.evaluationData[dimension][member]?.rating || "No rating",
                        comment: evaluation.evaluationData[dimension][member]?.comment || "No comment"
                      }))
                    )
                    .sort((a, b) => a.member.localeCompare(b.member)) // Sort by "Member" alphabetically
                    .map(({ member, dimension, rating, comment }) => (
                      <tr key={`${evaluation.id}-${dimension}-${member}`}>
                        <td>{member}</td>
                        <td>{dimension}</td>
                        <td>{rating}</td>
                        <td>{comment}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          selectedGroup && <p>No evaluations found for this group.</p>
        )}
      </div>
    </div>
  );
};

export default GroupEvaluation;