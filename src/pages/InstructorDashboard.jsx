// InstructorDashboard.jsx

import React, { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import './instructorDB.css';

const InstructorDashboard = () => {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);

  // Fetching Groups and Students
  useEffect(() => {
    // Subscribe to changes in the 'groups' collection
    const unsubscribeGroups = onSnapshot(collection(db, "groups"), (snapshot) => {
      const fetchedGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(fetchedGroups);
    });

    // Fetch all users with the role "Student"
    const fetchStudents = async () => {
      const q = query(collection(db, "users"), where("role", "==", "Student"));
      const querySnapshot = await getDocs(q);
      const fetchedStudents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(fetchedStudents);
    };

    fetchStudents();

    return () => {
      unsubscribeGroups();
    };
  }, []);

  // Function to handle group creation
   const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert("Group name cannot be empty"); 
      return;
    }
    setIsCreating(true); 
    try {
      await addDoc(collection(db, "groups"), {
        name: groupName,
        members: [],
      });
      setGroupName(""); 
    } catch (error) {
      console.error("Error creating group: ", error);
    } finally {
      setIsCreating(false); 
    }
  };

  // Function to assign a student to a group
  const handleAssignStudentToGroup = async (studentId, groupId) => {
    try {
      // Remove student from any existing group before assigning
      const groupWithStudent = groups.find(group => group.members.includes(studentId));
      if (groupWithStudent) {
        const updatedMembers = groupWithStudent.members.filter(member => member !== studentId);
        await updateDoc(doc(db, "groups", groupWithStudent.id), { members: updatedMembers });
      }

      // Add student to the new group
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        members: [...groups.find(group => group.id === groupId).members, studentId],
      });
    } catch (error) {
      console.error("Error assigning student to group: ", error);
    }
  };

  // Function to delete group
  const handleDeleteGroup = async (groupId) => {
    const confirmation = window.confirm(`Are you sure you want to delete this team?`);
    if (!confirmation) return;

    try {
      const group = groups.find(group => group.id === groupId);
      
      // Unassign all members of the group
      const updatedStudents = students.map(student => {
        if (group.members.includes(student.id)) {
          return { ...student, group: null };
        }
        return student;
      });
      setStudents(updatedStudents);

      // Delete the group
      await deleteDoc(doc(db, "groups", groupId));
    } catch (error) {
      console.error("Error deleting group: ", error);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Create a New Group</h2>
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <button className="create-button" onClick={handleCreateGroup}>Create Group</button>

      <h2 style={{ textAlign: 'center' }}>All Students</h2>
      <table className="students-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>ID</th>
            <th>Assign to Team</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.id}</td>
              <td>
                <select
                  onChange={(e) => handleAssignStudentToGroup(student.id, e.target.value)}
                  value={groups.find(group => group.members.includes(student.id))?.id || ""}
                >
                  <option value="" disabled>Select Team</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ textAlign: 'center' }}>Groups Overview</h2>
      <ul>
        {groups.map(group => (
          <li key={group.id}>
            <strong>{group.name}</strong>
            <p>Members: {group.members.map(memberId => {
              const student = students.find(student => student.id === memberId);
              return student ? student.name : "Unknown Student";
            }).join(", ")}</p>
            <button className="delete-button" onClick={() => handleDeleteGroup(group.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InstructorDashboard;
