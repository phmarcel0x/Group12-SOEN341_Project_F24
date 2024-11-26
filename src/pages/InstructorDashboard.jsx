// InstructorDashboard.jsx

import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDocs,  query, where, } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./instructorDB.css";

const InstructorDashboard = () => {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const notificationRef = useRef(null);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  // Fetch groups and students
  useEffect(() => {
    const unsubscribeGroups = onSnapshot(collection(db, "groups"), (snapshot) => {
      const fetchedGroups = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGroups(fetchedGroups);
    });

    const fetchStudents = async () => {
      const q = query(collection(db, "users"), where("role", "==", "Student"));
      const querySnapshot = await getDocs(q);
      const fetchedStudents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(fetchedStudents);
    };

    fetchStudents();

    return () => unsubscribeGroups();
  }, []);

  // Fetch notifications
  useEffect(() => {
    const unsubscribeNotifications = onSnapshot(collection(db, "notifications"), (snapshot) => {
      const fetchedNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort notifications by timestamp (most recent first)
      const sortedNotifications = fetchedNotifications.sort(
        (a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis()
      );
      setNotifications(sortedNotifications);
      setUnreadCount(sortedNotifications.filter((notification) => !notification.read).length);
    });

    return () => unsubscribeNotifications();
  }, []);

  // Get the student name by ID
  const getStudentName = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    return student ? student.name : "Unknown Student";
  };

  // Close notification panel on outside click
  const handleClickOutside = (event) => {
    if (notificationRef.current && !notificationRef.current.contains(event.target)) {
      setIsNotificationPanelOpen(false);
    }
  };

  useEffect(() => {
    if (isNotificationPanelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationPanelOpen]);

  // Mark a single notification as read
  const markAsRead = async (notificationId) => {
    try {
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification && !notification.read) {
        const notificationRef = doc(db, "notifications", notificationId);
        await updateDoc(notificationRef, { read: true });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((notification) => !notification.read);
      for (const notification of unreadNotifications) {
        const notificationRef = doc(db, "notifications", notification.id);
        await updateDoc(notificationRef, { read: true });
      }
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Handle group creation
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
      console.error("Error creating group:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle student assignment to groups
  const handleAssignStudentToGroup = async (studentId, groupId) => {
    try {
      const groupWithStudent = groups.find((group) => group.members.includes(studentId));
      if (groupWithStudent) {
        const updatedMembers = groupWithStudent.members.filter((member) => member !== studentId);
        await updateDoc(doc(db, "groups", groupWithStudent.id), { members: updatedMembers });
      }

      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        members: [...groups.find((group) => group.id === groupId).members, studentId],
      });
    } catch (error) {
      console.error("Error assigning student to group:", error);
    }
  };

  // Handle group deletion
  const handleDeleteGroup = async (groupId) => {
    const confirmation = window.confirm(`Are you sure you want to delete this team?`);
    if (!confirmation) return;

    try {
      await deleteDoc(doc(db, "groups", groupId));
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Create a New Group</h2>
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <button className="create-button" onClick={handleCreateGroup} disabled={isCreating}>
        {isCreating ? "Creating..." : "Create Group"}
      </button>

      <div className="notification-container">
        <button
          className="notification-button"
          onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
        >
          Notifications
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </button>
        {isNotificationPanelOpen && (
          <div className="notification-panel" ref={notificationRef}>
            <h3>Notifications</h3>
            {notifications.length > 0 ? (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`notification-item ${
                      notification.read ? "read" : "unread"
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <p>
                      <strong>{notification.title}</strong>: {getStudentName(notification.userId)} has contested their grade.
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No notifications</p>
            )}
          </div>
        )}
      </div>

      <h2 style={{ textAlign: "center" }}>All Students</h2>
      <table className="students-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Assign to Team</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>
                <select
                  onChange={(e) => handleAssignStudentToGroup(student.id, e.target.value)}
                  value={groups.find((group) => group.members.includes(student.id))?.id || ""}
                >
                  <option value="" disabled>
                    Select Team
                  </option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ textAlign: "center" }}>Groups Overview</h2>
      <table className="group-table">
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Members</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.id}>
              <td>{group.name}</td>
              <td>
                {group.members
                  .map((memberId) => students.find((student) => student.id === memberId)?.name || "Unknown Student")
                  .join(", ")}
              </td>
              <td>
                <button className="delete-button" onClick={() => handleDeleteGroup(group.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="button-container">
        <button onClick={() => navigate("/groupevaluation")}>View the group evaluations</button>
      </div>
    </div>
  );
};

export default InstructorDashboard;
