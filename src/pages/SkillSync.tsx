import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Briefcase, Star, Plus } from 'lucide-react';

type Skill = {
  id: number;
  skill_name: string;
  proficiency: string;
};

type Project = {
  id: number;
  title: string;
  description: string;
  link: string;
};

export default function SkillSync() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [skillName, setSkillName] = useState('');
  const [proficiency, setProficiency] = useState('Beginner');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectLink, setProjectLink] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [resSkills, resProjects] = await Promise.all([
        fetch(`/api/skills/${user?.id}`),
        fetch(`/api/projects/${user?.id}`)
      ]);
      
      if (resSkills.ok) setSkills(await resSkills.json());
      if (resProjects.ok) setProjects(await resProjects.json());
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user?.id, skill_name: skillName, proficiency }),
      });
      if (res.ok) {
        setSkillName('');
        setProficiency('Beginner');
        fetchData();
      }
    } catch (error) {
      console.error('Failed to add skill', error);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user?.id, title: projectTitle, description: projectDesc, link: projectLink }),
      });
      if (res.ok) {
        setProjectTitle('');
        setProjectDesc('');
        setProjectLink('');
        fetchData();
      }
    } catch (error) {
      console.error('Failed to add project', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-indigo-600" />
          SkillSync
        </h1>
        <p className="mt-2 text-gray-600">Showcase your skills, projects, and collaborate with others.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skills Section */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-indigo-500" />
              Add Skill
            </h2>
            <form onSubmit={handleAddSkill} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., Python, UI Design"
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency</label>
                <select
                  value={proficiency}
                  onChange={(e) => setProficiency(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </button>
            </form>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Skills</h2>
            {loading ? (
              <p className="text-gray-500">Loading skills...</p>
            ) : skills.length === 0 ? (
              <p className="text-gray-500">No skills added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {s.skill_name} <span className="ml-2 text-xs opacity-75">({s.proficiency})</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              Add Project
            </h2>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Title</label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  required
                  rows={2}
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Link (Optional)</label>
                <input
                  type="url"
                  value={projectLink}
                  onChange={(e) => setProjectLink(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="https://github.com/..."
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Project
              </button>
            </form>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Projects</h2>
            {loading ? (
              <p className="text-gray-500">Loading projects...</p>
            ) : projects.length === 0 ? (
              <p className="text-gray-500">No projects added yet.</p>
            ) : (
              <div className="space-y-4">
                {projects.map((p) => (
                  <div key={p.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-md font-semibold text-gray-900">{p.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{p.description}</p>
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-500">
                        View Project &rarr;
                      </a>
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
