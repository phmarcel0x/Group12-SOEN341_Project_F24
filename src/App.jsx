import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Footer from './components/Footer';
import InstructorDashboard from './pages/InstructorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Evaluation from './pages/Evaluation';
import Confirmation from './pages/Confirmation';
import Submission from './pages/Submission';
import GroupEvaluation from './pages/GroupEvaluation';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/evaluation" element={<Evaluation />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/submission" element={<Submission />} />
        <Route path="/groupevaluation" element={<GroupEvaluation />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
