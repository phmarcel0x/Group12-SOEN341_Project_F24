import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from "../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import './confirmation.css';

const Confirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { evaluationData, selectedMembers, dimensions, groupId, userId } = location.state || {};

    if (!evaluationData || !selectedMembers || !dimensions || !groupId || !userId) {
        return <div>No data available for confirmation.</div>;
    }

    const calculateOverallRating = (member) => {
        const ratings = dimensions.map(dimension => evaluationData[dimension]?.[member]?.rating || 0);
        const total = ratings.reduce((sum, rating) => sum + rating, 0);
        return (total / dimensions.length).toFixed(1);
    };

    const handleFinalSubmit = async () => {
        const overallRatings = {};
        selectedMembers.forEach(member => {
            overallRatings[member] = calculateOverallRating(member);
        });

        try {
            await addDoc(collection(db, "evaluations"), {
                groupId: groupId,
                evaluatorId: userId,
                evaluationData: evaluationData,
                overallRatings: overallRatings,
                timestamp: new Date(),
            });

            alert("Successfully submitted!");
            navigate("/profile");
        } catch (error) {
            console.error("Error storing evaluation: ", error);
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
                    <p><strong>Overall Rating:</strong> {calculateOverallRating(member)}</p>
                </div>
            ))}

            <div className="button-container">
                <button onClick={() => navigate("/evaluation")}>Back to Evaluation</button>
                <button onClick={handleFinalSubmit}>Confirm & Submit</button>
            </div>
        </div>
    );
};

export default Confirmation;