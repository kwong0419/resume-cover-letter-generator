import React, {useState, useEffect} from 'react'
import '../styles/JobMatcher.css'
const MUSE_API_KEY = process.env.REACT_APP_MUSE_API_KEY

const MUSE_CATEGORIES = {
  Accounting: 'Accounting',
  'Accounting and Finance': 'Accounting and Finance',
  'Account Management': 'Account Management',
  'Account Management/Customer Success': 'Account Management/Customer Success',
  'Administration and Office': 'Administration and Office',
  'Advertising and Marketing': 'Advertising and Marketing',
  'Animal Care': 'Animal Care',
  Arts: 'Arts',
  'Business Operations': 'Business Operations',
  'Cleaning and Facilities': 'Cleaning and Facilities',
  'Computer and IT': 'Computer and IT',
  Construction: 'Construction',
  Corporate: 'Corporate',
  'Customer Service': 'Customer Service',
  'Data and Analytics': 'Data and Analytics',
  'Data Science': 'Data Science',
  Design: 'Design',
  'Design and UX': 'Design and UX',
  Editor: 'Editor',
  Education: 'Education',
  'Energy Generation and Mining': 'Energy Generation and Mining',
  'Entertainment and Travel Services': 'Entertainment and Travel Services',
  'Farming and Outdoors': 'Farming and Outdoors',
  'Food and Hospitality Services': 'Food and Hospitality Services',
  Healthcare: 'Healthcare',
  HR: 'HR',
  'Human Resources and Recruitment': 'Human Resources and Recruitment',
  'Installation, Maintenance, and Repairs': 'Installation, Maintenance, and Repairs',
  IT: 'IT',
  Law: 'Law',
  'Legal Services': 'Legal Services',
  Management: 'Management',
  'Manufacturing and Warehouse': 'Manufacturing and Warehouse',
  Marketing: 'Marketing',
  Mechanic: 'Mechanic',
  'Media, PR, and Communications': 'Media, PR, and Communications',
  'Mental Health': 'Mental Health',
  Nurses: 'Nurses',
  'Office Administration': 'Office Administration',
  'Personal Care and Services': 'Personal Care and Services',
  'Physical Assistant': 'Physical Assistant',
  Product: 'Product',
  'Product Management': 'Product Management',
  'Project Management': 'Project Management',
  'Protective Services': 'Protective Services',
  'Public Relations': 'Public Relations',
  'Real Estate': 'Real Estate',
  Recruiting: 'Recruiting',
  Retail: 'Retail',
  Sales: 'Sales',
  'Science and Engineering': 'Science and Engineering',
  'Social Services': 'Social Services',
  'Software Engineer': 'Software Engineer',
  'Software Engineering': 'Software Engineering',
  'Sports, Fitness, and Recreation': 'Sports, Fitness, and Recreation',
  'Transportation and Logistics': 'Transportation and Logistics',
  UX: 'UX',
  Videography: 'Videography',
  Writer: 'Writer',
  'Writing and Editing': 'Writing and Editing',
}

const JobMatcher = ({userProfile}) => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [locations, setLocations] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')

  // Fetch available locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/muse-locations')
        if (!response.ok) throw new Error('Failed to fetch locations')
        const data = await response.json()
        setLocations(data.locations)
      } catch (err) {
        console.error('Error fetching locations:', err)
      }
    }

    fetchLocations()
  }, [])

  // Fetch jobs when filters change
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      setError('')

      try {
        // Use The Muse API directly instead of your backend
        const apiUrl = 'https://www.themuse.com/api/public/jobs'

        // Log the URL being used
        console.log('Fetching from:', `${apiUrl}?api_key=${MUSE_API_KEY}&page=1`)

        const response = await fetch(
          `${apiUrl}?api_key=${MUSE_API_KEY}&page=1&keywords=${encodeURIComponent(
            selectedCategory,
          )}&location=${encodeURIComponent(selectedLocation)}`,
        )

        // Check if response is HTML instead of JSON
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Received HTML instead of JSON. API URL may be incorrect.')
        }

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`)
        }

        const data = await response.json()
        setJobs(data.results || [])
        setPageCount(data.pageCount)
      } catch (error) {
        console.error('Error fetching jobs:', error)
        setError(`Failed to fetch jobs: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [selectedCategory, selectedLocation])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pageCount) {
      setPage(newPage)
    }
  }

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value)
    setPage(1) // Reset to first page when filter changes
  }

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value)
    setPage(1) // Reset to first page when filter changes
  }

  return (
    <div className="job-matcher-container">
      <h2>Job Listings</h2>

      <div className="job-filter-form">
        <div className="form-group">
          <label htmlFor="category">Job Category:</label>
          <select id="category" value={selectedCategory} onChange={handleCategoryChange} className="filter-select">
            <option value="">All Categories</option>
            {Object.entries(MUSE_CATEGORIES).map(([key, value]) => (
              <option key={key} value={value}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <select id="location" value={selectedLocation} onChange={handleLocationChange} className="filter-select">
            <option value="">All Locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="loading">Loading jobs...</div>}
      {error && <div className="error-message">{error}</div>}

      {jobs.length === 0 && !loading && <div className="no-jobs-message">No job listings found.</div>}

      <div className="job-listings">
        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            <h3>{job.name}</h3>
            <p className="company-name">
              <strong>Company:</strong> {job.company.name}
            </p>
            <p className="location">
              <strong>Location:</strong> {job.locations.map((loc) => loc.name).join(', ')}
            </p>
            <p className="job-level">
              <strong>Level:</strong> {job.levels.map((level) => level.name).join(', ')}
            </p>
            <a href={job.refs.landing_page} target="_blank" rel="noopener noreferrer" className="apply-btn">
              View Job
            </a>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="pagination">
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="page-btn">
            Previous
          </button>
          <span className="page-info">
            Page {page} of {pageCount}
          </span>
          <button onClick={() => handlePageChange(page + 1)} disabled={page === pageCount} className="page-btn">
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default JobMatcher
