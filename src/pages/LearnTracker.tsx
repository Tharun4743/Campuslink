import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { TrendingUp, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type AnalyticsData = {
  topic: string;
  total_attempts: number;
  correct_answers: number;
};

export default function LearnTracker() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics/${user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = analytics.map((item) => ({
    name: item.topic,
    Score: Math.round((item.correct_answers / item.total_attempts) * 100) || 0,
  }));

  const weakTopics = analytics.filter(
    (a) => a.correct_answers / a.total_attempts < 0.6,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-indigo-600" />
          LearnTracker
        </h1>
        <p className="mt-2 text-gray-600">Track your learning progress, test results, and weak areas.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Topics Covered
                </dt>
                <dd className="text-lg font-medium text-gray-900">{analytics.length}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Average Score
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {analytics.length > 0
                    ? Math.round(
                        analytics.reduce((acc, curr) => acc + (curr.correct_answers / curr.total_attempts), 0) /
                          analytics.length * 100
                      )
                    : 0}
                  %
                </dd>
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
                  Areas to Improve
                </dt>
                <dd className="text-lg font-medium text-gray-900">{weakTopics.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Performance by Topic</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">Loading chart...</div>
          ) : chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Score" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">No data available yet.</div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Weak Areas Detected
          </h2>
          {weakTopics.length > 0 ? (
            <div className="space-y-4">
              {weakTopics.map((topic, index) => (
                <div key={index} className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-md">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        {topic.topic}
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Your accuracy is {Math.round((topic.correct_answers / topic.total_attempts) * 100)}%. Consider reviewing the lessons or requesting help on BuddyUp.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Great job!</h3>
              <p className="mt-1 text-sm text-gray-500">No weak areas detected yet. Keep up the good work.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
