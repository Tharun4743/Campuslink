import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, BrainCircuit, TrendingUp, Briefcase } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex-1 bg-white">
      {/* Hero Section */}
      <div className="relative bg-indigo-600 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-indigo-600 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">CampusLink</span>{' '}
                  <span className="block text-indigo-200 text-3xl mt-2">Internal Learning & Talent Ecosystem</span>
                </h1>
                <p className="mt-3 text-base text-indigo-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  A Collaborative Academic Management and Peer Utility System. Connect learning, testing, peer tutoring, skill collaboration, and progress tracking inside one college ecosystem.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/signup/student"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                    >
                      I'm a Student
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/signup/teacher"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-400 md:py-4 md:text-lg md:px-10"
                    >
                      I'm a Teacher
                    </Link>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-sm text-indigo-200">
                    Already have an account? <Link to="/login" className="font-bold text-white hover:underline">Log in here</Link>
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-indigo-800 flex items-center justify-center p-12">
          <BookOpen className="w-64 h-64 text-indigo-400 opacity-50" />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to learn
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <BookOpen className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">VideoLearner & TestArena</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Watch concept explanations and learn at your own pace. Practice with quizzes and coding challenges to evaluate your knowledge.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <Users className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">BuddyUp</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  A peer tutoring system where strong students help weak students in specific subjects through dynamic discussions.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <Briefcase className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">SkillSync</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  A hub where students showcase skills, upload projects, and form teams to collaborate with others.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <TrendingUp className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">LearnTracker</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Tracks student learning progress, test results, and weak areas with real-time analytics and reporting.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
