import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Bar, Radar } from 'react-chartjs-2';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import './css-files/visualizedataGR.css';

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
  const [groupName, setGroupName] = useState('Unknown Group');
  const navigate = useNavigate();
  const location = useLocation();

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
    fetchGroupData(groupId);
  }, [groupId, navigate]);

  const fetchGroupData = async (id) => {
    try {
      const fetchedEvaluations = await fetchEvaluations(id);
      setGroupData(fetchedEvaluations);

      const fetchedGroupName = await fetchGroupName(id);
      setGroupName(fetchedGroupName || 'Unknown Group');
    } catch (error) {
      console.error('Error fetching group data:', error);
    }
  };

  const fetchEvaluations = async (id) => {
    const q = query(collection(db, 'evaluations'), where('groupId', '==', id));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const fetchGroupName = async (id) => {
    const q = query(collection(db, 'groups'), where('__name__', '==', id));
    const snapshot = await getDocs(q);
    const groupData = snapshot.docs.map((doc) => doc.data());
    return groupData[0]?.name;
  };

  const processGroupedData = () => {
    const groupedData = {};

    groupData.forEach((evaluation) => {
      processEvaluationData(evaluation, groupedData);
    });

    return groupedData;
  };

  const processEvaluationData = (evaluation, groupedData) => {
    Object.keys(evaluation.evaluationData || {}).forEach((dimension) => {
      processDimensionData(evaluation.evaluationData[dimension], dimension, groupedData);
    });
  };

  const processDimensionData = (dimensionData, dimension, groupedData) => {
    Object.keys(dimensionData || {}).forEach((student) => {
      groupedData[student] = groupedData[student] || {};
      groupedData[student][dimension] = groupedData[student][dimension] || [];
      groupedData[student][dimension].push(parseFloat(dimensionData[student]?.rating) || 0);
    });
  };

  const groupedRatings = processGroupedData();
  const dimensions = Object.keys(groupedRatings[Object.keys(groupedRatings)[0]] || {});
  const students = Object.keys(groupedRatings);

  const calculateAverageRatings = (student, dimension) =>
    groupedRatings[student][dimension]?.reduce((a, b) => a + b, 0) /
      groupedRatings[student][dimension]?.length || 0;

  const createChartData = (dataProcessor) =>
    students.map((student, index) => ({
      label: student,
      data: dimensions.map((dimension) => dataProcessor(student, dimension)),
      backgroundColor: contrastingColors[index % contrastingColors.length],
      borderColor: contrastingColors[index % contrastingColors.length].replace('0.7', '0.8'),
      borderWidth: 2,
    }));

  const groupedBarChartData = {
    labels: dimensions,
    datasets: createChartData(calculateAverageRatings),
  };

  const radarChartData = {
    labels: dimensions,
    datasets: createChartData((student, dimension) => calculateAverageRatings(student, dimension)),
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
          <Radar
            data={radarChartData}
            options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
          />
        </div>
        <div className="chart">
          <h3>Dimension Ratings by Student</h3>
          <Bar
            data={groupedBarChartData}
            options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
          />
        </div>
      </div>
    </div>
  );
};

export default VisualizeData;
