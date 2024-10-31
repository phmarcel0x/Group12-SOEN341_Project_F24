import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './groupevaluation.css';

const GroupEvaluation = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [users, setUsers] = useState([]);
  const [averageRatings, setAverageRatings] = useState({});

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

    calculateAverageRatings(fetchedEvaluations);
  };

  const getEvaluatorName = (evaluatorId) => {
    const evaluator = users.find(user => user.id === evaluatorId);
    return evaluator ? evaluator.name : "Unknown Evaluator";
  };

  const calculateAverageRatings = (evaluations) => {
    const ratingSums = {};
    const ratingCounts = {};

    evaluations.forEach(evaluation => {
      Object.keys(evaluation.overallRatings || {}).forEach(member => {
        const rating = parseFloat(evaluation.overallRatings[member]);
        if (!isNaN(rating)) {
          ratingSums[member] = (ratingSums[member] || 0) + rating;
          ratingCounts[member] = (ratingCounts[member] || 0) + 1;
        }
      });
    });

    const averages = {};
    Object.keys(ratingSums).forEach(member => {
      averages[member] = (ratingSums[member] / ratingCounts[member]).toFixed(2);
    });

    setAverageRatings(averages);
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

        {/* Consolidated average overall rating section at the top */}
        {Object.keys(averageRatings).length > 0 && (
          <div className="average-rating-section">
            <h3>Average Overall Ratings for Each Student</h3>
            <table className="evaluation-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Average Overall Rating</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(averageRatings).map(([member, avgRating]) => (
                  <tr key={member}>
                    <td>{member}</td>
                    <td>{avgRating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedGroup && evaluations.length > 0 ? (
          <div className="evaluation-results">
            <p className="summary-text">Overview of Evaluations per Student</p>
            {evaluations.map((evaluation) => (
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
                  {/* Adding a row for the overallRating per member in each evaluation table */}
                  <tfoot>
                    {Object.keys(evaluation.overallRatings || {}).map(member => (
                      <tr key={`${evaluation.id}-overall-${member}`}>
                        <td colSpan="2" style={{ fontWeight: 'bold' }}>Overall Rating for {member}</td>
                        <td colSpan="2">{evaluation.overallRatings[member] || "No overall rating"}</td>
                      </tr>
                    ))}
                  </tfoot>
                </table>
              </div>
            ))}
          </div>
        ) : (
          selectedGroup && <p>No evaluations found for this group.</p>
        )}
      </div>
    </div>
  );
};

export default GroupEvaluation;
