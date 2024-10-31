import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from "../../firebaseConfig"; // Firebase config
import { collection, addDoc } from "firebase/firestore"; // Firestore methods
import './confirmation.css';

const Confirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { evaluationData, selectedMembers, dimensions, groupId, userId } = location.state || {};

    if (!evaluationData || !selectedMembers || !dimensions || !groupId || !userId) {
        return <div>No data available for confirmation.</div>;
    }

    const handleFinalSubmit = async () => {
        try {
            // Store evaluation in Firestore
            await addDoc(collection(db, "evaluations"), {
                groupId: groupId,
                evaluatorId: userId,
                evaluationData: evaluationData,
                timestamp: new Date(),
            });

            // Show success message as an alert
            alert("Successfully submitted!");

            // Redirect to profile page
            navigate("/profile");
        } catch (error) {
            console.error("Error storing evaluation: ", error);

            // Show error message as an alert
            alert("Submission failed. Please try again.");
        }
    };

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
                <button onClick={handleFinalSubmit}>Confirm & Submit</button>
            </div>
        </div>
    );
};

export default Confirmation;
