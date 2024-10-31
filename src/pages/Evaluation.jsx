import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from "../../firebaseConfig"; // Firebase config
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'; // Firestore methods
import './evaluation.css';

const Evaluation = () => {
    const location = useLocation();
    const [filteredMembers, setFilteredMembers] = useState([]);
    const teamMembers = location.state?.teamMembers || [];
    const [selectedDimension, setSelectedDimension] = useState(null);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [evaluationData, setEvaluationData] = useState({});
    const navigate = useNavigate();

    const dimensions = [
        "Conceptual Contribution",
        "Practical Contribution",
        "Work Ethic",
        "Team Collaboration",
        "Leadership"
    ];

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            const filtered = teamMembers.filter(member => member.email !== user.email);
            setFilteredMembers(filtered);
        }
    }, [teamMembers]);

    const fetchStudentGroupId = async (userId) => {
        // Query the 'groups' collection to find the group where the student is a member
        const q = query(collection(db, "groups"), where("members", "array-contains", userId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            // Return the groupId from the 'groups' collection
            return querySnapshot.docs[0].id;
        }
        return null; // Handle cases where the user is not part of any group
    };

    const handleSelectDimension = (dimension) => {
        setSelectedDimension(dimension);
    };

    const handleSelectMember = (member) => {
        if (selectedMembers.includes(member)) {
            setSelectedMembers(selectedMembers.filter((m) => m !== member));
        } else {
            setSelectedMembers([...selectedMembers, member]);
        }
    };

    const handleRatingChange = (member, dimension, rating) => {
        setEvaluationData(prevData => ({
            ...prevData,
            [dimension]: {
                ...prevData[dimension],
                [member]: {
                    ...prevData[dimension]?.[member],
                    rating: rating
                }
            }
        }));
    };

    const handleCommentChange = (member, dimension, comment) => {
        setEvaluationData(prevData => ({
            ...prevData,
            [dimension]: {
                ...prevData[dimension],
                [member]: {
                    ...prevData[dimension]?.[member],
                    comment: comment
                }
            }
        }));
    };

    const handleSubmit = async () => {
        const user = auth.currentUser;
        const userId = user.uid;
        const groupId = await fetchStudentGroupId(userId);
    
        if (groupId) {
            // Navigate to the Confirmation page, passing evaluation data via state without uploading
            navigate("/confirmation", {
                state: { evaluationData, selectedMembers, dimensions, groupId, userId }
            });
        } else {
            console.error("Error: No groupId found for the user");
        }
    };

    return (
        <div>
            <div className="evaluation-title"> Evaluation</div>
            <p className="evaluate-p">Select members to evaluate</p>
    
            <div className="evaluate-div">
                <div className="evaluation-table-wrapper"> {/* Wrapper for centering */}
                    <table className="evaluation-table">
                        <thead>
                            <tr>
                                <th>Members</th>
                                <th>Evaluate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((member, index) => (
                                <tr key={index}>
                                    <td>{member.name}</td>
                                    <td>
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="selectedMember"
                                                className="checkmark"
                                                onClick={() => handleSelectMember(member.name)}
                                                checked={selectedMembers.includes(member.name)}
                                            />
                                            <span className="checkmark"></span>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
    
                <div className="dimensions-container">
                    <div className="scroll-bar">
                        {dimensions.map((dimension) => (
                            <div
                                key={dimension}
                                className={`dimension-box ${selectedDimension === dimension ? "selected" : ""}`}
                                onClick={() => handleSelectDimension(dimension)}
                            >
                                {dimension}
                            </div>
                        ))}
                    </div>
                </div>

                {selectedDimension && selectedMembers.length > 0 && (
                    selectedMembers.map((member) => (
                        <div className="rating-container" key={member}>
                            <div className="rating-box">
                                <span className="rating-label">{member} ({selectedDimension})</span>

                                {[1, 2, 3, 4, 5].map(ratingValue => (
                                    <React.Fragment key={ratingValue}>
                                        <input
                                            type="radio"
                                            id={`rate${ratingValue}-${member}-${selectedDimension}`}
                                            name={`rating${member}-${selectedDimension}`}
                                            value={ratingValue}
                                            checked={evaluationData[selectedDimension]?.[member]?.rating === ratingValue}
                                            onChange={() => handleRatingChange(member, selectedDimension, ratingValue)}
                                        />
                                        <label htmlFor={`rate${ratingValue}-${member}-${selectedDimension}`}>{ratingValue}</label>
                                    </React.Fragment>
                                ))}
                            </div>

                            <textarea
                                className="comment-box"
                                rows="4"
                                placeholder={`Add a comment for ${member} in ${selectedDimension} (optional)`}
                                value={evaluationData[selectedDimension]?.[member]?.comment || ''}
                                onChange={(e) => handleCommentChange(member, selectedDimension, e.target.value)}
                            />
                        </div>
                    ))
                )}

                <div className="button-container">
                    <button className="back-button" onClick={() => navigate("/profile")}>Go Back</button>
                    <button className="submit-button" onClick={handleSubmit}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default Evaluation;
