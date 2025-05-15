import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import BookModal from './BookModal';
import BorrowFormModal from './BorrowFormModal';
// import { books } from '../../mockData';


import { useAuth } from '../../context/AuthContext';

const UserBooks = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [borrowBook, setBorrowBook] = useState(null);
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [books, setBooks] = useState([]);
  const [bookCovers, setBookCovers] = useState({}); // { [bookId]: imageUrl }
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 8; // You can adjust this number as needed
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch book image from Pexels API
  const fetchBookImage = async (query, bookId) => {
    const apiKey = 'DXXGJulEn2uAObvSgoGJynFTZKVEQjxS5HD2DQtVpKQxqOhxP80exzgm';
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
        {
          headers: {
            Authorization: apiKey,
          },
        }
      );
      const data = await response.json();
      const imageUrl = data.photos?.[0]?.src?.medium || null;
      setBookCovers(prev => ({ ...prev, [bookId]: imageUrl }));
    } catch (e) {
      // Ignore error, don't set image
    }
  };

  // Helper to fetch books from backend
  const refreshBooks = () => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:5000/api/books')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Map backend fields to frontend fields
          const mappedBooks = data.books.map(b => ({
            id: b.BOOK_ID,
            name: b.BOOK_NAME,
            author: b.BOOK_AUTHOR,
            category: b.BOOK_CATEGORY,
            quantity: b.BOOK_QUANTITY,
            campusAvailability: b.CAMPUS_AVAILABILITY,
            available: b.BOOK_QUANTITY, // For UI logic
            cover: null // Placeholder, backend does not provide cover
          }));
          setBooks(mappedBooks);
          setFilteredBooks(mappedBooks);
          setCategories([...new Set(mappedBooks.map(book => book.category).filter(Boolean))]);

          // Fetch covers from Pexels for each book (if not already present)
          mappedBooks.forEach(book => {
            if (!bookCovers[book.id]) {
              fetchBookImage(book.name + ' book cover', book.id);
            }
          });
        } else {
          setError(data.message || 'Failed to fetch books');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch books');
        setLoading(false);
      });
  };

  // Fetch books on mount
  useEffect(() => {
    refreshBooks();
    // eslint-disable-next-line
  }, []);

  // (duplicate state declarations removed)
  
  // Update filtered books when search term or category changes
  useEffect(() => {
    const filtered = books.filter(book => {
      const matchesSearch = 
        book.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? book.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
    setFilteredBooks(filtered);
  }, [searchTerm, selectedCategory, books]);

  // Calculate paginated books
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  // When filteredBooks changes, reset to page 1 if current page is out of range
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredBooks, totalPages]);

  return (
    <div className="space-y-6">
      {/* Search and filter section */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title, author, or ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
        </div>
      </div>
      
      {/* Books grid */}
      <div>
        {loading ? (
          <div className="bg-white rounded-xl p-12 shadow-md text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Loading books...</h3>
            <p className="text-gray-500">Please wait while we fetch the latest books from the library.</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl p-12 shadow-md text-center">
            <BookOpen className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-1">Error</h3>
            <p className="text-gray-500">{error}</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => window.location.reload()}
            >Retry</button>
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedBooks.map((book, idx) => (
              <div
                key={book.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between"
                onClick={() => {
                  if (!currentUser) {
                    alert('You must be logged in to borrow books.');
                    return;
                  }
                  setBorrowBook(book);
                  setBorrowModalOpen(true);
                }}
                style={{ minHeight: 280 }}
              >
                {/* Book Cover */}
                <div className="h-48 overflow-hidden flex items-center justify-center bg-gray-100">
                  {bookCovers[book.id] ? (
                    <img
                      src={bookCovers[book.id]}
                      alt={book.name}
                      className="w-full h-full object-cover"
                      style={{ maxHeight: '100%' }}
                    />
                  ) : (
                    <BookOpen className="h-16 w-16 text-blue-600" />
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">ID: {book.id}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{book.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                      {book.category}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        book.available > 0
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={book.available <= 2}
                      onClick={e => {
                        e.stopPropagation();
                        if (book.available <= 2) return;
                        setBorrowBook(book);
                        setBorrowModalOpen(true);
                      }}
                    >
                      {book.available > 2 ? 'Borrow' : 'Unavailable (Low Stock)'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <BookModal book={selectedBook} open={modalOpen} onClose={() => setModalOpen(false)} />
            <BorrowFormModal 
              open={borrowModalOpen} 
              book={borrowBook} 
              user={currentUser}
              onClose={() => setBorrowModalOpen(false)}
              onSuccess={() => {
                setBorrowModalOpen(false);
                refreshBooks();
              }}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 shadow-md text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No books found</h3>
            <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {filteredBooks.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* Previous button */}
            <button
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pageNum => (
              <button
                key={pageNum}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === pageNum ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setCurrentPage(pageNum)}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </button>
            ))}
            {/* Next button */}
            <button
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default UserBooks;