import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import StudentSignup from "./pages/StudentSignup";
import TeacherSignup from "./pages/TeacherSignup";
import StudentDashboard from "./pages/StudentDashboard";
import Login from "./pages/Login";
import Lessons from "./pages/Lessons";
import LessonViewer from "./pages/LessonViewer";
import QuizPage from "./pages/QuizPage";
import AITutorChat from "./pages/AITutorChat";
import TeacherDashboard from "./pages/TeacherDashboard";
import Settings from "./pages/Settings";
import BuddyUp from "./pages/BuddyUp";
import SkillSync from "./pages/SkillSync";
import LearnTracker from "./pages/LearnTracker";
import TestArena from "./pages/TestArena";
import ProjectHiringBoard from "./pages/ProjectHiringBoard";
import "./lib/offlineSync";

function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "student" | "teacher";
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={user ? <Navigate to={user.role === 'student' ? '/student-dashboard' : '/teacher-dashboard'} /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to={user.role === 'student' ? '/student-dashboard' : '/teacher-dashboard'} /> : <Login />} />
          <Route path="/signup/student" element={user ? <Navigate to={user.role === 'student' ? '/student-dashboard' : '/teacher-dashboard'} /> : <StudentSignup />} />
          <Route path="/signup/teacher" element={user ? <Navigate to={user.role === 'student' ? '/student-dashboard' : '/teacher-dashboard'} /> : <TeacherSignup />} />

          {/* Student Routes */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons"
            element={
              <ProtectedRoute role="student">
                <Lessons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/:id"
            element={
              <ProtectedRoute role="student">
                <LessonViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:id"
            element={
              <ProtectedRoute role="student">
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-tutor"
            element={
              <ProtectedRoute role="student">
                <AITutorChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-arena"
            element={
              <ProtectedRoute role="student">
                <TestArena />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buddy-up"
            element={
              <ProtectedRoute role="student">
                <BuddyUp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/skill-sync"
            element={
              <ProtectedRoute role="student">
                <SkillSync />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learn-tracker"
            element={
              <ProtectedRoute role="student">
                <LearnTracker />
              </ProtectedRoute>
            }
          />


          {/* Teacher Routes */}
          <Route
            path="/teacher-dashboard"
            element={
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          {/* Shared Routes */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hiring-board"
            element={
              <ProtectedRoute>
                <ProjectHiringBoard />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route
            path="*"
            element={
              user ? (
                <Navigate
                  to={
                    user.role === "student" ? "/student-dashboard" : "/teacher-dashboard"
                  }
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
