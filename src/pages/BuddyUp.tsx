import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Users, PlusCircle, CheckCircle, MessageSquare, Send } from 'lucide-react';

type PeerRequestComment = {
  id: number;
  request_id: number;
  student_id: number;
  author_name: string;
  comment: string;
  created_at: string;
};

type PeerRequest = {
  id: number;
  student_id: number;
  student_name: string;
  topic: string;
  description: string;
  status: 'pending' | 'accepted' | 'completed';
  tutor_id: number | null;
  comments?: PeerRequestComment[];
};

export default function BuddyUp() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PeerRequest[]>([]);
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  // Comments state
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/peer-requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch peer requests', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (requestId: number) => {
    try {
      const res = await fetch(`/api/peer-requests/${requestId}/comments`);
      if (res.ok) {
        const comments = await res.json();
        setRequests(prev => prev.map(r => r.id === requestId ? { ...r, comments } : r));
      }
    } catch (error) {
      console.error('Failed to load comments', error);
    }
  };

  const handleToggleComments = (requestId: number) => {
    if (expandedRequestId === requestId) {
      setExpandedRequestId(null);
    } else {
      setExpandedRequestId(requestId);
      loadComments(requestId);
    }
  };

  const handlePostComment = async (e: React.FormEvent, requestId: number) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`/api/peer-requests/${requestId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user?.id, comment: commentText })
      });
      if (res.ok) {
        setCommentText('');
        loadComments(requestId);
      }
    } catch (error) {
      console.error('Failed to post comment', error);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/peer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user?.id, topic, description }),
      });
      if (res.ok) {
        setTopic('');
        setDescription('');
        fetchRequests();
      }
    } catch (error) {
      console.error('Failed to create request', error);
    }
  };

  const handleAcceptRequest = async (id: number) => {
    try {
      const res = await fetch(`/api/peer-requests/${id}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutor_id: user?.id }),
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Failed to accept request', error);
    }
  };

  const handleCompleteRequest = async (id: number) => {
    try {
      const res = await fetch(`/api/peer-requests/${id}/complete`, {
        method: 'PUT',
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Failed to complete request', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-8 w-8 text-indigo-600" />
          BuddyUp
        </h1>
        <p className="mt-2 text-gray-600">Post a topic you need help with, and other students can comment and help out.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 sticky top-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-indigo-500" />
              Request Help
            </h2>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Topic / Subject</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., Calculus, React.js"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="What exactly do you need help with?"
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6 border-b pb-4">Community Requests</h2>
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <p className="text-gray-500 text-center py-10 bg-gray-50 rounded-lg">No open requests at the moment.</p>
            ) : (
              <div className="space-y-6">
                {requests.map((req) => (
                  <div key={req.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white">
                    <div className="p-5">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{req.topic}</h3>
                          <p className="text-gray-700 mt-2 whitespace-pre-wrap">{req.description}</p>

                          <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5 font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
                              <Users className="w-4 h-4" />
                              {req.student_name}
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                req.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                              }`}>
                              {req.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {req.status === 'pending' && req.student_id !== user?.id && (
                            <button
                              onClick={() => handleAcceptRequest(req.id)}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                              Offer Help
                            </button>
                          )}
                          {req.status === 'accepted' && (req.student_id === user?.id || req.tutor_id === user?.id) && (
                            <button
                              onClick={() => handleCompleteRequest(req.id)}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="mr-1.5 h-4 w-4" /> Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Comments Section Toggle */}
                    <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 flex justify-between items-center">
                      <button
                        onClick={() => handleToggleComments(req.id)}
                        className="text-sm font-medium text-gray-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {expandedRequestId === req.id ? 'Hide Comments' : 'Discussion & Comments'}
                      </button>
                    </div>

                    {/* Expanded Comments */}
                    {expandedRequestId === req.id && (
                      <div className="border-t border-gray-200 bg-white">
                        <div className="p-5 max-h-80 overflow-y-auto space-y-4">
                          {!req.comments ? (
                            <p className="text-sm text-gray-500 text-center">Loading comments...</p>
                          ) : req.comments.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center italic">No comments yet. Be the first to reply!</p>
                          ) : (
                            req.comments.map(c => (
                              <div key={c.id} className="bg-gray-50 rounded-lg p-3 relative">
                                <span className="font-semibold text-sm text-gray-900">{c.author_name}</span>
                                {c.student_id === req.student_id && (
                                  <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Author</span>
                                )}
                                <span className="text-xs text-gray-400 ml-3">{new Date(c.created_at).toLocaleDateString()}</span>
                                <p className="text-sm text-gray-700 mt-1.5">{c.comment}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Leave a comment Input */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                          <form onSubmit={(e) => handlePostComment(e, req.id)} className="flex gap-2">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder={`Reply to ${req.student_name}...`}
                              className="flex-1 rounded-full border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                            />
                            <button
                              type="submit"
                              disabled={!commentText.trim()}
                              className="inline-flex items-center justify-center p-2 rounded-full border border-transparent shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="w-4 h-4 mx-1" />
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
