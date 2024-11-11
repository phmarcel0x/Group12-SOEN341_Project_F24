// Confirmation.jsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
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
            // Query for an existing evaluation document by this user in this group
            const evaluationQuery = query(
                collection(db, "evaluations"),
                where("evaluatorId", "==", userId),
                where("groupId", "==", groupId)
            );
            const evaluationSnapshot = await getDocs(evaluationQuery);

            if (!evaluationSnapshot.empty) {
                // If an existing evaluation is found, update it
                const existingDocId = evaluationSnapshot.docs[0].id;
                const existingDocRef = doc(db, "evaluations", existingDocId);

                await updateDoc(existingDocRef, {
                    evaluationData: evaluationData,
                    overallRatings: overallRatings,
                    timestamp: new Date(),
                });

                alert("Your evaluation has been updated successfully!");
            } else {
                // If no evaluation is found, add a new document
                await addDoc(collection(db, "evaluations"), {
                    groupId: groupId,
                    evaluatorId: userId,
                    evaluationData: evaluationData,
                    overallRatings: overallRatings,
                    timestamp: new Date(),
                });

                alert("Your evaluation has been submitted successfully!");
            }

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
                <button className="back-button" onClick={() => navigate("/profile")}>Back To Dashboard</button>
                <button onClick={handleFinalSubmit}>Confirm & Submit</button>
            </div>
        </div>
    );
};

export default Confirmation;
