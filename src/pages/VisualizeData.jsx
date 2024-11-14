import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './visualizedataGR.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const VisualizeData = () => {
  const [groupData, setGroupData] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the groupId from the URL query parameters
  const groupId = new URLSearchParams(location.search).get('groupId');

  useEffect(() => {
    if (!groupId) {
      alert('No group selected! Redirecting back to the dashboard.');
      navigate('/');
      return;
    }

    const fetchGroupData = async () => {
      const q = query(collection(db, 'evaluations'), where('groupId', '==', groupId));
      const groupSnapshot = await getDocs(q);
      const fetchedData = groupSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroupData(fetchedData);
    };

    fetchGroupData();
  }, [groupId, navigate]);

  // Process data for the grouped bar chart
  const processGroupedData = () => {
    const groupedData = {};

    groupData.forEach((evaluation) => {
      Object.keys(evaluation.evaluationData || {}).forEach((dimension) => {
        Object.keys(evaluation.evaluationData[dimension] || {}).forEach((student) => {
          if (!groupedData[student]) groupedData[student] = {};
          if (!groupedData[student][dimension]) groupedData[student][dimension] = [];
          groupedData[student][dimension].push(
            parseFloat(evaluation.evaluationData[dimension][student]?.rating) || 0
          );
        });
      });
    });

    return groupedData;
  };

  const groupedRatings = processGroupedData();

  // Prepare data for Grouped Bar Chart
  const dimensions = Object.keys(
    groupedRatings[Object.keys(groupedRatings)[0]] || {}
  ); // Get dimension keys
  const students = Object.keys(groupedRatings); // Get student keys

  const groupedBarChartData = {
    labels: dimensions, // Dimensions on the x-axis
    datasets: students.map((student, index) => ({
      label: student,
      data: dimensions.map(
        (dimension) =>
          groupedRatings[student][dimension]?.reduce((a, b) => a + b, 0) /
            groupedRatings[student][dimension]?.length || 0
      ),
      backgroundColor: `rgba(${(index * 40) % 255}, ${(index * 60) % 255}, ${(index * 80) % 255}, 0.7)`,
    })),
  };

  const pieChartData = {
    labels: dimensions,
    datasets: [
      {
        data: dimensions.map(
          (dimension) =>
            students.reduce(
              (sum, student) =>
                sum +
                (groupedRatings[student][dimension]?.reduce((a, b) => a + b, 0) /
                  groupedRatings[student][dimension]?.length || 0),
              0
            ) / students.length
        ),
        backgroundColor: ['#4682B4', '#87CEEB', '#1F2D3D', '#FF9F40', '#FF6384'],
      },
    ],
  };

  return (
    <div className="visualize-page">
      <button className="back-button" onClick={() => navigate('/groupevaluation')}>
        Back to Dashboard
      </button>
      <h2>Visualize Ratings for Group {groupId}</h2>
      <div className="chart-container">
        <div className="chart">
          <h3>Dimension Ratings by Student</h3>
          <Bar data={groupedBarChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
        <div className="chart">
          <h3>Average Ratings by Dimension</h3>
          <Pie data={pieChartData} />
        </div>
      </div>
    </div>
  );
};

export default VisualizeData;
