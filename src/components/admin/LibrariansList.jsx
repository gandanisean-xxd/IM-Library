import React, { useState } from 'react';
import { Search, UserPlus, Edit, Trash2, X } from 'lucide-react';
import { users } from '../../mockData';

const LibrariansList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [librarians, setLibrarians] = useState(users.filter(user => user.role === 'librarian'));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLibrarian, setSelectedLibrarian] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // Handle edit librarian
  const handleEdit = (librarian) => {
    setSelectedLibrarian(librarian);
    setShowEditModal(true);
  };

  // Handle delete librarian
  const handleDelete = (librarianId) => {
    if (window.confirm('Are you sure you want to delete this librarian?')) {
      setLibrarians(librarians.filter(lib => lib.id !== librarianId));
    }
  };
  // Handle save edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    setLibrarians(librarians.map(lib => 
      lib.id === selectedLibrarian.id ? selectedLibrarian : lib
    ));
    setShowEditModal(false);
  };
  // Filter librarians based on search
  const filteredLibrarians = librarians.filter(librarian =>
    librarian.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    librarian.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    librarian.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    librarian.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Library Staff</h1>
          <p className="text-gray-600">Manage library staff accounts and permissions</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add New Staff
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-md mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Librarian ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">            {filteredLibrarians.map((librarian) => (
              <tr key={librarian.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{librarian.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {librarian.firstName} {librarian.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{librarian.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(librarian)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(librarian.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Librarian</h3>
              <form onSubmit={handleSaveEdit} className="mt-4 text-left">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Librarian ID</label>
                  <input
                    type="text"
                    value={selectedLibrarian.LIBRARIAN_ID}
                    disabled
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                  <input
                    type="text"
                    value={selectedLibrarian.LIBRARIAN_FIRSTNAME}
                    onChange={(e) => setSelectedLibrarian({...selectedLibrarian, LIBRARIAN_FIRSTNAME: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                  <input
                    type="text"
                    value={selectedLibrarian.LIBRARIAN_LASTNAME}
                    onChange={(e) => setSelectedLibrarian({...selectedLibrarian, LIBRARIAN_LASTNAME: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    value={selectedLibrarian.EMAIL}
                    onChange={(e) => setSelectedLibrarian({...selectedLibrarian, EMAIL: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibrariansList;