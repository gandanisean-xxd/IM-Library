import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Bell, Eye, EyeOff } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

const Settings = () => {
  const { currentUser, updateUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
    const [profileData, setProfileData] = useState({
    firstName: currentUser?.role === 'admin' ? 'Administrator' : 
              currentUser?.STUDENT_FIRSTNAME || currentUser?.FACULTY_FIRSTNAME || 
              currentUser?.LIBRARIAN_FIRSTNAME || '',
    lastName: currentUser?.role === 'admin' ? '' : 
             currentUser?.STUDENT_LASTNAME || currentUser?.FACULTY_LASTNAME || 
             currentUser?.LIBRARIAN_LASTNAME || '',
    email: currentUser?.EMAIL || currentUser?.ADMIN_EMAIL || '',
    studentId: currentUser?.STUDENT_ID || '',
    facultyId: currentUser?.FACULTY_ID || '',
    adminId: currentUser?.ADMIN_ID || '',
    librarianId: currentUser?.LIBRARIAN_ID || '',
    program: currentUser?.STUDENT_PROGRAM || '',
    campus: currentUser?.STUDENT_CAMPUS || '',
    expectedGraduateYear: currentUser?.EXPECTED_GRADUATEYEAR || '',
    status: currentUser?.STATUS || 'active'
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    dueDateReminders: true,
    newArrivals: false,
    events: true,
  });

  // Debug modal state changes
  useEffect(() => {
    console.log('Modal state changed:', { showConfirmation, message: confirmationMessage });
  }, [showConfirmation, confirmationMessage]);

  const handleCloseModal = () => {
    console.log('Closing modal');
    setShowConfirmation(false);
    setConfirmationMessage('');
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const showSuccessMessage = (message) => {
    console.log('Showing success message:', message);
    setConfirmationMessage(message);
    setTimeout(() => {
      setShowConfirmation(true);
      console.log('Modal should now be visible');
    }, 0);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting profile form...');
    setError('');
    setIsLoading(true);

    try {
      const endpoint = currentUser?.role === 'admin'
        ? 'http://localhost:5000/api/admin/update'
        : currentUser?.role === 'student'
          ? 'http://localhost:5000/api/student/update'
          : currentUser?.role === 'faculty'
            ? 'http://localhost:5000/api/faculty/update'
            : 'http://localhost:5000/api/librarian/update';

      const updateData = currentUser?.role === 'admin'
        ? {
            admin_id: profileData.adminId,
            admin_email: profileData.email,
            status: profileData.status
          }
        : currentUser?.role === 'student'
          ? {
              student_id: profileData.studentId,
              student_firstname: profileData.firstName,
              student_lastname: profileData.lastName,
              email: profileData.email,
              student_campus: profileData.campus,
              status: profileData.status
            }
          : currentUser?.role === 'faculty'
            ? {
                faculty_id: profileData.facultyId,
                faculty_firstname: profileData.firstName,
                faculty_lastname: profileData.lastName,
                email: profileData.email
              }
            : {
                librarian_id: profileData.librarianId,
                librarian_firstname: profileData.firstName,
                librarian_lastname: profileData.lastName,
                email: profileData.email
              };

      console.log('Sending request to:', endpoint);
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Response received:', data);

      if (response.ok) {
        if (data.user) {
          updateUser({
            ...data.user,
            role: currentUser.role
          });
        }
        showSuccessMessage('Your profile has been updated successfully!');
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.message || 'An error occurred while updating the profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      const endpoint = 'http://localhost:5000/api/auth/change-password';
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser?.STUDENT_ID || currentUser?.FACULTY_ID || currentUser?.ADMIN_ID,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          role: currentUser?.role
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        showSuccessMessage('Your password has been updated successfully!');
      } else {
        setError(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Password update error:', error);
      setError(error.message || 'An error occurred while updating the password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCloseModal}
        message={confirmationMessage}
      />

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Profile Settings
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Notifications
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit}>
                <div className="space-y-6">
                  <div className="flex flex-col items-center mb-6">
                    <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4">
                      {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        readOnly={currentUser?.role === 'admin'}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        readOnly={currentUser?.role === 'admin'}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        readOnly={currentUser?.role === 'admin'}
                      />
                    </div>
                  </div>
                  
                  {currentUser?.role === 'admin' && (
                    <div>
                      <label htmlFor="adminId" className="block text-sm font-medium text-gray-700 mb-1">
                        Admin ID
                      </label>
                      <input
                        type="text"
                        id="adminId"
                        name="adminId"
                        value={profileData.adminId}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                        readOnly
                      />
                    </div>
                  )}
                  
                  {currentUser?.role === 'librarian' && (
                    <div>
                      <label htmlFor="librarianId" className="block text-sm font-medium text-gray-700 mb-1">
                        Librarian ID
                      </label>
                      <input
                        type="text"
                        id="librarianId"
                        name="librarianId"
                        value={profileData.librarianId}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                        readOnly
                      />
                    </div>
                  )}
                  
                  {currentUser?.role === 'student' && (
                    <>
                      <div>
                        <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                          Student ID
                        </label>
                        <input
                          type="text"
                          id="studentId"
                          name="studentId"
                          value={profileData.studentId}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                          readOnly
                        />
                      </div>

                      <div>
                        <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">
                          Program
                        </label>
                        <input
                          type="text"
                          id="program"
                          name="program"
                          value={profileData.program}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                          readOnly
                        />
                      </div>

                      <div>
                        <label htmlFor="campus" className="block text-sm font-medium text-gray-700 mb-1">
                          Campus
                        </label>
                        <select
                          id="campus"
                          name="campus"
                          value={profileData.campus}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="San Bartolome Campus">San Bartolome Campus</option>
                          <option value="Batasan Campus">Batasan Campus</option>
                          <option value="San Francisco Campus">San Francisco Campus</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="expectedGraduateYear" className="block text-sm font-medium text-gray-700 mb-1">
                          Expected Year of Graduate
                        </label>
                        <input
                          type="text"
                          id="expectedGraduateYear"
                          name="expectedGraduateYear"
                          value={profileData.expectedGraduateYear}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                          readOnly
                        />
                      </div>
                    </>
                  )}
                  
                  {currentUser?.role === 'faculty' && (
                    <div>
                      <label htmlFor="facultyId" className="block text-sm font-medium text-gray-700 mb-1">
                        Faculty ID
                      </label>
                      <input
                        type="text"
                        id="facultyId"
                        name="facultyId"
                        value={profileData.facultyId}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                        readOnly
                      />
                    </div>
                  )}
                  
                  {currentUser?.role !== 'admin' && (
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none ${
                          isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
              </form>
            )}
            
            {/* Security Settings */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.currentPassword ? "text" : "password"}
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('currentPassword')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {showPasswords.currentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.newPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('newPassword')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {showPasswords.newPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {showPasswords.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </form>
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="emailNotifications"
                          name="emailNotifications"
                          type="checkbox"
                          checked={notificationSettings.emailNotifications}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                          Email Notifications
                        </label>
                        <p className="text-gray-500">
                          Receive email notifications about your account activity.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="dueDateReminders"
                          name="dueDateReminders"
                          type="checkbox"
                          checked={notificationSettings.dueDateReminders}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="dueDateReminders" className="font-medium text-gray-700">
                          Due Date Reminders
                        </label>
                        <p className="text-gray-500">
                          Get notified before your borrowed books are due.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="newArrivals"
                          name="newArrivals"
                          type="checkbox"
                          checked={notificationSettings.newArrivals}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="newArrivals" className="font-medium text-gray-700">
                          New Arrivals
                        </label>
                        <p className="text-gray-500">
                          Get notified about new books added to the library.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="events"
                          name="events"
                          type="checkbox"
                          checked={notificationSettings.events}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="events" className="font-medium text-gray-700">
                          Library Events
                        </label>
                        <p className="text-gray-500">
                          Receive notifications about upcoming library events and workshops.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;