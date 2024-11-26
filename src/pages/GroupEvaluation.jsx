import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./css-file/groupevaluation.css";

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
    "Leadership",
  ];

  useEffect(() => {
    const fetchGroups = async () => {
      const groupSnapshot = await getDocs(collection(db, "groups"));
      const fetchedGroups = groupSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(fetchedGroups);
    };

    const fetchUsers = async () => {
      const userSnapshot = await getDocs(collection(db, "users"));
      const fetchedUsers = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(fetchedUsers);
    };

    fetchGroups();
    fetchUsers();
  }, []);

  const handleGroupSelect = async (groupId) => {
    setSelectedGroup(groupId);

    const q = query(collection(db, "evaluations"), where("groupId", "==", groupId));
    const evaluationSnapshot = await getDocs(q);
    const fetchedEvaluations = evaluationSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEvaluations(fetchedEvaluations);

    calculateAverageRatings(fetchedEvaluations);
  };

  const calculateAverageRatings = async (evaluations) => {
    const ratingSums = {};
    const ratingCounts = {};
  
    // Process evaluations to calculate the sum and count of ratings
    evaluations.forEach((evaluation) => {
      Object.keys(evaluation.overallRatings || {}).forEach((key) => {
        const rating = parseFloat(evaluation.overallRatings[key]);
  
        // Check if the key is already a UID or if it needs to be converted
        const user = users.find((user) => user.name === key || user.id === key);
  
        if (user && !isNaN(rating)) {
          ratingSums[user.id] = (ratingSums[user.id] || 0) + rating;
          ratingCounts[user.id] = (ratingCounts[user.id] || 0) + 1;
        }
      });
    });
  
    // Calculate average ratings for each UID
    const averages = {};
    Object.keys(ratingSums).forEach((uid) => {
      averages[uid] = (ratingSums[uid] / ratingCounts[uid]).toFixed(2);
    });
  
    setAverageRatings(averages);
  
    // Write the averages to Firestore with UID as document ID
    const overallGradesRef = collection(db, "overall grades");
    const batchPromises = Object.entries(averages).map(([uid, avgRating]) =>
      setDoc(doc(overallGradesRef, uid), { grade: parseFloat(avgRating) })
    );
  
    try {
      await Promise.all(batchPromises);
      console.log("Overall grades updated successfully with UIDs!");
    } catch (error) {
      console.error("Error updating overall grades in Firestore: ", error);
    }
  };
  

  const getEvaluatorName = (evaluatorId) => {
    const evaluator = users.find((user) => user.id === evaluatorId);
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
          <option value="" disabled>
            Select a Group
          </option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>

        {/* Consolidated average overall rating section at the top */}
        {Object.keys(averageRatings).length > 0 && (
          <div className="average-rating-section">
            <h3>Average Overall Ratings for Each Student</h3>
            <table className="evaluation-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Average Overall Rating</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(averageRatings).map(([uid, avgRating]) => {
                  // Find the student name from the users array
                  const student = users.find(user => user.id === uid);
                  const studentName = student ? student.name : "Unknown Student";

                  return (
                    <tr key={uid}>
                      <td>{studentName}</td>
                      <td>{avgRating}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {selectedGroup && evaluations.length > 0 ? (
          <div className="evaluation-results">
            <p className="summary-text">Overview of Evaluations per Evaluator</p>
            {evaluations.map((evaluation) => {
              // Prepare data for both ratings and comments
              const studentData = {};
              dimensions.forEach((dimension) => {
                Object.keys(evaluation.evaluationData[dimension] || {}).forEach((uid) => {
                  if (!studentData[uid]) {
                    studentData[uid] = { ratings: {}, comments: {} };
                  }
                  studentData[uid].ratings[dimension] =
                    evaluation.evaluationData[dimension][uid]?.rating || "-";
                  studentData[uid].comments[dimension] =
                    evaluation.evaluationData[dimension][uid]?.comment || "No comment";
                });
              });

              // Compute averages for each student
              const studentAverages = Object.keys(studentData).reduce((acc, uid) => {
                const ratings = Object.values(studentData[uid].ratings).filter((rating) =>
                  !isNaN(parseFloat(rating))
                );
                const average =
                  ratings.length > 0
                    ? (
                        ratings.reduce((sum, rating) => sum + parseFloat(rating), 0) / ratings.length
                      ).toFixed(2)
                    : "-";
                acc[uid] = average;
                return acc;
              }, {});

              return (
                <div key={evaluation.id} className="evaluator-card">
                  <h3>Evaluator: {getEvaluatorName(evaluation.evaluatorId)}</h3>
                  <p className="evaluator-subtitle">Ratings</p>

                  {/* Ratings Table */}
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
                      {Object.keys(studentData).map((uid) => (
                        <tr key={uid}>
                          <td>{uid}</td>
                          {dimensions.map((dimension) => (
                            <td key={`${uid}-${dimension}`}>
                              {studentData[uid].ratings[dimension] || "-"}
                            </td>
                          ))}
                          <td>{studentAverages[uid]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Comments Table */}
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
                      {Object.keys(studentData).map((uid) => (
                        <tr key={uid}>
                          <td>{uid}</td>
                          {dimensions.map((dimension) => (
                            <td key={`${uid}-${dimension}-comment`}>
                              {studentData[uid].comments[dimension] || "No comment"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
            <button
              className="visualize-data-button"
              onClick={() => navigate(`/visualize-data?groupId=${selectedGroup}`)}
            >
              Visualize Data
            </button>
          </div>
        ) : (
          selectedGroup && <p>No evaluations found for this group.</p>
        )}
      </div>
      <div className="button-container">
        <button className="back-button" onClick={() => navigate("/profile")}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default GroupEvaluation;