import React from "react";
import { useNavigate } from 'react-router-dom';
import "./submission.css";

const Submission = () => {
  const navigate = useNavigate();

  return (
    <div className="submission-container">
      <h1 className="submission-message">Your evaluation has been successfully submitted</h1>
      
      <div className="button-container">
        <button onClick={() => navigate("/profile")}>Back to Dashboard</button>
      </div>
    </div>
  );
}

export default Submission;
