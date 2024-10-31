import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './groupevaluation.css';

const GroupEvaluation = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [users, setUsers] = useState([]);

    const dimensions = [
        "Conceptual Contribution",
        "Practical Contribution",
        "Work Ethic",
        "Team Collaboration",
        "Leadership"
    ];

    useEffect(() => {
        // Fetch all groups from Firestore
        const fetchGroups = async () => {
            const groupSnapshot = await getDocs(collection(db, "groups"));
            const fetchedGroups = groupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGroups(fetchedGroups);
        };

        // Fetch all users from Firestore to map evaluator names
        const fetchUsers = async () => {
            const userSnapshot = await getDocs(collection(db, "users"));
            const fetchedUsers = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(fetchedUsers);
        };

        fetchGroups();
        fetchUsers();
    }, []);

    const handleGroupSelect = async (groupId) => {
        setSelectedGroup(groupId);

        // Get the members of the selected group
        const group = groups.find(g => g.id === groupId);
        const members = group ? group.members : [];
        setGroupMembers(members);

        // Fetch all evaluations for the selected group
        const q = query(collection(db, "evaluations"), where("groupId", "==", groupId));
        const evaluationSnapshot = await getDocs(q);
        const fetchedEvaluations = evaluationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvaluations(fetchedEvaluations);
    };

    const getStudentName = (studentId) => {
        const student = users.find(user => user.id === studentId);
        return student ? student.name : "Unknown Student";
    };

    const calculateAverageOverallRating = (studentId) => {
        const studentEvaluations = evaluations.filter(evaluation =>
            Object.keys(evaluation.overallRatings).includes(studentId)
        );
        if (studentEvaluations.length === 0) return "No rating";

        const totalRating = studentEvaluations.reduce((sum, evaluation) => sum + parseFloat(evaluation.overallRatings[studentId]), 0);
        return (totalRating / studentEvaluations.length).toFixed(1);
    };

    return (
        <div className="groupevaluation-page">
            <h2>Select a Group to View Evaluations</h2>

            {/* Group Selection Dropdown */}
            <select
                className="group-select"
                onChange={(e) => handleGroupSelect(e.target.value)}
                value={selectedGroup || ""}
            >
                <option value="" disabled>Select a Group</option>
                {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                ))}
            </select>

            {/* Show evaluations for all students in the selected group */}
            {selectedGroup && (
                <div className="evaluation-results">
                    {groupMembers.map(studentId => (
                        <div key={studentId} className="student-evaluation">
                            <h3>{getStudentName(studentId)} - Overall Rating: {calculateAverageOverallRating(studentId)}</h3>
                            
                            <table className="evaluation-table">
                                <thead>
                                    <tr>
                                        <th>Evaluator</th>
                                        {dimensions.map(dimension => (
                                            <th key={dimension}>{dimension}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {evaluations
                                        .filter(evaluation => Object.keys(evaluation.evaluationData[dimensions[0]] || {}).includes(studentId))
                                        .map(evaluation => (
                                            <tr key={evaluation.id}>
                                                <td>{getStudentName(evaluation.evaluatorId)}</td>
                                                {dimensions.map(dimension => (
                                                    <td key={dimension}>
                                                        <div>
                                                            Rating: {evaluation.evaluationData[dimension]?.[studentId]?.rating || "N/A"}
                                                        </div>
                                                        <div>
                                                            Comment: {evaluation.evaluationData[dimension]?.[studentId]?.comment || "No comment"}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GroupEvaluation;
