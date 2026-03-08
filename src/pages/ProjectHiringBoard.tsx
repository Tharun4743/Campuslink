import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Briefcase, Users, Calendar, PlusCircle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

type HiringPost = {
  id: number;
  student_id: number;
  student_name: string;
  title: string;
  description: string;
  required_skills: string;
  project_type: string;
  team_size: number;
  deadline: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  applicant_count?: number;
};

type Applicant = {
  id: number;
  post_id: number;
  applicant_id: number;
  full_name: string;
  email: string;
  department: string;
  year_level: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
};

export default function ProjectHiringBoard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<HiringPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>(user?.role === 'teacher' ? 'all' : 'all');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [projectType, setProjectType] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [deadline, setDeadline] = useState('');

  // Applicants Modal
  const [selectedPost, setSelectedPost] = useState<HiringPost | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [user, activeTab]);

  const fetchPosts = async (tabToFetch = activeTab) => {
    setLoading(true);
    try {
      let endpoint = '';
      if (tabToFetch === 'my') {
        endpoint = `/api/hiring-posts/my-posts/${user?.id}`;
      } else {
        endpoint = user?.role === 'teacher' ? '/api/hiring-posts/all' : '/api/hiring-posts';
      }

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch hiring posts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hiring-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user?.id,
          title,
          description,
          required_skills: requiredSkills,
          project_type: projectType,
          team_size: teamSize,
          deadline,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setTitle('');
        setDescription('');
        setRequiredSkills('');
        setProjectType('');
        setTeamSize(1);
        setDeadline('');
        setActiveTab('my'); // Switch to my posts after creating
        fetchPosts('my'); // Request with 'my' directly to avoid state race condition
      }
    } catch (error) {
      console.error('Failed to create post', error);
    }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/hiring-posts/${id}/${action}`, {
        method: 'PUT',
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (error) {
      console.error(`Failed to ${action} post`, error);
    }
  };

  const handleApply = async (postId: number) => {
    try {
      const res = await fetch(`/api/hiring-posts/${postId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicant_id: user?.id })
      });
      if (res.ok) {
        alert("Applied successfully!");
      } else {
        alert("You have already applied or there was an error.");
      }
    } catch (error) {
      console.error('Failed to apply', error);
    }
  };

  const viewApplicants = async (post: HiringPost) => {
    if (selectedPost?.id === post.id) {
      setSelectedPost(null);
      return;
    }
    setSelectedPost(post);
    setLoadingApplicants(true);
    try {
      const res = await fetch(`/api/hiring-posts/${post.id}/applicants`);
      if (res.ok) {
        setApplicants(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch applicants', error);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const updateApplicationStatus = async (applicationId: number, status: 'accepted' | 'rejected') => {
    try {
      const res = await fetch(`/api/hiring-posts/applications/${applicationId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Refresh applicants
        if (selectedPost) viewApplicants(selectedPost);
      }
    } catch (error) {
      console.error('Failed to update application', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-indigo-600" />
            Project Hiring Board
          </h1>
          <p className="mt-2 text-gray-600">Find team members or join exciting projects.</p>
        </div>

        {user?.role === 'student' && !showForm && (
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Post
            </button>
          </div>
        )}
      </div>

      {user?.role === 'student' && (
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'all' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            All Projects
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'my' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            My Posts
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-8 border border-indigo-100">
          <div className="flex justify-between items-center mb-4 border-b pb-2 border-gray-100">
            <h2 className="text-xl font-bold text-indigo-900">Create Hiring Post</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., Looking for Frontend Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Specific Role Needed</label>
                <input
                  type="text"
                  required
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., UI/UX Designer, Backend Developer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Describe your project and what you are looking for..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Required Skills</label>
              <input
                type="text"
                required
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., React, Node.js, UI Design"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Team Size Needed</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={teamSize}
                  onChange={(e) => setTeamSize(parseInt(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Submit for Approval
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
          {activeTab === 'my' ? "You haven't created any posts yet." : "No hiring posts available at the moment. Create one or check 'My Posts'."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {post.project_type}
                      </span>
                      {(user?.role === 'teacher' || activeTab === 'my') && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          post.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {post.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{post.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">Posted by <span className="font-medium text-gray-900">{activeTab === 'my' ? 'You' : post.student_name}</span></p>
                  </div>

                  {user?.role === 'teacher' && post.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(post.id, 'approve')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(post.id, 'reject')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="mr-1 h-4 w-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-gray-700 whitespace-pre-wrap">
                  {post.description}
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Briefcase className="mr-2 h-5 w-5 text-gray-400" />
                    <span className="font-medium mr-1">Skills:</span> {post.required_skills}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="mr-2 h-5 w-5 text-gray-400" />
                    <span className="font-medium mr-1">Team Size:</span> {post.team_size} members
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                    <span className="font-medium mr-1">Deadline:</span> {new Date(post.deadline).toLocaleDateString()}
                  </div>
                </div>

                {user?.role === 'student' && activeTab === 'all' && post.student_id !== user?.id && (
                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => handleApply(post.id)}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Apply for Project
                    </button>
                  </div>
                )}

                {activeTab === 'my' && (
                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => viewApplicants(post)}
                      className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      <Users className="mr-1 h-5 w-5" />
                      View Applicants ({post.applicant_count || 0})
                      {selectedPost?.id === post.id ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                    </button>

                    {selectedPost?.id === post.id && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">Applicants List</h4>
                        {loadingApplicants ? (
                          <p className="text-sm text-gray-500">Loading applicants...</p>
                        ) : applicants.length === 0 ? (
                          <p className="text-sm text-gray-500">No one has applied yet.</p>
                        ) : (
                          <ul className="space-y-4">
                            {applicants.map(app => (
                              <li key={app.id} className="bg-white p-3 rounded border border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center">
                                <div>
                                  <p className="font-medium text-gray-900">{app.full_name}</p>
                                  <p className="text-xs text-gray-500">{app.department} &bull; {app.year_level}</p>
                                  <p className="text-xs text-indigo-600">{app.email}</p>
                                </div>
                                <div className="mt-3 sm:mt-0 flex items-center gap-2">
                                  {app.status === 'pending' ? (
                                    <>
                                      <button
                                        onClick={() => updateApplicationStatus(app.id, 'accepted')}
                                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        onClick={() => updateApplicationStatus(app.id, 'rejected')}
                                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  ) : (
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${app.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
