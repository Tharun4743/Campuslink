import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { Save, User, BookOpen, Briefcase, Phone, Award } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/users/${user?.id}`);
      if (res.ok) {
        setProfile(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update profile");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow rounded-lg p-8">
        <div className="flex items-center mb-8 border-b pb-4">
          <User className="h-8 w-8 text-indigo-600 mr-3" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Profile & Settings</h2>
            <p className="text-gray-500 text-sm">Update your account information</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <User size={16} className="text-gray-400" /> Full Name
              </label>
              <input
                type="text"
                value={profile.full_name || ''}
                onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <BookOpen size={16} className="text-gray-400" /> Department
              </label>
              <input
                type="text"
                value={profile.department || ''}
                onChange={e => setProfile({ ...profile, department: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {user?.role === 'student' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Award size={16} className="text-gray-400" /> Year Level
                  </label>
                  <select
                    value={profile.year_level || ''}
                    onChange={e => setProfile({ ...profile, year_level: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" /> Parent Phone (Twilio)
                  </label>
                  <input
                    type="tel"
                    value={profile.parent_phone || ''}
                    onChange={e => setProfile({ ...profile, parent_phone: e.target.value })}
                    placeholder="+1234567890"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

              </>
            )}

            {user?.role === 'teacher' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <BookOpen size={16} className="text-gray-400" /> Subjects Teaching
                  </label>
                  <input
                    type="text"
                    value={profile.subjects_teaching || ''}
                    onChange={e => setProfile({ ...profile, subjects_teaching: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Briefcase size={16} className="text-gray-400" /> Years of Experience
                  </label>
                  <input
                    type="number"
                    value={profile.years_of_experience || ''}
                    onChange={e => setProfile({ ...profile, years_of_experience: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-gray-100">
            {saved && (
              <span className="text-green-600 text-sm font-medium mr-4 flex items-center gap-1">
                Profile updated successfully!
              </span>
            )}
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
