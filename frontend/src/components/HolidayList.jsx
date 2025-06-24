import React, { useEffect, useState } from 'react';
import HolidayEditForm from './HolidayEditForm';
import './HolidayList.css'; 
import './LoadingSpinner.css';

const HolidayList = () => {
  const [holidays, setHolidays] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New state for active filter
  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch holidays from Laravel API
  const fetchHolidays = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:8000/api/holidays', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setHolidays(data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      setError('Failed to fetch holidays. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this holiday?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/holidays/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete holiday');
      }

      // Refresh the holidays list
      await fetchHolidays();
    } catch (error) {
      console.error('Error deleting holiday:', error);
      setError(error.message || 'Failed to delete holiday');

      // Clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    }
  };

  const resetNameSearch = () => {
    setSearchName('');
  };

  const resetDateSearch = () => {
    setSearchDate('');
  };

  // Enhanced filtering function that includes the active filter
  const filteredHolidays = holidays.filter(h => {
    // Apply search filters
    const matchesName = searchName ? h.name.toLowerCase().includes(searchName.toLowerCase()) : true;
    const matchesDate = searchDate ? h.date.includes(searchDate) : true;

    // Apply active filter
    let matchesFilter = true;
    switch (activeFilter) {
      case 'official':
        matchesFilter = h.type === 'official';
        break;
      case 'weekly':
        matchesFilter = h.type === 'weekly';
        break;
      case 'upcoming':
        matchesFilter = new Date(h.date) > new Date();
        break;
      case 'all':
      default:
        matchesFilter = true;
        break;
    }

    return matchesName && matchesDate && matchesFilter;
  });

  // Function to handle filter card clicks
  const handleFilterClick = (filterType) => {
    if (activeFilter === filterType) {
      // If clicking the same filter, reset to 'all'
      setActiveFilter('all');
    } else {
      setActiveFilter(filterType);
    }
  };

  // Calculate stats
  const totalHolidays = holidays.length;
  const officialHolidays = holidays.filter(h => h.type === 'official').length;
  const weeklyHolidays = holidays.filter(h => h.type === 'weekly').length;
  const upcomingHolidays = holidays.filter(h => new Date(h.date) > new Date()).length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleModalClose = () => {
    setEditingHoliday(null);
    setShowCreateModal(false);
  };

  const handleModalUpdated = async () => {
    await fetchHolidays();
    handleModalClose();
  };

  if (loading) {
    return (
      <div className="holiday-dashboard">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading holidays...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="holiday-dashboard">
        <div className="container">
          {/* Header */}
          <div className="holiday-header">
            <div className="header-content">
              <h1>
                🎉 Holiday Manager
              </h1>
              <button
                className="add-holiday-btn"
                onClick={() => setShowCreateModal(true)}
              >
                <span>+</span>
                Add New Holiday
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Statistics Cards - Now Clickable */}
          <div className="holiday-stats">
            <div
              className={`stat-card ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterClick('all')}
            >
              <div className="stat-number">{totalHolidays}</div>
              <div className="stat-label">Total Holidays</div>
            </div>
            <div
              className={`stat-card ${activeFilter === 'official' ? 'active' : ''}`}
              onClick={() => handleFilterClick('official')}
            >
              <div className="stat-number">{officialHolidays}</div>
              <div className="stat-label">Official Holidays</div>
            </div>
            <div
              className={`stat-card ${activeFilter === 'weekly' ? 'active' : ''}`}
              onClick={() => handleFilterClick('weekly')}
            >
              <div className="stat-number">{weeklyHolidays}</div>
              <div className="stat-label">Weekly Holidays</div>
            </div>
            <div
              className={`stat-card ${activeFilter === 'upcoming' ? 'active' : ''}`}
              onClick={() => handleFilterClick('upcoming')}
            >
              <div className="stat-number">{upcomingHolidays}</div>
              <div className="stat-label">Upcoming</div>
            </div>
          </div>

          {/* Search Section */}
          <div className="search-section">
            <div className="search-title">
              🔍 Search & Filter Holidays
            </div>
            <div className="search-row">
              <div className="search-input-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by holiday name..."
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                />
                {searchName && (
                  <button
                    className="search-clear-btn"
                    onClick={resetNameSearch}
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="search-input-container">
                <input
                  type="date"
                  className="search-input"
                  value={searchDate}
                  onChange={e => setSearchDate(e.target.value)}
                />
                {searchDate && (
                  <button
                    className="search-clear-btn"
                    onClick={resetDateSearch}
                    title="Clear date filter"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Holidays List */}
          <div className="holidays-grid">
            <div className="holidays-header">
              <h3 className="holidays-title">
                📅 Holidays ({filteredHolidays.length})
              </h3>
              {activeFilter !== 'all' && (
                <div className="filter-indicator">
                  Filtered by: {activeFilter}
                </div>
              )}
            </div>

            {filteredHolidays.length > 0 ? (
              filteredHolidays.map(holiday => {
                const date = new Date(holiday.date);
                const day = date.getDate();
                const month = date.toLocaleDateString('en-US', { month: 'short' });

                return (
                  <div key={holiday.id} className="holiday-item">
                    <div className="holiday-info">
                      <div className="holiday-date-badge">
                        <div className="holiday-date-day">{day}</div>
                        <div className="holiday-date-month">{month}</div>
                      </div>

                      <div className="holiday-details">
                        <h4 className="holiday-name">{holiday.name}</h4>
                        <div className="holiday-meta">
                          <span>📅 {formatDate(holiday.date)}</span>
                          <span>📆 {holiday.day}</span>
                          <span className={`holiday-type-badge holiday-type-${holiday.type}`}>
                            {holiday.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="holiday-actions">
                      <button
                        className="action-btn btn-edit"
                        onClick={() => setEditingHoliday(holiday)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="action-btn btn-delete"
                        onClick={() => handleDelete(holiday.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-holidays">
                <div className="no-holidays-icon">📅</div>
                <div className="no-holidays-text">No holidays found</div>
                <div className="no-holidays-subtext">
                  {holidays.length === 0
                    ? "Start by adding your first holiday!"
                    : activeFilter !== 'all'
                      ? `No ${activeFilter} holidays match your criteria`
                      : "Try adjusting your search criteria"
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingHoliday && (
        <HolidayEditForm
          holiday={editingHoliday}
          holidays={holidays}
          onClose={handleModalClose}
          onUpdated={handleModalUpdated}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <HolidayEditForm
          holiday={null}
          holidays={holidays}
          onClose={handleModalClose}
          onUpdated={handleModalUpdated}
        />
      )}
    </>
  );
};

export default HolidayList;