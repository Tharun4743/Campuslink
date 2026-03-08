import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Award } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

type Lesson = {
  id: number;
  title: string;
  topic: string;
};

export default function TestArena() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await fetch('/api/lessons');
        if (res.ok) {
          const data = await res.json();
          setLessons(data);
        }
      } catch (error) {
        console.error('Failed to fetch lessons for TestArena', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading TestArena...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">TestArena</h1>
        <p className="mt-2 text-sm text-gray-600">Practice and evaluate your knowledge with quizzes and challenges.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {lesson.topic}
              </span>
              <Award className="h-5 w-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{lesson.title} Quiz</h3>
            <p className="text-sm text-gray-500 mb-6">Test your understanding of {lesson.title}.</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                ~5 mins
              </div>
              <Link
                to={`/quiz/${lesson.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Start Quiz
              </Link>
            </div>
          </div>
        ))}
        {lessons.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No quizzes available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
