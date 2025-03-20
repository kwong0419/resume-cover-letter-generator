import React, {useState, useEffect} from 'react'
import './App.css'
import {exportToPDF} from './utils/pdfExport'
import FormattedDocument from './components/FormattedDocument'
import ThemeToggle from './components/ThemeToggle'
import JobAnalyzer from './components/JobAnalyzer'
import JobMatcher from './components/JobMatcher'
import HRAgent from './components/HRAgent'

function App() {
  const [activeTab, setActiveTab] = useState('resume')
  const [formData, setFormData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
    },
    workExperience: [
      {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
      },
    ],
    education: [
      {
        institution: '',
        degree: '',
        field: '',
        graduationYear: '',
      },
    ],
    skills: [],
    achievements: [],
  })

  const [coverLetterData, setCoverLetterData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    jobTitle: '',
    company: '',
    skills: [],
    additionalInfo: '',
  })

  const [generatedResume, setGeneratedResume] = useState('')
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    } else {
      // Check if user prefers dark mode
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(prefersDarkMode)
    }
  }, [])

  // Apply theme changes to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode)
  }

  // Handle form input changes for resume
  const handlePersonalInfoChange = (e) => {
    setFormData({
      ...formData,
      personalInfo: {
        ...formData.personalInfo,
        [e.target.name]: e.target.value,
      },
    })
  }

  // Handle work experience changes
  const handleWorkExperienceChange = (index, e) => {
    const updatedWorkExperience = [...formData.workExperience]
    updatedWorkExperience[index] = {
      ...updatedWorkExperience[index],
      [e.target.name]: e.target.value,
    }

    setFormData({
      ...formData,
      workExperience: updatedWorkExperience,
    })
  }

  // Add new work experience entry
  const addWorkExperience = () => {
    setFormData({
      ...formData,
      workExperience: [
        ...formData.workExperience,
        {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          description: '',
        },
      ],
    })
  }

  // Handle education changes
  const handleEducationChange = (index, e) => {
    const updatedEducation = [...formData.education]
    updatedEducation[index] = {
      ...updatedEducation[index],
      [e.target.name]: e.target.value,
    }

    setFormData({
      ...formData,
      education: updatedEducation,
    })
  }

  // Add new education entry
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          institution: '',
          degree: '',
          field: '',
          graduationYear: '',
        },
      ],
    })
  }

  // Handle skills input
  const handleSkillsChange = (e) => {
    setFormData({
      ...formData,
      skills: e.target.value.split(',').map((skill) => skill.trim()),
    })
  }

  // Handle achievements input
  const handleAchievementsChange = (e) => {
    setFormData({
      ...formData,
      achievements: e.target.value.split(',').map((achievement) => achievement.trim()),
    })
  }

  // Handle cover letter form changes
  const handleCoverLetterChange = (e) => {
    const {name, value} = e.target

    if (name.startsWith('personalInfo.')) {
      const field = name.split('.')[1]
      setCoverLetterData({
        ...coverLetterData,
        personalInfo: {
          ...coverLetterData.personalInfo,
          [field]: value,
        },
      })
    } else if (name === 'skills') {
      setCoverLetterData({
        ...coverLetterData,
        skills: value.split(',').map((skill) => skill.trim()),
      })
    } else {
      setCoverLetterData({
        ...coverLetterData,
        [name]: value,
      })
    }
  }

  // Generate resume
  const generateResume = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate resume')
      }

      const data = await response.json()
      setGeneratedResume(data.resume)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to generate resume. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Generate cover letter
  const generateCoverLetter = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coverLetterData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate cover letter')
      }

      const data = await response.json()
      setGeneratedCoverLetter(data.coverLetter)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to generate cover letter. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Add a function to copy content to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert('Content copied to clipboard!')
      })
      .catch((err) => {
        console.error('Failed to copy: ', err)
        setError('Failed to copy to clipboard')
      })
  }

  // Handle PDF export for resume
  const handleResumeExport = () => {
    exportToPDF('resume-content', `${formData.personalInfo.name.replace(/\s+/g, '_')}_Resume`, setIsLoading, setError)
  }

  // Handle PDF export for cover letter
  const handleCoverLetterExport = () => {
    exportToPDF(
      'cover-letter-content',
      `${coverLetterData.personalInfo.name.replace(/\s+/g, '_')}_Cover_Letter`,
      setIsLoading,
      setError,
    )
  }

  return (
    <div className="App">
      <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <header>
        <h1 className="app-title">AI Resume & Cover Letter Generator</h1>
        <div className="tabs">
          <button className={activeTab === 'resume' ? 'active' : ''} onClick={() => setActiveTab('resume')}>
            Resume Generator
          </button>
          <button className={activeTab === 'ats' ? 'active' : ''} onClick={() => setActiveTab('ats')}>
            ATS Optimization
          </button>
          <button className={activeTab === 'cover-letter' ? 'active' : ''} onClick={() => setActiveTab('cover-letter')}>
            Cover Letter Generator
          </button>
          <button className={activeTab === 'hr-agent' ? 'active' : ''} onClick={() => setActiveTab('hr-agent')}>
            HR Agent
          </button>
          <button className={activeTab === 'job-matcher' ? 'active' : ''} onClick={() => setActiveTab('job-matcher')}>
            Job Matcher
          </button>
        </div>
      </header>

      <main>
        {error && <div className="error">{error}</div>}

        {activeTab === 'resume' && (
          <div className="resume-section">
            <div className="form-container">
              <h2>Resume Information</h2>
              <form onSubmit={generateResume}>
                <h3>Personal Information</h3>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.personalInfo.name}
                    onChange={handlePersonalInfoChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.personalInfo.email}
                    onChange={handlePersonalInfoChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.personalInfo.phone}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.personalInfo.address}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label>LinkedIn</label>
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.personalInfo.linkedin}
                    onChange={handlePersonalInfoChange}
                  />
                </div>

                <h3>Work Experience</h3>
                {formData.workExperience.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <h4>Experience {index + 1}</h4>
                    <div className="form-group">
                      <label>Company</label>
                      <input
                        type="text"
                        name="company"
                        value={exp.company}
                        onChange={(e) => handleWorkExperienceChange(index, e)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Position</label>
                      <input
                        type="text"
                        name="position"
                        value={exp.position}
                        onChange={(e) => handleWorkExperienceChange(index, e)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="text"
                        name="startDate"
                        value={exp.startDate}
                        onChange={(e) => handleWorkExperienceChange(index, e)}
                        placeholder="e.g., Jan 2020"
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="text"
                        name="endDate"
                        value={exp.endDate}
                        onChange={(e) => handleWorkExperienceChange(index, e)}
                        placeholder="e.g., Present"
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={exp.description}
                        onChange={(e) => handleWorkExperienceChange(index, e)}
                        placeholder="Describe your responsibilities and achievements"
                      />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addWorkExperience} className="add-btn">
                  + Add Work Experience
                </button>

                <h3>Education</h3>
                {formData.education.map((edu, index) => (
                  <div key={index} className="education-item">
                    <h4>Education {index + 1}</h4>
                    <div className="form-group">
                      <label>Institution</label>
                      <input
                        type="text"
                        name="institution"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(index, e)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Degree</label>
                      <input
                        type="text"
                        name="degree"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, e)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Field of Study</label>
                      <input
                        type="text"
                        name="field"
                        value={edu.field}
                        onChange={(e) => handleEducationChange(index, e)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Graduation Year</label>
                      <input
                        type="text"
                        name="graduationYear"
                        value={edu.graduationYear}
                        onChange={(e) => handleEducationChange(index, e)}
                      />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addEducation} className="add-btn">
                  + Add Education
                </button>

                <h3>Skills</h3>
                <div className="form-group">
                  <label>Skills (comma-separated)</label>
                  <textarea
                    name="skills"
                    value={formData.skills.join(', ')}
                    onChange={handleSkillsChange}
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                </div>

                <h3>Achievements</h3>
                <div className="form-group">
                  <label>Achievements (comma-separated)</label>
                  <textarea
                    name="achievements"
                    value={formData.achievements.join(', ')}
                    onChange={handleAchievementsChange}
                    placeholder="e.g., Increased sales by 20%, Led team of 5 developers"
                  />
                </div>

                <button type="submit" className="generate-btn" disabled={isLoading}>
                  {isLoading ? 'Generating...' : 'Generate Resume'}
                </button>
              </form>
            </div>

            {generatedResume && (
              <div className="result-container">
                <div className="result-header">
                  <h2>Generated Resume</h2>
                  <div className="button-group">
                    <button
                      className="action-btn copy-btn"
                      onClick={() => copyToClipboard(generatedResume)}
                      disabled={isLoading}
                    >
                      Copy to Clipboard
                    </button>
                    <button className="action-btn export-btn" onClick={handleResumeExport} disabled={isLoading}>
                      {isLoading ? 'Exporting...' : 'Export as PDF'}
                    </button>
                  </div>
                </div>
                <div id="resume-content">
                  <FormattedDocument content={generatedResume} type="resume" />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ats' && (
          <div className="ats-section">
            <JobAnalyzer formData={formData} setFormData={setFormData} setGeneratedResume={setGeneratedResume} />
          </div>
        )}

        {activeTab === 'cover-letter' && (
          <div className="cover-letter-section">
            <div className="form-container">
              <h2>Cover Letter Information</h2>
              <form onSubmit={generateCoverLetter}>
                <h3>Personal Information</h3>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="personalInfo.name"
                    value={coverLetterData.personalInfo.name}
                    onChange={handleCoverLetterChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="personalInfo.email"
                    value={coverLetterData.personalInfo.email}
                    onChange={handleCoverLetterChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="personalInfo.phone"
                    value={coverLetterData.personalInfo.phone}
                    onChange={handleCoverLetterChange}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="personalInfo.address"
                    value={coverLetterData.personalInfo.address}
                    onChange={handleCoverLetterChange}
                  />
                </div>

                <h3>Job Information</h3>
                <div className="form-group">
                  <label>Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={coverLetterData.jobTitle}
                    onChange={handleCoverLetterChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    name="company"
                    value={coverLetterData.company}
                    onChange={handleCoverLetterChange}
                    required
                  />
                </div>

                <h3>Skills & Additional Information</h3>
                <div className="form-group">
                  <label>Skills (comma-separated)</label>
                  <textarea
                    name="skills"
                    value={coverLetterData.skills.join(', ')}
                    onChange={handleCoverLetterChange}
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                </div>
                <div className="form-group">
                  <label>Additional Information</label>
                  <textarea
                    name="additionalInfo"
                    value={coverLetterData.additionalInfo}
                    onChange={handleCoverLetterChange}
                    placeholder="Any additional information you want to include in your cover letter"
                  />
                </div>

                <h3>Job Description</h3>
                <div className="form-group">
                  <label>Job Description (for ATS optimization)</label>
                  <textarea
                    name="jobDescription"
                    value={coverLetterData.jobDescription || ''}
                    onChange={handleCoverLetterChange}
                    placeholder="Paste the job description here for ATS-optimized cover letter"
                    rows={6}
                  />
                </div>

                <button type="submit" className="generate-btn" disabled={isLoading}>
                  {isLoading ? 'Generating...' : 'Generate Cover Letter'}
                </button>
              </form>
            </div>

            {generatedCoverLetter && (
              <div className="result-container">
                <div className="result-header">
                  <h2>Generated Cover Letter</h2>
                  <div className="button-group">
                    <button
                      className="action-btn copy-btn"
                      onClick={() => copyToClipboard(generatedCoverLetter)}
                      disabled={isLoading}
                    >
                      Copy to Clipboard
                    </button>
                    <button className="action-btn export-btn" onClick={handleCoverLetterExport} disabled={isLoading}>
                      {isLoading ? 'Exporting...' : 'Export as PDF'}
                    </button>
                  </div>
                </div>
                <div id="cover-letter-content">
                  <FormattedDocument content={generatedCoverLetter} type="cover-letter" />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'hr-agent' && (
          <div className="hr-agent-section">
            <HRAgent formData={formData} generatedResume={generatedResume} />
          </div>
        )}

        {activeTab === 'job-matcher' && (
          <div className="job-matcher-section">
            <JobMatcher userProfile={formData} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
