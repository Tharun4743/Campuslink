import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, PlayCircle, CheckCircle, BrainCircuit, TrendingUp, Users, Briefcase } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

type Lesson = {
  id: number;
  title: string;
  content: string;
  video_url: string;
  topic: string;
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [recommendations, setRecommendations] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resLessons = await fetch('/api/lessons');
        if (resLessons.ok) {
          const data = await resLessons.json();
          setLessons(data);
          localStorage.setItem('cachedLessons', JSON.stringify(data));
        }

        if (user) {
          const resRecs = await fetch(`/api/ai/recommendations/${user.id}`);
          if (resRecs.ok) {
            const recData = await resRecs.json();
            setRecommendations(recData.recommendations);
          }
        }
      } catch (error) {
        console.log('Offline mode: loading cached data');
        const cached = localStorage.getItem('cachedLessons');
        if (cached) setLessons(JSON.parse(cached));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.full_name}!</h1>
        <p className="mt-2 text-sm text-gray-600">Here's your learning overview for today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Lessons */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Available Lessons</h2>
            <Link to="/lessons" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">View All</Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {lessons.slice(0, 4).map((lesson) => (
              <div key={lesson.id} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {lesson.topic}
                    </span>
                    <BookOpen className="h-5 w-5 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{lesson.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{lesson.content}</p>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <Link
                      to={`/lessons/${lesson.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Start
                    </Link>
                    <Link
                      to="/test-arena"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      TestArena
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - AI & Progress */}
        <div className="space-y-8">
          {/* AI Recommendations */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <BrainCircuit className="h-8 w-8 text-indigo-100" />
              <h2 className="text-xl font-bold">AI Recommendations</h2>
            </div>
            {recommendations ? (
              <div className="prose prose-sm prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-indigo-50 leading-relaxed">{recommendations}</p>
              </div>
            ) : (
              <p className="text-indigo-100 text-sm">Take some quizzes to get personalized AI learning recommendations!</p>
            )}
            <div className="mt-6">
              <Link
                to="/ai-tutor"
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
              >
                Chat with AI Tutor
              </Link>
            </div>
          </div>

          {/* Quick Stats & Links */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">CampusLink Modules</h2>
            </div>
            <div className="space-y-4">
              <Link to="/learn-tracker" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-indigo-500" />
                  <span className="font-medium text-gray-900">LearnTracker</span>
                </div>
                <span className="text-sm text-indigo-600">View Analytics &rarr;</span>
              </Link>
              <Link to="/buddy-up" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-indigo-500" />
                  <span className="font-medium text-gray-900">BuddyUp</span>
                </div>
                <span className="text-sm text-indigo-600">Get Help &rarr;</span>
              </Link>
              <Link to="/skill-sync" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-indigo-500" />
                  <span className="font-medium text-gray-900">SkillSync</span>
                </div>
                <span className="text-sm text-indigo-600">Showcase Skills &rarr;</span>
              </Link>
              <Link to="/hiring-board" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-indigo-500" />
                  <span className="font-medium text-gray-900">Project Hiring Board</span>
                </div>
                <span className="text-sm text-indigo-600">Find Teams &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
