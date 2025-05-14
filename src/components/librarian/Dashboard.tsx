import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { BookOpen, Users, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import BorrowVerificationForm from './BorrowVerificationForm';
import NotificationCenter from './NotificationCenter';
import PendingPickupsList from './PendingPickupsList';
import OverdueBooksList from './OverdueBooksList';
import FineManagement from './FineManagement';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'amber' | 'red' | 'green';
}

interface ActivityItemProps {
  action: string;
  title: string;
  user: string;
  time: string;
}

interface TabProps {
  selected: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, trend, description, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
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

const ActivityItem: React.FC<ActivityItemProps> = ({ action, title, user, time }) => {
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

const Dashboard: React.FC = () => {
  const [statistics, setStatistics] = useState({
    totalBorrowings: '45',
    activeUsers: '28',
    overdueBooks: '12',
    pendingPickups: '8',
  });

  const [recentActivity] = useState<ActivityItemProps[]>([
    {
      action: "Book Borrowed",
      title: "The Great Gatsby",
      user: "John Smith",
      time: "2 hours ago"
    },
    {
      action: "Book Returned",
      title: "To Kill a Mockingbird",
      user: "Sarah Johnson",
      time: "4 hours ago"
    },
    {
      action: "Overdue Notice",
      title: "1984",
      user: "Mike Wilson",
      time: "5 hours ago"
    }
  ]);

  useEffect(() => {
    // Fetch dashboard statistics
    const fetchStatistics = async () => {
      try {
        // TODO: Implement API call to fetch statistics
        const response = await fetch('/api/statistics');
        const data = await response.json();
        setStatistics(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
    const interval = setInterval(fetchStatistics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Librarian Dashboard</h1>
          <p className="text-gray-600">Welcome back, Librarian!</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Borrowings"
          value={statistics.totalBorrowings}
          change="+12.5%"
          trend="up"
          description="vs. last month"
          icon={<BookOpen className="h-6 w-6" />}
          color="blue"
        />
        <StatsCard
          title="Active Users"
          value={statistics.activeUsers}
          change="+8.2%"
          trend="up"
          description="vs. last month"
          icon={<Users className="h-6 w-6" />}
          color="amber"
        />
        <StatsCard
          title="Overdue Books"
          value={statistics.overdueBooks}
          change="-25%"
          trend="down"
          description="vs. last month"
          icon={<AlertCircle className="h-6 w-6" />}
          color="red"
        />
        <StatsCard
          title="Pending Pickups"
          value={statistics.pendingPickups}
          change="+5%"
          trend="up"
          description="vs. last month"
          icon={<BookOpen className="h-6 w-6" />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Tabs */}
        <div className="lg:col-span-3">
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
              <Tab
                className={({ selected }: TabProps) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white shadow text-blue-700'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                Verify Borrows
              </Tab>
              <Tab
                className={({ selected }: TabProps) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white shadow text-blue-700'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                Pending Pickups
              </Tab>
              <Tab
                className={({ selected }: TabProps) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white shadow text-blue-700'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                Overdue Books
              </Tab>
              <Tab
                className={({ selected }: TabProps) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white shadow text-blue-700'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                Fines
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-4">
              <Tab.Panel>
                <BorrowVerificationForm />
              </Tab.Panel>
              <Tab.Panel>
                <PendingPickupsList />
              </Tab.Panel>
              <Tab.Panel>
                <OverdueBooksList />
              </Tab.Panel>
              <Tab.Panel>
                <FineManagement />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <NotificationCenter />
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 