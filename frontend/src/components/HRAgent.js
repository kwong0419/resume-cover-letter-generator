import React, {useState} from 'react'
import '../styles/HRAgent.css'

const HRAgent = ({formData, generatedResume}) => {
  const [feedback, setFeedback] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [improvedResume, setImprovedResume] = useState('')

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value)
  }

  const getHRFeedback = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setFeedback(null)

    try {
      const response = await fetch('http://localhost:5000/api/hr-agent-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData: formData,
          generatedResume,
          jobDescription,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get HR agent feedback')
      }

      const data = await response.json()
      setFeedback(data.feedback)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to get HR agent feedback. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const improveResume = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/improve-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData: formData,
          generatedResume,
          jobDescription,
          feedback,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to improve resume')
      }

      const data = await response.json()
      setImprovedResume(data.improvedResume)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to improve resume. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="hr-agent-container">
      <h2>HR Agent Evaluation</h2>
      <p className="hr-agent-description">
        Get professional feedback on your resume from our AI HR agent. The agent will analyze your resume and provide
        detailed feedback as if it were a real HR professional reviewing your application.
      </p>

      <form onSubmit={getHRFeedback}>
        <div className="form-group">
          <label>Job Description (Optional)</label>
          <textarea
            name="jobDescription"
            value={jobDescription}
            onChange={handleJobDescriptionChange}
            placeholder="Paste the job description here for more targeted feedback"
            rows={6}
          />
        </div>
        <button type="submit" className="hr-feedback-btn" disabled={isLoading || !generatedResume}>
          {isLoading ? 'Analyzing...' : 'Get HR Feedback'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {feedback && (
        <div className="hr-feedback-container">
          <div className="feedback-header">
            <h3>HR Agent Feedback</h3>
            <div className="overall-rating">
              <span>Overall Rating: </span>
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${i < feedback.overallRating ? 'filled' : ''}`}>
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="feedback-sections">
            <div className="feedback-section">
              <h4>Strengths</h4>
              <ul>
                {feedback.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="feedback-section">
              <h4>Areas for Improvement</h4>
              <ul>
                {feedback.areasForImprovement.map((area, index) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="feedback-section">
            <h4>Detailed Feedback</h4>
            <div className="detailed-feedback">
              {feedback.detailedFeedback.map((item, index) => (
                <div key={index} className="feedback-item">
                  <h5>{item.section}</h5>
                  <p>{item.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          <button className="improve-resume-btn" onClick={improveResume} disabled={isLoading}>
            {isLoading ? 'Improving...' : 'Improve Resume Based on Feedback'}
          </button>
        </div>
      )}

      {improvedResume && (
        <div className="improved-resume-container">
          <h3>Improved Resume</h3>
          <div className="improved-resume">
            <pre>{improvedResume}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default HRAgent
