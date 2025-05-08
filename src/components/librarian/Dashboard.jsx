import React from 'react';
import { BookOpen, Users, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

const LibrarianDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Welcome back, Librarian!</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Borrowings"
          value="45"
          change="+12.5%"
          trend="up"
          description="vs. last month"
          icon={<BookOpen className="h-6 w-6" />}
          color="blue"
        />
        <StatsCard
          title="Active Users"
          value="28"
          change="+8.2%"
          trend="up"
          description="vs. last month"
          icon={<Users className="h-6 w-6" />}
          color="amber"
        />
        <StatsCard
          title="Overdue Books"
          value="12"
          change="-25%"
          trend="down"
          description="vs. last month"
          icon={<AlertCircle className="h-6 w-6" />}
          color="red"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <ActivityItem
            action="Book Borrowed"
            title="The Great Gatsby"
            user="John Smith"
            time="2 hours ago"
          />
          <ActivityItem
            action="Book Returned"
            title="To Kill a Mockingbird"
            user="Sarah Johnson"
            time="4 hours ago"
          />
          <ActivityItem
            action="Overdue Notice"
            title="1984"
            user="Mike Wilson"
            time="5 hours ago"
          />
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, change, trend, description, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className={`rounded-full w-12 h-12 ${colors[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <div className="flex items-baseline space-x-2">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <span className={`inline-flex items-center text-sm ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          {change}
        </span>
      </div>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
};

const ActivityItem = ({ action, title, user, time }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center space-x-4">
        <div className="bg-blue-50 rounded-full p-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{action}</p>
          <p className="text-sm text-gray-500">{title} by {user}</p>
        </div>
      </div>
      <span className="text-sm text-gray-400">{time}</span>
    </div>
  );
};

export default LibrarianDashboard;