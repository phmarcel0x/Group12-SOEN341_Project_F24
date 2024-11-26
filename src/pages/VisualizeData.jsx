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
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import './css-file/visualizedataGR.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement
);

const VisualizeData = () => {
  const [groupData, setGroupData] = useState([]);
  const [groupName, setGroupName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the groupId from the URL query parameters
  const groupId = new URLSearchParams(location.search).get('groupId');

  const contrastingColors = [
    'rgba(255, 99, 132, 0.7)',  // Red
    'rgba(54, 162, 235, 0.7)',  // Blue
    'rgba(255, 206, 86, 0.7)',  // Yellow
    'rgba(75, 192, 192, 0.7)',  // Teal
    'rgba(153, 102, 255, 0.7)', // Purple
    'rgba(255, 159, 64, 0.7)',  // Orange
    'rgba(199, 199, 199, 0.7)', // Gray
  ];

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

      const groupQuery = query(collection(db, 'groups'), where('__name__', '==', groupId));
      const groupSnapshotName = await getDocs(groupQuery);
      const fetchedGroup = groupSnapshotName.docs.map((doc) => doc.data());
      setGroupName(fetchedGroup[0]?.name || 'Unknown Group');
    };

    fetchGroupData();
  }, [groupId, navigate]);

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

  const dimensions = Object.keys(
    groupedRatings[Object.keys(groupedRatings)[0]] || {}
  ); // Get dimension keys
  const students = Object.keys(groupedRatings); // Get student keys

  const groupedBarChartData = {
    labels: dimensions,
    datasets: students.map((student, index) => ({
      label: student,
      data: dimensions.map(
        (dimension) =>
          groupedRatings[student][dimension]?.reduce((a, b) => a + b, 0) /
            groupedRatings[student][dimension]?.length || 0
      ),
      backgroundColor: contrastingColors[index % contrastingColors.length],
    })),
  };

  const radarChartData = {
    labels: dimensions,
    datasets: students.map((student, index) => ({
      label: student,
      data: dimensions.map(
        (dimension) =>
          groupedRatings[student][dimension]?.reduce((a, b) => a + b, 0) /
            groupedRatings[student][dimension]?.length || 0
      ),
      backgroundColor: `${contrastingColors[index % contrastingColors.length].replace('0.7', '0.2')}`,
      borderColor: contrastingColors[index % contrastingColors.length].replace('0.7', '0.8'),
      borderWidth: 2,
    })),
  };

  return (
    <div className="visualize-page">
      <button className="back-button" onClick={() => navigate('/groupevaluation')}>
        Back to Dashboard
      </button>
      <h2>Visualize Ratings for Group: {groupName}</h2>
      <div className="chart-container">
        <div className="chart">
          <h3>Dimension-Wise Student Comparison</h3>
          <Radar data={radarChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
        <div className="chart">
          <h3>Dimension Ratings by Student</h3>
          <Bar data={groupedBarChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
      </div>
    </div>
  );
};

export default VisualizeData;