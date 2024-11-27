import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig";
import EvaluatorResults from "./EvaluatorResults"; // Import the new component
import "./groupevaluation.css";

const GroupEvaluation = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [users, setUsers] = useState([]);
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
      setGroups(groupSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    const fetchUsers = async () => {
      const userSnapshot = await getDocs(collection(db, "users"));
      setUsers(userSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchGroups();
    fetchUsers();
  }, []);

  const handleGroupSelect = async (groupId) => {
    setSelectedGroup(groupId);

    const q = query(collection(db, "evaluations"), where("groupId", "==", groupId));
    const evaluationSnapshot = await getDocs(q);
    setEvaluations(evaluationSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const calculateConsolidatedAverages = () => {
    const studentAverages = {};

    evaluations.forEach((evaluation) => {
      // Go through each evaluation and aggregate "Average Across All" for each student
      const evaluationData = evaluation.evaluationData || {};

      Object.keys(evaluationData).forEach((dimension) => {
        const dimensionData = evaluationData[dimension];
        Object.keys(dimensionData || {}).forEach((uid) => {
          const rating = dimensionData[uid]?.rating;
          if (!isNaN(parseFloat(rating))) {
            if (!studentAverages[uid]) {
              studentAverages[uid] = { total: 0, count: 0 };
            }
            studentAverages[uid].total += parseFloat(rating);
            studentAverages[uid].count += 1;
          }
        });
      });
    });

    const consolidatedAverages = {};
    Object.keys(studentAverages).forEach((uid) => {
      consolidatedAverages[uid] = (
        studentAverages[uid].total / studentAverages[uid].count
      ).toFixed(2);
    });

    return consolidatedAverages;
  };

  const consolidatedAverages = calculateConsolidatedAverages();

  const getStudentName = (uid) => {
    const user = users.find((user) => user.id === uid);
    return user ? user.name : "Unknown Student";
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

        {/* Consolidated Average Overall Ratings Table */}
        {selectedGroup && Object.keys(consolidatedAverages).length > 0 && (
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
                {Object.entries(consolidatedAverages).map(([uid, avgRating]) => (
                  <tr key={uid}>
                    <td>{getStudentName(uid)}</td>
                    <td>{avgRating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedGroup && evaluations.length > 0 ? (
          <div className="evaluation-results">
            {evaluations.map((evaluation) => (
              <EvaluatorResults
                key={evaluation.id}
                evaluation={evaluation}
                dimensions={dimensions}
                users={users}
              />
            ))}
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