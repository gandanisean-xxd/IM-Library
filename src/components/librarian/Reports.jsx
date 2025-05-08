import React from 'react';
import { FileText, Download, Calendar, Users, BookOpen } from 'lucide-react';

const LibrarianReports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-600">Generate and download library reports</p>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReportCard
          title="Borrowing Statistics"
          description="Monthly overview of book borrowings and returns"
          icon={<BookOpen className="h-6 w-6" />}
          period="Last 30 days"
          updateTime="Updated 2 hours ago"
        />
        
        <ReportCard
          title="User Activity"
          description="User engagement and activity patterns"
          icon={<Users className="h-6 w-6" />}
          period="Last 30 days"
          updateTime="Updated 1 hour ago"
        />
        
        <ReportCard
          title="Overdue Analysis"
          description="Analysis of overdue books and patterns"
          icon={<Calendar className="h-6 w-6" />}
          period="Last 30 days"
          updateTime="Updated 3 hours ago"
        />
        
        <ReportCard
          title="Custom Report"
          description="Generate custom reports with specific parameters"
          icon={<FileText className="h-6 w-6" />}
          period="Custom date range"
          updateTime="Real-time generation"
        />
      </div>
    </div>
  );
};

const ReportCard = ({ title, description, icon, period, updateTime }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-50 rounded-lg p-3">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-400">{period}</p>
              <p className="text-sm text-gray-400">{updateTime}</p>
            </div>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};

export default LibrarianReports;