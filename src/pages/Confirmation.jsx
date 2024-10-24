import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './confirmation.css';

const Confirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { evaluationData, selectedMembers, dimensions } = location.state || {};

    if (!evaluationData || !selectedMembers || !dimensions) {
        return <div>No data available for confirmation.</div>;
    }

    return (
        <div className="confirmation-container">
            <h2>Evaluation Summary</h2>
            
            {selectedMembers.map((member) => (
                <div className="member-summary-box" key={member}>
                    <h3 className="member-name">{member}</h3>
                    {dimensions.map((dimension) => (
                        <div key={dimension} className="dimension-summary">
                            <p><strong>{dimension}:</strong></p>
                            <div className="evaluation-column">
                                <div className="rating-box">
                                    <p>Rating: {evaluationData[dimension]?.[member]?.rating || 'No rating provided'}</p>
                                </div>
                                <div className="comment-box">
                                    <p>Comment: {evaluationData[dimension]?.[member]?.comment || 'No comment provided'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            <div className="button-container">
                <button onClick={() => navigate("/profile")}>Back to Dashboard</button>
            </div>
        </div>
    );
};

export default Confirmation;
