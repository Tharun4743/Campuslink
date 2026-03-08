import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, PlayCircle, CheckCircle } from "lucide-react";

type Lesson = {
  id: number;
  title: string;
  content: string;
  video_url: string;
  topic: string;
};

export default function Lessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await fetch("/api/lessons");
        if (res.ok) {
          const data = await res.json();
          setLessons(data);
          localStorage.setItem("cachedLessons", JSON.stringify(data));
        }
      } catch (error) {
        console.log("Offline mode: loading cached lessons");
        const cached = localStorage.getItem("cachedLessons");
        if (cached) setLessons(JSON.parse(cached));
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading lessons...</div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">VideoLearner</h1>
        <p className="mt-2 text-sm text-gray-600">
          Watch concept explanations and learn at your own pace.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {lesson.topic}
                </span>
                <BookOpen className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {lesson.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {lesson.content}
              </p>

              <div className="mt-6 flex items-center justify-between">
                <Link
                  to={`/lessons/${lesson.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Lesson
                </Link>
                <Link
                  to={`/quiz/${lesson.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Take Quiz
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
