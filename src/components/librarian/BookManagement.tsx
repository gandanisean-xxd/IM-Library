import React from 'react';
import { Tab } from '@headlessui/react';
import BorrowVerificationForm from './BorrowVerificationForm';
import PendingPickupsList from './PendingPickupsList';
import OverdueBooksList from './OverdueBooksList';
import FineManagement from './FineManagement';
import { BookOpen } from 'lucide-react';

interface ActivityItemProps {
  action: string;
  title: string;
  user: string;
  time: string;
}

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

const recentActivity: ActivityItemProps[] = [
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
];

const BookManagement: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Book Management</h1>
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-4">
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${selected ? 'bg-white shadow text-blue-700' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
          }>Borrow Verification</Tab>
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${selected ? 'bg-white shadow text-blue-700' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
          }>Pending Pickups</Tab>
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${selected ? 'bg-white shadow text-blue-700' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
          }>Overdue Books</Tab>
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${selected ? 'bg-white shadow text-blue-700' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
          }>Fine Management</Tab>
        </Tab.List>
          <Tab className={({ selected }) =>
            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${selected ? 'bg-white shadow text-blue-700' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`
          }>Activity</Tab>
        <Tab.Panels>
          <Tab.Panel><BorrowVerificationForm /></Tab.Panel>
          <Tab.Panel><PendingPickupsList /></Tab.Panel>
          <Tab.Panel><OverdueBooksList /></Tab.Panel>
          <Tab.Panel><FineManagement /></Tab.Panel>
          <Tab.Panel>
            {/* Activity List */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity: ActivityItemProps, index: number) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default BookManagement;
