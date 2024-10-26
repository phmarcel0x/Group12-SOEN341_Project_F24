import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from "../../firebaseConfig";
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

    const handleSubmit = () => {
        // Debugging: Log the data that will be passed to the confirmation page
        console.log('Evaluation Data:', evaluationData);
        console.log('Selected Members:', selectedMembers);

        // Make sure there is evaluation data to pass
        if (Object.keys(evaluationData).length === 0 || selectedMembers.length === 0) {
            alert("Please evaluate at least one member and dimension.");
            return;
        }

        // Navigate to the confirmation page
        navigate("/confirmation", { state: { evaluationData, selectedMembers, dimensions } });
    };

    return (
        <div>
            <div className="evaluation-title"> Evaluation</div>
            <p className='evaluate-p'>Select members to evaluate</p>

            <div className='evaluate-div'>
                <table className='evaluation-table'>
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
                    <button className="submit-button" onClick={handleSubmit}>Submit</button>
                </div>
            </div>
        </div>
    );
};

export default Evaluation;
