import { addDoc, collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import "./css-files/studentDB.css";

const StudentDashboard = () => {
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [overallGrade, setOverallGrade] = useState(null);
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState(""); // State for explanation text

  const navigate = useNavigate();

  const handleNotification = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("User not logged in.");
        return;
      }

      await addDoc(collection(db, "notifications"), {
        title: "Grade Contested",
        message: `${user.email} has contested their grade.`,
        explanation, // Include the student's explanation
        userId: user.uid,
        timestamp: new Date(),
      });

      setIsSent(true);
      setExplanation(""); // Clear the text box after submission
    } catch (error) {
      console.error("Error sending notification: ", error);
    }
  };

  const fetchTeamData = async (teamData) => {
    const membersDetails = [];
    for (let memberId of teamData.members) {
      const studentDoc = await getDocs(
        query(collection(db, "users"), where("__name__", "==", memberId))
      );
      if (!studentDoc.empty) {
        const studentData = studentDoc.docs[0].data();
        membersDetails.push({ id: memberId, name: studentData.name, email: studentData.email });
      }
    }
    return membersDetails;
  };

  const fetchStudentTeam = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "groups"), where("members", "array-contains", user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const teamData = querySnapshot.docs[0].data();
        setTeam({ id: querySnapshot.docs[0].id, ...teamData });
        const membersDetails = await fetchTeamData(teamData);
        setTeamMembers(membersDetails);
      }
    } catch (error) {
      console.error("Error fetching student team: ", error);
    }
  };

  const fetchOverallGrade = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const gradeDocRef = doc(db, "overall grades", user.uid);
      const gradeDoc = await getDoc(gradeDocRef);

      setOverallGrade(gradeDoc.exists() ? gradeDoc.data().grade : "N/A");
    } catch (error) {
      console.error("Error fetching overall grade: ", error);
    }
  };

  const fetchAllGroups = async () => {
    try {
      const groupSnapshot = await getDocs(collection(db, "groups"));
      const fetchedGroups = [];

      for (let groupDoc of groupSnapshot.docs) {
        const groupData = groupDoc.data();
        const membersDetails = [];

        // Resolve each UID to the user's name
        for (let memberId of groupData.members) {
          const userQuery = query(collection(db, "users"), where("__name__", "==", memberId));
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            membersDetails.push(userData.name);
          } else {
            membersDetails.push("Unknown Member");
          }
        }

        fetchedGroups.push({
          id: groupDoc.id,
          name: groupData.name,
          members: membersDetails,
        });
      }

      setGroups(fetchedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  useEffect(() => {
    fetchStudentTeam();
    fetchOverallGrade();
    fetchAllGroups();
  }, []);

  return (
    <div>
      {team ? (
        <div>
          <h2 className="text-position">You are assigned to: {team.name}</h2>
          <div className="grade-card-container">
            <div className="grade-card">
              <h3 className="grade-title">Your Overall Grade</h3>
              <div className="grade-value">
                {overallGrade !== null ? overallGrade : "Loading..."}
              </div>
              <textarea
                className="explanation-textbox"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Enter your explanation for challenging your grade..."
              />
              <button
                className="contest-grade-button"
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    await handleNotification();
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Challenge Grade"}
              </button>
              {isSent && <p className="confirmation-message">Notification sent!</p>}
            </div>
          </div>
          <h2>The following are your team members:</h2>
          <table className="team-table">
            <thead>
              <tr>
                <th>Members</th>
                <th>Emails</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>You are not assigned to any team yet.</p>
      )}
      <div className="button-container">
        <button
          className="evaluate-button"
          onClick={() => navigate("/evaluation", { state: { teamMembers } })}
        >
          Evaluate your team members
        </button>
      </div>
      <h2 className="text-position">The other groups of this course are as follows:</h2>
      <table className="group-table-student">
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Members</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.id}>
              <td><strong>{group.name}</strong></td>
              <td>{group.members.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentDashboard;
