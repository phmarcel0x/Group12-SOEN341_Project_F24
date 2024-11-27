import PropTypes from "prop-types";
import React, { useState } from "react";
import "./evaluatorresults.css";

const EvaluatorResults = ({ evaluation, dimensions, users }) => {
  const getEvaluatorName = (evaluatorId) => {
    const evaluator = users.find((user) => user.id === evaluatorId);
    return evaluator ? evaluator.name : "Unknown Evaluator";
  };

  const [expandedComments, setExpandedComments] = useState({}); // State to track expanded comments

  const toggleComment = (uid, dimension) => {
    const key = `${uid}-${dimension}`;
    setExpandedComments((prev) => ({
      ...prev,
      [key]: !prev[key], // Toggle the state for the specific key
    }));
  };

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

  const studentAverages = Object.keys(studentData).reduce((acc, uid) => {
    const ratings = Object.values(studentData[uid].ratings).filter((rating) =>
      !isNaN(parseFloat(rating))
    );
    const average =
      ratings.length > 0
        ? (
            ratings.reduce((sum, rating) => sum + parseFloat(rating), 0) /
            ratings.length
          ).toFixed(2)
        : "-";
    acc[uid] = average;
    return acc;
  }, {});

  return (
    <div className="evaluator-card">
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
          {Object.keys(studentData).map((uid) => (
            <tr key={uid}>
              <td>{uid}</td>
              {dimensions.map((dimension) => {
                const key = `${uid}-${dimension}`;
                return (
                  <td key={key} className="ratings-cell">
                    {studentData[uid].ratings[dimension]}
                    <button
                      className="comment-icon"
                      onClick={() => toggleComment(uid, dimension)}
                      title="View Comment"
                      aria-expanded={expandedComments[key] ? "true" : "false"}
                    >
                      💬
                    </button>
                    {expandedComments[key] && (
                      <div className="comment-box">
                        {studentData[uid].comments[dimension]}
                      </div>
                    )}
                  </td>
                );
              })}
              <td>{studentAverages[uid]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Add PropTypes validation
EvaluatorResults.propTypes = {
  evaluation: PropTypes.shape({
    evaluatorId: PropTypes.string.isRequired,
    evaluationData: PropTypes.object.isRequired,
  }).isRequired,
  dimensions: PropTypes.arrayOf(PropTypes.string).isRequired,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default EvaluatorResults;
