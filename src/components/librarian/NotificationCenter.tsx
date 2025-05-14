import React, { useState } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'due_date' | 'overdue' | 'pickup' | 'fine' | 'general';
  targetAudience: 'all' | 'specific';
  studentIds?: string[];
  createdAt: string;
  status: 'draft' | 'sent';
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotification, setNewNotification] = useState<Partial<Notification>>({
    title: '',
    message: '',
    type: 'general',
    targetAudience: 'all',
    studentIds: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create a new notification object with required fields
      const newNotificationData: Notification = {
        id: Date.now().toString(), // Temporary ID until backend integration
        ...newNotification as Omit<Notification, 'id' | 'createdAt' | 'status'>,
        createdAt: new Date().toISOString(),
        status: 'sent'
      };

      // TODO: Implement API call to send notification
      // const response = await fetch('/api/librarian/notifications', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(newNotification),
      // });
      // const data = await response.json();
      
      // Add the new notification to the list
      setNotifications(prevNotifications => [...prevNotifications, newNotificationData]);

      // Reset the form
      setNewNotification({
        title: '',
        message: '',
        type: 'general',
        targetAudience: 'all',
        studentIds: [],
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Notification */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Create Notification</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={newNotification.title}
              onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              value={newNotification.message}
              onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              id="type"
              value={newNotification.type}
              onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as Notification['type'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="general">General</option>
              <option value="due_date">Due Date Reminder</option>
              <option value="overdue">Overdue Notice</option>
              <option value="pickup">Pickup Reminder</option>
              <option value="fine">Fine Notice</option>
            </select>
          </div>

          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
              Target Audience
            </label>
            <select
              id="targetAudience"
              value={newNotification.targetAudience}
              onChange={(e) => setNewNotification({ ...newNotification, targetAudience: e.target.value as 'all' | 'specific' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Students</option>
              <option value="specific">Specific Students</option>
            </select>
          </div>

          {newNotification.targetAudience === 'specific' && (
            <div>
              <label htmlFor="studentIds" className="block text-sm font-medium text-gray-700">
                Student IDs (comma-separated)
              </label>
              <input
                type="text"
                id="studentIds"
                value={newNotification.studentIds?.join(', ')}
                onChange={(e) => setNewNotification({
                  ...newNotification,
                  studentIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. STU001, STU002, STU003"
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Send Notification
            </button>
          </div>
        </form>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="border rounded-md p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  notification.type === 'general' ? 'bg-gray-100 text-gray-800' :
                  notification.type === 'due_date' ? 'bg-yellow-100 text-yellow-800' :
                  notification.type === 'overdue' ? 'bg-red-100 text-red-800' :
                  notification.type === 'pickup' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {notification.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Sent: {new Date(notification.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="text-gray-500 text-center py-4">No notifications sent yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter; 