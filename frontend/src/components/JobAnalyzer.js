import React, {useState} from 'react'
import '../styles/JobAnalyzer.css'

const JobAnalyzer = ({formData, setFormData, setGeneratedResume}) => {
  const [jobDescription, setJobDescription] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [optimizedResumeData, setOptimizedResumeData] = useState(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value)
  }

  const analyzeJob = async (e) => {
    e.preventDefault()
    setIsAnalyzing(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/analyze-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData: formData,
          jobDescription,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze job description')
      }

      const data = await response.json()
      setAnalysisResult(data)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to analyze job description. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const optimizeResume = async () => {
    setIsOptimizing(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/optimize-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData: formData,
          jobDescription,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to optimize resume')
      }

      const data = await response.json()
      setOptimizedResumeData(data.optimizedResumeData)

      // Ask user if they want to apply the optimized data
      if (window.confirm('Would you like to apply the optimized resume data?')) {
        setFormData(data.optimizedResumeData)

        // Generate the new resume with the optimized data
        const resumeResponse = await fetch('http://localhost:5000/api/generate-resume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data.optimizedResumeData),
        })

        if (!resumeResponse.ok) {
          throw new Error('Failed to generate optimized resume')
        }

        const resumeData = await resumeResponse.json()
        setGeneratedResume(resumeData.resume)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to optimize resume. Please try again.')
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <div className="job-analyzer">
      <h2>ATS Optimization</h2>
      <form onSubmit={analyzeJob}>
        <div className="form-group">
          <label>Paste Job Description</label>
          <textarea
            name="jobDescription"
            value={jobDescription}
            onChange={handleJobDescriptionChange}
            placeholder="Paste the job description here to analyze how well your resume matches"
            required
            rows={10}
          />
        </div>
        <button type="submit" className="analyze-btn" disabled={isAnalyzing}>
          {isAnalyzing ? 'Analyzing...' : 'Analyze Job Match'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {analysisResult && (
        <div className="analysis-result">
          <div className="ats-score-container">
            <h3>ATS Match Score</h3>
            <div className="ats-score">
              <div
                className="score-value"
                style={{
                  color: analysisResult.atsScore > 70 ? 'green' : analysisResult.atsScore > 50 ? 'orange' : 'red',
                }}
              >
                {analysisResult.atsScore}%
              </div>
              <div className="score-bar">
                <div
                  className="score-fill"
                  style={{
                    width: `${analysisResult.atsScore}%`,
                    backgroundColor:
                      analysisResult.atsScore > 70 ? 'green' : analysisResult.atsScore > 50 ? 'orange' : 'red',
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="keywords-section">
            <div className="matching-keywords">
              <h3>Matching Keywords</h3>
              <div className="keyword-list">
                {analysisResult.matchingKeywords.map((item, index) => (
                  <span key={index} className="keyword-tag matching">
                    {item.keyword} ({item.frequency})
                  </span>
                ))}
              </div>
            </div>

            <div className="missing-keywords">
              <h3>Missing Keywords</h3>
              <div className="keyword-list">
                {analysisResult.missingKeywords.map((item, index) => (
                  <span key={index} className="keyword-tag missing">
                    {item.keyword} ({item.frequency})
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="suggestions-section">
            <h3>Improvement Suggestions</h3>
            {analysisResult.suggestions.map((suggestion, index) => (
              <div key={index} className={`suggestion-item ${suggestion.type}`}>
                <p>{suggestion.text}</p>
                {suggestion.keywords && (
                  <div className="suggestion-keywords">
                    {suggestion.keywords.map((keyword, idx) => (
                      <span key={idx} className="keyword-tag suggestion">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="optimize-btn" onClick={optimizeResume} disabled={isOptimizing}>
            {isOptimizing ? 'Optimizing...' : 'Auto-Optimize Resume'}
          </button>
        </div>
      )}
    </div>
  )
}

export default JobAnalyzer
