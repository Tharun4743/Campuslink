import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Upload, Users, BookOpen, AlertTriangle, CheckCircle, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../lib/AuthContext";

type AnalyticsData = {
  topic: string;
  total_attempts: number;
  correct_answers: number;
};

type PeerRequest = {
  id: number;
  student_name: string;
  topic: string;
  description: string;
  status: string;
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [peerRequests, setPeerRequests] = useState<PeerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalStudents: 0, lessonsCompleted: 0 });
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetails, setStudentDetails] = useState<any>({ analytics: [], skills: [], projects: [] });

  // New Lesson Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [topic, setTopic] = useState("");

  // Optional Quiz State
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    fetchPeerRequests();
    fetchStats();
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/teacher/students");
      if (res.ok) setStudents(await res.json());
    } catch (error) {
      console.error("Failed to fetch students");
    }
  };

  const handleSelectStudent = async (student: any) => {
    if (selectedStudent?.id === student.id) {
      setSelectedStudent(null);
      return;
    }
    setSelectedStudent(student);
    try {
      const [analyticsRes, skillsRes, projectsRes] = await Promise.all([
        fetch(`/api/analytics/${student.id}`),
        fetch(`/api/skills/${student.id}`),
        fetch(`/api/projects/${student.id}`)
      ]);
      setStudentDetails({
        analytics: analyticsRes.ok ? await analyticsRes.json() : [],
        skills: skillsRes.ok ? await skillsRes.json() : [],
        projects: projectsRes.ok ? await projectsRes.json() : []
      });
    } catch (error) {
      console.error("Failed to fetch details");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/teacher/dashboard-stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    }
  };

  const fetchPeerRequests = async () => {
    try {
      const res = await fetch("/api/peer-requests");
      if (res.ok) {
        const data = await res.json();
        setPeerRequests(data);
      }
    } catch (error) {
      console.error("Failed to fetch peer requests", error);
    }
  };

  const handleApproveRequest = async (id: number) => {
    try {
      const res = await fetch(`/api/peer-requests/${id}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutor_id: user?.id }), // Teacher acts as tutor or just approves it
      });
      if (res.ok) {
        fetchPeerRequests();
      }
    } catch (error) {
      console.error("Failed to approve request", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        title,
        content,
        video_url: videoUrl,
        topic,
        teacher_id: user?.id
      };

      if (quizQuestion && quizOptions.filter(o => o.trim()).length > 1) {
        payload.quiz = {
          question: quizQuestion,
          options: quizOptions,
          correct_answer: quizOptions[correctAnswer]
        };
      }

      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setUploadSuccess(true);
        setTitle("");
        setContent("");
        setVideoUrl("");
        setTopic("");
        setQuizQuestion("");
        setQuizOptions(["", "", "", ""]);
        setCorrectAnswer(0);
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to upload lesson", error);
    }
  };

  const chartData = analytics.map((item) => ({
    name: item.topic,
    Correct: item.correct_answers,
    Incorrect: item.total_attempts - item.correct_answers,
  }));

  const weakTopics = analytics.filter(
    (a) => a.correct_answers / a.total_attempts < 0.6,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Teacher Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor performance and manage content.
          </p>
        </div>
        <Link
          to="/hiring-board"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Briefcase className="mr-2 h-5 w-5" />
          Review Hiring Posts
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Students Active
                </dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalStudents}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Lessons Completed
                </dt>
                <dd className="text-lg font-medium text-gray-900">{stats.lessonsCompleted}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Weak Topics Detected
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {weakTopics.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Analytics Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Performance by Topic
          </h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Loading chart...
            </div>
          ) : chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Correct" stackId="a" fill="#10B981" />
                  <Bar dataKey="Incorrect" stackId="a" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data available yet.
            </div>
          )}

          {weakTopics.length > 0 && (
            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>AI Alert:</strong> Students are struggling with:{" "}
                    {weakTopics.map((t) => t.topic).join(", ")}. Consider
                    reviewing these topics.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Lesson Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Upload className="mr-2 h-5 w-5 text-indigo-500" />
            Upload New Lesson
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Topic
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Video URL (Optional)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-900 mb-3 text-indigo-600">Include a Quiz (Optional)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quiz Question</label>
                  <input
                    type="text"
                    value={quizQuestion}
                    onChange={(e) => setQuizQuestion(e.target.value)}
                    placeholder="e.g., What is the capital of France?"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                {quizQuestion.trim() && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Options & Correct Answer</label>
                      {quizOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2 mb-2">
                          <input
                            type="radio"
                            name="correct_answer"
                            checked={correctAnswer === idx}
                            onChange={() => setCorrectAnswer(idx)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...quizOptions];
                              newOpts[idx] = e.target.value;
                              setQuizOptions(newOpts);
                            }}
                            placeholder={`Option ${idx + 1}`}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Post Lesson & Send Notifications
              </button>
            </div>
            {uploadSuccess && (
              <div className="text-sm text-green-600 text-center mt-2">
                Lesson uploaded successfully!
              </div>
            )}
          </form>
        </div>
        {/* Peer Tutoring Overview */}
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Users className="mr-2 h-5 w-5 text-indigo-500" />
            BuddyUp Peer Tutoring Activity
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {peerRequests.slice(0, 5).map((req) => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.student_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.topic}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{req.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        req.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleApproveRequest(req.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {peerRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No peer tutoring requests found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Student Directory */}
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2 mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Users className="mr-2 h-5 w-5 text-indigo-500" />
            Student Directory (Year & Department Wise)
          </h2>

          <div className="overflow-x-auto border rounded-lg max-h-96 overflow-y-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year Level</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <React.Fragment key={student.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.department || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Year {student.year_level || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleSelectStudent(student)} className="text-indigo-600 hover:text-indigo-900">
                          {selectedStudent?.id === student.id ? 'Close' : 'View Progress'}
                        </button>
                      </td>
                    </tr>
                    {selectedStudent?.id === student.id && (
                      <tr className="bg-indigo-50/50">
                        <td colSpan={4} className="px-6 py-6 border-b border-indigo-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* TestArena Progress */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                              <h4 className="font-bold text-gray-800 mb-2 border-b pb-2">TestArena Analytics</h4>
                              {studentDetails.analytics.length > 0 ? (
                                <ul className="space-y-2 text-sm">
                                  {studentDetails.analytics.map((a: any, i: number) => (
                                    <li key={i} className="flex justify-between items-center">
                                      <span className="truncate w-32" title={a.topic}>{a.topic}</span>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.correct_answers / a.total_attempts >= 0.6 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {Math.round((a.correct_answers / a.total_attempts) * 100)}% ({a.correct_answers}/{a.total_attempts})
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-500">No quizzes taken yet.</p>
                              )}
                            </div>

                            {/* SkillSync Profile */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                              <h4 className="font-bold text-gray-800 mb-2 border-b pb-2">SkillSync Profile</h4>
                              <div className="space-y-2">

                                {studentDetails.skills.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-1">
                                    {studentDetails.skills.map((s: any) => (
                                      <span key={s.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        {s.skill_name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* LearnTracker & Projects */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                              <h4 className="font-bold text-gray-800 mb-2 border-b pb-2">LearnTracker & Projects</h4>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold uppercase">Recent Projects</p>
                                  {studentDetails.projects.length > 0 ? (
                                    <ul className="mt-1 space-y-1">
                                      {studentDetails.projects.map((p: any) => (
                                        <li key={p.id} className="text-sm text-indigo-600 truncate">
                                          &bull; {p.title}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-gray-500 mt-1">No projects linked.</p>
                                  )}
                                </div>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
