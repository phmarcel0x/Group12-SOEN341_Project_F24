import PropTypes from "prop-types"; // Import PropTypes for validation
import React from "react";
import "./groupevaluation.css";

const EvaluatorResults = ({ evaluation, dimensions, users }) => {
  const getEvaluatorName = (evaluatorId) => {
    const evaluator = users.find((user) => user.id === evaluatorId);
    return evaluator ? evaluator.name : "Unknown Evaluator";
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
