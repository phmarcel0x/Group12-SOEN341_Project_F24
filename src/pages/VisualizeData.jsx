import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    const fetchGroupData = async () => {
      const groupSnapshot = await getDocs(collection(db, 'evaluations'));
      const fetchedData = groupSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroupData(fetchedData);
    };

    fetchGroupData();
  }, []);

  // Sample Data Processing for Charts
  const processRatingsData = () => {
    const ratings = groupData.flatMap((evalData) =>
      Object.keys(evalData.evaluationData || {}).map((dimension) => ({
        dimension,
        ratings: Object.values(evalData.evaluationData[dimension] || {}).map((entry) =>
          parseFloat(entry.rating)
        ),
      }))
    );

    const dimensionRatings = ratings.reduce((acc, curr) => {
      if (!acc[curr.dimension]) acc[curr.dimension] = [];
      acc[curr.dimension] = acc[curr.dimension].concat(curr.ratings);
      return acc;
    }, {});

    const averageRatings = Object.keys(dimensionRatings).map((dimension) => ({
      dimension,
      average: (
        dimensionRatings[dimension].reduce((sum, val) => sum + val, 0) /
        dimensionRatings[dimension].length
      ).toFixed(2),
    }));

    return { dimensionRatings, averageRatings };
  };

  const { dimensionRatings, averageRatings } = processRatingsData();

  // Chart Data
  const pieChartData = {
    labels: averageRatings.map((data) => data.dimension),
    datasets: [
      {
        data: averageRatings.map((data) => parseFloat(data.average)),
        backgroundColor: ['#4682B4', '#87CEEB', '#1F2D3D', '#FF9F40', '#FF6384'],
      },
    ],
  };

  const barChartData = {
    labels: Object.keys(dimensionRatings),
    datasets: [
      {
        label: 'Ratings',
        data: Object.values(dimensionRatings).map((ratings) =>
          ratings.reduce((sum, val) => sum + val, 0) / ratings.length
        ),
        backgroundColor: '#4682B4',
      },
    ],
  };

  return (
    <div className="visualize-page">
      <button className="back-button" onClick={() => navigate('/')}>
        Back to Dashboard
      </button>
      <h2>Visualize Ratings Data</h2>
      <div className="chart-container">
        <div className="chart">
          <h3>Average Ratings by Dimension</h3>
          <Pie data={pieChartData} />
        </div>
        <div className="chart">
          <h3>Dimension Ratings Comparison</h3>
          <Bar data={barChartData} />
        </div>
      </div>
    </div>
  );
};

export default VisualizeData;