import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import io from "socket.io-client";
import {
  LogOut,
  BookOpen,
  BarChart,
  Settings,
  MessageSquare,
  Users,
  Briefcase,
  TrendingUp,
  Award,
  Bell
} from "lucide-react";

type Notification = {
  id: number;
  message: string;
  is_read: boolean;
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Connect to Socket.io
      const socket = io();
      socket.emit("join", user.id);

      socket.on("notification", (newNotif) => {
        // Fetch fresh notifications to get the ID and correct state
        fetchNotifications();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications/${user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              <span className="font-bold text-xl tracking-tight">
                CampusLink
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user.role === "student" && (
              <>
                <Link
                  to="/student-dashboard"
                  className="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  <BarChart className="h-4 w-4" /> Dashboard
                </Link>
                <Link
                  to="/lessons"
                  className="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  <BookOpen className="h-4 w-4" /> VideoLearner
                </Link>
                <Link
                  to="/test-arena"
                  className="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  <Award className="h-4 w-4" /> TestArena
                </Link>
                <Link
                  to="/buddy-up"
                  className="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  <Users className="h-4 w-4" /> BuddyUp
                </Link>
                <Link
                  to="/skill-sync"
                  className="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  <Briefcase className="h-4 w-4" /> SkillSync
                </Link>
                <Link
                  to="/learn-tracker"
                  className="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  <TrendingUp className="h-4 w-4" /> LearnTracker
                </Link>
                <Link
                  to="/hiring-board"
                  className="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  <Briefcase className="h-4 w-4" /> Hiring Board
                </Link>
              </>
            )}
            {user.role === "teacher" && (
              <>
                <Link
                  to="/teacher-dashboard"
                  className="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  <BarChart className="h-4 w-4" /> Dashboard
                </Link>
                <Link
                  to="/hiring-board"
                  className="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  <Briefcase className="h-4 w-4" /> Hiring Approvals
                </Link>
                <Link
                  to="/settings"
                  className="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  <Settings className="h-4 w-4" /> Settings
                </Link>
              </>
            )}
            <div className="ml-4 flex items-center md:ml-6 relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1 rounded-full hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white mr-4 relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="origin-top-right absolute right-0 top-10 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-gray-500">No notifications</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`px-4 py-3 text-sm border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${notif.is_read ? 'bg-white text-gray-500' : 'bg-indigo-50 text-gray-900 font-medium'}`}
                          onClick={() => markAsRead(notif.id)}
                        >
                          {notif.message}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <span className="text-sm mr-4">Hi, {user.full_name}</span>
              <button
                onClick={handleLogout}
                className="p-1 rounded-full hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
