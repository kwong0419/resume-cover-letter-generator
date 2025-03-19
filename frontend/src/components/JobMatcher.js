import React, {useState, useEffect} from 'react'
import '../styles/JobMatcher.css'

function matchJobs(userProfile, jobListings) {
  const userSkills = userProfile.skills.map((skill) => skill.toLowerCase())

  return jobListings
    .map((job) => {
      const jobKeywords = job.contents ? job.contents.toLowerCase().split(' ') : []
      const matchingKeywords = jobKeywords.filter((keyword) => userSkills.includes(keyword))
      const matchScore = jobKeywords.length > 0 ? (matchingKeywords.length / jobKeywords.length) * 100 : 0

      return {
        ...job,
        matchScore,
        matchingKeywords,
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
}

const JobMatcher = ({userProfile}) => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [location, setLocation] = useState('New York')
  const [category, setCategory] = useState('Software Engineering')

  const fetchJobs = async () => {
    setLoading(true)
    setError('')

    try {
      const url = `/api/job-listings?location=${encodeURIComponent(location)}&category=${encodeURIComponent(category)}`
      const response = await fetch(url)
      const data = await response.json()
      const matchedJobs = matchJobs(userProfile, data)
      setJobs(matchedJobs)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to fetch job listings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [userProfile])

  return (
    <div className="job-matcher-container">
      <h2>Job Matches</h2>
      <div className="job-filter-form">
        <div className="form-group">
          <label>Location:</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Category:</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <button className="filter-btn" onClick={fetchJobs}>
          Apply Filters
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      <div className="job-listings">
        {jobs.map((job, index) => (
          <div key={index} className="job-card">
            <h3>{job.name}</h3>
            <p>
              <strong>Company:</strong> {job.company?.name || 'N/A'}
            </p>
            <p>
              <strong>Location:</strong> {job.locations ? job.locations.map((loc) => loc.name).join(', ') : 'N/A'}
            </p>
            <p>
              <strong>Match Score:</strong> {job.matchScore.toFixed(2)}%
            </p>
            <p>
              <strong>Matching Keywords:</strong> {job.matchingKeywords.join(', ') || 'None'}
            </p>
            {job.refs?.landing_page && (
              <a href={job.refs.landing_page} target="_blank" rel="noopener noreferrer" className="view-job-btn">
                View Job
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default JobMatcher
