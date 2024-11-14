// GroupEvaluation.jsx 
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import './groupevaluation.css';

const GroupEvaluation = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [users, setUsers] = useState([]);
  const [averageRatings, setAverageRatings] = useState({});
  const navigate = useNavigate();

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

  const calculateAverageRatings = async (evaluations) => {
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

    // Update Firestore with overall grades
    await updateOverallGradesInFirestore(averages);
  };

  const updateOverallGradesInFirestore = async (averages) => {
    const overallGradesRef = collection(db, "overall grades");
    const batchPromises = Object.entries(averages).map(([userId, avgRating]) =>
      setDoc(doc(overallGradesRef, userId), { grade: parseFloat(avgRating) })
    );

    try {
      await Promise.all(batchPromises);
      console.log("Overall grades updated successfully!");
    } catch (error) {
      console.error("Error updating overall grades: ", error);
    }
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
            <p className="summary-text">Overview of Evaluations per Evaluator</p>
            {evaluations.map((evaluation) => {
              const studentData = {};
              dimensions.forEach((dimension) => {
                Object.keys(evaluation.evaluationData[dimension] || {}).forEach((student) => {
                  if (!studentData[student]) {
                    studentData[student] = { ratings: {}, comments: {} };
                  }
                  studentData[student].ratings[dimension] =
                    evaluation.evaluationData[dimension][student]?.rating || "-";
                  studentData[student].comments[dimension] =
                    evaluation.evaluationData[dimension][student]?.comment || "No comment";
                });
              });

              const studentAverages = Object.keys(studentData).reduce((acc, student) => {
                const ratings = Object.values(studentData[student].ratings).filter((rating) =>
                  !isNaN(parseFloat(rating))
                );
                const average =
                  ratings.length > 0
                    ? (ratings.reduce((sum, rating) => sum + parseFloat(rating), 0) / ratings.length).toFixed(2)
                    : "-";
                acc[student] = average;
                return acc;
              }, {});

              return (
                <div key={evaluation.id} className="evaluator-card">
                  <h3>Evaluator: {getEvaluatorName(evaluation.evaluatorId)}</h3>
                  <p className="evaluator-subtitle">Ratings</p>

                  <table className="evaluation-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        {dimensions.map((dimension) => (
                          <th key={dimension}>{dimension}</th>
                        ))}
                        <th>Average Across All</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(studentData).map((student) => (
                        <tr key={student}>
                          <td>{student}</td>
                          {dimensions.map((dimension) => (
                            <td key={`${student}-${dimension}`}>
                              {studentData[student].ratings[dimension] || "-"}
                            </td>
                          ))}
                          <td>{studentAverages[student]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <p className="evaluator-subtitle">Comments</p>
                  <table className="evaluation-table comments-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        {dimensions.map((dimension) => (
                          <th key={dimension}>{dimension}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(studentData).map((student) => (
                        <tr key={student}>
                          <td>{student}</td>
                          {dimensions.map((dimension) => (
                            <td key={`${student}-${dimension}-comment`}>
                              {studentData[student].comments[dimension] || "No comment"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
            <button className="visualize-data-button" onClick={() => navigate(`/visualize-data?groupId=${selectedGroup}`)}> Visualize Data </button>
          </div>
        ) : (
          selectedGroup && <p>No evaluations found for this group.</p>
        )}
      </div>
      <div className="button-container">
        <button className="back-button" onClick={() => navigate("/profile")}>Go Back</button>
      </div>
    </div>
  );
};

export default GroupEvaluation;