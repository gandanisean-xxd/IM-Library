import React, { useState } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  UsersIcon,
  BookIcon,
  FileTextIcon 
} from 'lucide-react';
import { formattedDate } from '../../utils/dateUtils';
import { programOptions, timeSlotOptions } from '../../utils/formOptions';
import { useAuth } from '../../context/AuthContext'; // Assuming you have this context

const ReservationForm = () => {

  const { token } = useAuth();

  const [formData, setFormData] = useState({
    program: '',
    date: formattedDate(new Date()),
    timeSlot: '',
    memberCount: 5,
    memberNames: Array(5).fill(''),
    purpose: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const memberCountOptions = Array.from({ length: 6 }, (_, i) => i + 5);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.program) {
      newErrors.program = 'Please select your program';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    
    if (!formData.timeSlot) {
      newErrors.timeSlot = 'Please select a time slot';
    }
    
    // Validate member names
    const emptyNames = formData.memberNames.slice(0, formData.memberCount).filter(name => !name.trim());
    if (emptyNames.length > 0) {
      newErrors.memberNames = `Please enter all ${formData.memberCount} member names`;
    }
    
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Please describe the purpose of your reservation';
    } else if (formData.purpose.trim().length < 10) {
      newErrors.purpose = 'Purpose description is too short (minimum 10 characters)';
    }

    const combinedNames = formData.memberNames.slice(0, formData.memberCount).join(', ');
    if (combinedNames.length > 500) {
      newErrors.memberNames = 'Combined member names are too long (maximum 500 characters)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user changes the value
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleMemberNameChange = (index: number, value: string) => {
    const newMemberNames = [...formData.memberNames];
    newMemberNames[index] = value;
    
    setFormData(prev => ({
      ...prev,
      memberNames: newMemberNames
    }));
    
    // Clear member names error when any name is updated
    if (errors.memberNames) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.memberNames;
        return newErrors;
      });
    }
  };
  
  const handleMemberCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    
    // Ensure we always have enough entries in the array
    const newMemberNames = [...formData.memberNames];
    while (newMemberNames.length < count) {
      newMemberNames.push('');
    }
    
    setFormData(prev => ({
      ...prev,
      memberCount: count,
      memberNames: newMemberNames
    }));
  };
  
 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
    return;
  }
  
  const confirmed = window.confirm(
    'Are you sure you want to submit this reservation?'
  );
  
  if (!confirmed) {
    return;
  }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          program: formData.program,
          date: formData.date,
          timeSlot: formData.timeSlot,
          memberCount: formData.memberCount,
          memberNames: formData.memberNames.slice(0, formData.memberCount),
          purpose: formData.purpose
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        
        // Reset form after success
        setTimeout(() => {
          setIsSuccess(false);
          setFormData({
            program: '',
            date: formattedDate(new Date()),
            timeSlot: '',
            memberCount: 5,
            memberNames: Array(5).fill(''),
            purpose: '',
          });
        }, 3000);
      } else {
        // Handle error response from server
        setErrors(prev => ({
          ...prev,
          submit: data.message || 'Failed to submit reservation'
        }));
      }
    } catch (error) {
      console.error('Error submitting reservation:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? 
          error.message : 
          'Failed to connect to server. Please try again later.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 text-green-700 animate-fadeIn">
          <p className="font-medium">Reservation successful!</p>
          <p className="text-sm">Your room has been reserved successfully.</p>
        </div>
      )}
    
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Program Selection */}
        <div className="space-y-2">
          <label htmlFor="program" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <BookIcon className="h-4 w-4 text-blue-500" />
            Course/Program
          </label>
          <select
            id="program"
            name="program"
            value={formData.program}
            onChange={handleInputChange}
            className={`block w-full px-3 py-2 border ${errors.program ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors`}
          >
            <option value="">Select your program</option>
            {programOptions.map(program => (
              <option key={program} value={program}>{program}</option>
            ))}
          </select>
          {errors.program && <p className="text-red-500 text-xs mt-1">{errors.program}</p>}
        </div>
        
        {/* Date Selection */}
        <div className="space-y-2">
          <label htmlFor="date" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <CalendarIcon className="h-4 w-4 text-blue-500" />
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            min={formattedDate(new Date())}
            className={`block w-full px-3 py-2 border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors`}
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>
        
        {/* Time Slot Selection */}
        <div className="space-y-2">
          <label htmlFor="timeSlot" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <ClockIcon className="h-4 w-4 text-blue-500" />
            Time Slot (1 hour)
          </label>
          <select
            id="timeSlot"
            name="timeSlot"
            value={formData.timeSlot}
            onChange={handleInputChange}
            className={`block w-full px-3 py-2 border ${errors.timeSlot ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors`}
          >
            <option value="">Select a time slot</option>
            {timeSlotOptions.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
          {errors.timeSlot && <p className="text-red-500 text-xs mt-1">{errors.timeSlot}</p>}
        </div>
        
        {/* Member Count */}
        <div className="space-y-2">
          <label htmlFor="memberCount" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <UsersIcon className="h-4 w-4 text-blue-500" />
            Number of Members (5-10)
          </label>
          <select
            id="memberCount"
            name="memberCount"
            value={formData.memberCount}
            onChange={handleMemberCountChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {memberCountOptions.map(count => (
              <option key={count} value={count}>{count} members</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Member Names */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <UsersIcon className="h-4 w-4 text-blue-500" />
          Member Names
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: formData.memberCount }).map((_, index) => (
            <div key={index} className="space-y-1">
              <label htmlFor={`member-${index}`} className="text-xs text-gray-500">
                Member {index + 1}
              </label>
              <input
                type="text"
                id={`member-${index}`}
                value={formData.memberNames[index] || ''}
                onChange={(e) => handleMemberNameChange(index, e.target.value)}
                placeholder={`Enter member ${index + 1} name`}
                className={`block w-full px-3 py-2 border ${errors.memberNames ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors`}
              />
            </div>
          ))}
        </div>
        {errors.memberNames && <p className="text-red-500 text-xs">{errors.memberNames}</p>}
      </div>
      
      {/* Purpose */}
      <div className="space-y-2">
        <label htmlFor="purpose" className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileTextIcon className="h-4 w-4 text-blue-500" />
          Purpose of Reservation
        </label>
        <textarea
          id="purpose"
          name="purpose"
          value={formData.purpose}
          onChange={handleInputChange}
          rows={4}
          placeholder="Please describe why you need to use the collaboration room"
          className={`block w-full px-3 py-2 border ${errors.purpose ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors`}
        />
        {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}
      </div>
      
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : "Submit Reservation"}
        </button>
      </div>
    </form>
  );
};

export default ReservationForm;