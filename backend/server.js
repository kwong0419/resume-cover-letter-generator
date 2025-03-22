const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const {GoogleGenerativeAI} = require('@google/generative-ai')
const natural = require('natural')
const {removeStopwords} = require('stopword')
const tokenizer = new natural.WordTokenizer()

dotenv.config()

const app = express()

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-netlify-app-name.netlify.app', // Add your Netlify domain
  ],
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))

// Increase the payload size limit (50mb should be more than enough)
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({extended: true, limit: '50mb'}))

// Define port
const PORT = process.env.PORT || 5000

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const MUSE_API_KEY = process.env.MUSE_API_KEY

// API endpoint to generate resume
app.post('/api/generate-resume', async (req, res) => {
  try {
    const {personalInfo, workExperience, education, skills, achievements} = req.body

    // Create a prompt for Gemini with better formatting instructions
    const prompt = `Generate a professional resume for ${personalInfo.name} with the following information:
    
    Personal Information:
    ${JSON.stringify(personalInfo)}
    
    Work Experience:
    ${JSON.stringify(workExperience)}
    
    Education:
    ${JSON.stringify(education)}
    
    Skills:
    ${JSON.stringify(skills)}
    
    Achievements:
    ${JSON.stringify(achievements)}
    
    IMPORTANT FORMATTING INSTRUCTIONS:
    1. Create a clean, professional resume with standard sections
    2. Use a simple, consistent format that would work well in Microsoft Word
    3. Keep line lengths reasonable (60-80 characters per line)
    4. Use blank lines between sections for clear separation
    5. Avoid special characters or complex formatting
    6. Do not use markdown, HTML tags, or any special formatting
    7. Format dates and locations consistently
    8. Use simple bullet points (• or - ) for listing items
    9. Keep the overall width narrow enough to fit on a standard page
    10. Ensure consistent spacing throughout the document`

    // Get the generative model
    const model = genAI.getGenerativeModel({model: 'gemini-1.5-pro'})

    // Generate content
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    res.json({resume: text})
  } catch (error) {
    console.error('Error generating resume:', error)
    res.status(500).json({error: 'Failed to generate resume'})
  }
})

// API endpoint to generate cover letter
app.post('/api/generate-cover-letter', async (req, res) => {
  try {
    const {personalInfo, jobTitle, company, skills, additionalInfo} = req.body

    // Create a prompt for Gemini with template instructions
    const prompt = `Generate a professional cover letter template for ${
      personalInfo.name
    } applying for the position of ${jobTitle} at ${company}. 
    
    Include the following information:
    Personal Information: ${JSON.stringify(personalInfo)}
    Key Skills: ${JSON.stringify(skills)}
    Additional Information: ${additionalInfo}
    
    IMPORTANT FORMATTING INSTRUCTIONS:
    1. Create a standard business letter format but leave the date as "[DATE]" for the user to fill in
    2. Include placeholders like "[HIRING MANAGER'S NAME]" where appropriate
    3. Use a simple, consistent format that would work well in Microsoft Word
    4. Keep line lengths reasonable (60-80 characters per line)
    5. Use blank lines between paragraphs for clear separation
    6. Avoid special characters or complex formatting
    7. Do not use markdown, HTML tags, or any special formatting
    8. Keep the overall width narrow enough to fit on a standard page
    9. Ensure consistent spacing throughout the document
    10. Use a professional tone and language
    11. Include a proper salutation and closing`

    // Get the generative model
    const model = genAI.getGenerativeModel({model: 'gemini-1.5-pro'})

    // Generate content
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    res.json({coverLetter: text})
  } catch (error) {
    console.error('Error generating cover letter:', error)
    res.status(500).json({error: 'Failed to generate cover letter'})
  }
})

// API endpoint to analyze job description and compare with resume
app.post('/api/analyze-job', async (req, res) => {
  try {
    const {resumeData, jobDescription} = req.body

    // Extract keywords from job description
    const jobKeywords = extractKeywords(jobDescription)

    // Extract keywords from resume
    const resumeText = generateResumeText(resumeData)
    const resumeKeywords = extractKeywords(resumeText)

    // Find matching and missing keywords
    const {matchingKeywords, missingKeywords} = compareKeywords(resumeKeywords, jobKeywords)

    // Calculate ATS score (percentage of job keywords found in resume)
    const atsScore = calculateATSScore(matchingKeywords, jobKeywords)

    // Generate suggestions for improvement
    const suggestions = generateSuggestions(missingKeywords, resumeData)

    res.json({
      atsScore,
      matchingKeywords,
      missingKeywords,
      suggestions,
    })
  } catch (error) {
    console.error('Error analyzing job description:', error)
    res.status(500).json({error: 'Failed to analyze job description'})
  }
})

// API endpoint to optimize resume based on job description
app.post('/api/optimize-resume', async (req, res) => {
  try {
    const {resumeData, jobDescription} = req.body

    // Create a prompt for Gemini to optimize the resume
    const prompt = `I have a resume and a job description. Please optimize the resume to better match the job description by naturally incorporating relevant keywords.
    
    Resume Data:
    ${JSON.stringify(resumeData)}
    
    Job Description:
    ${jobDescription}
    
    Please return an optimized version of the resume data with the following improvements:
    1. Enhanced bullet points in work experience that incorporate relevant keywords
    2. Improved skills section that highlights job-relevant skills
    3. A tailored professional summary that addresses the job requirements
    
    Return the result as a JSON object with the same structure as the original resumeData.`

    // Get the generative model
    const model = genAI.getGenerativeModel({model: 'gemini-1.5-pro'})

    // Generate optimized resume
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean the response text by removing Markdown code block syntax
    let cleanedText = text
      .replace(/```json/g, '') // Remove opening ```json
      .replace(/```/g, '') // Remove closing ```
      .trim() // Remove leading/trailing whitespace

    // Parse the cleaned text as JSON
    const optimizedResumeData = JSON.parse(cleanedText)

    res.json({optimizedResumeData})
  } catch (error) {
    console.error('Error optimizing resume:', error)
    res.status(500).json({error: 'Failed to optimize resume'})
  }
})

// API endpoint to generate ATS-optimized cover letter
app.post('/api/generate-optimized-cover-letter', async (req, res) => {
  try {
    const {personalInfo, jobTitle, company, skills, additionalInfo, jobDescription} = req.body

    // Create a prompt for Gemini with ATS optimization instructions
    const prompt = `Generate an ATS-optimized cover letter for ${
      personalInfo.name
    } applying for the position of ${jobTitle} at ${company}.
    
    Personal Information: ${JSON.stringify(personalInfo)}
    Key Skills: ${JSON.stringify(skills)}
    Additional Information: ${additionalInfo}
    
    Job Description:
    ${jobDescription}
    
    IMPORTANT INSTRUCTIONS:
    1. Create a professional cover letter that naturally incorporates keywords from the job description
    2. Highlight the applicant's relevant skills that match the job requirements
    3. Use a standard business letter format but leave the date as "[DATE]"
    4. Include placeholders like "[HIRING MANAGER'S NAME]" where appropriate
    5. Keep line lengths reasonable (60-80 characters per line)
    6. Use blank lines between paragraphs for clear separation
    7. Avoid special characters or complex formatting
    8. Do not use markdown, HTML tags, or any special formatting
    9. Ensure the letter demonstrates understanding of the company and role
    10. Use a professional tone and language`

    // Get the generative model
    const model = genAI.getGenerativeModel({model: 'gemini-1.5-pro'})

    // Generate content
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    res.json({coverLetter: text})
  } catch (error) {
    console.error('Error generating optimized cover letter:', error)
    res.status(500).json({error: 'Failed to generate optimized cover letter'})
  }
})

// API endpoint to fetch and analyze jobs from The Muse
app.get('/api/muse-jobs', async (req, res) => {
  try {
    const {page = 1, category, location} = req.query

    const params = new URLSearchParams({
      page: page.toString(),
      api_key: process.env.MUSE_API_KEY,
    })

    if (category) params.append('category', category)
    if (location) params.append('location', location)

    const url = `https://www.themuse.com/api/public/jobs?api_key=${MUSE_API_KEY}&${params}`

    console.log('Requesting Muse API:', url)

    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      console.error('Muse API Error:', data)
      throw new Error(data.error || 'Failed to fetch jobs')
    }

    res.json({
      jobs: data.results || [],
      page: data.page || 1,
      pageCount: data.page_count || 0,
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    res.status(500).json({error: error.message || 'Failed to fetch jobs'})
  }
})

// New endpoint to fetch available locations
app.get('/api/muse-locations', async (req, res) => {
  try {
    // Make a sample job request to get available locations
    const response = await fetch(`https://www.themuse.com/api/public/jobs?api_key=${process.env.MUSE_API_KEY}&page=1`)
    const data = await response.json()

    // Extract unique locations from the results
    const locations = [...new Set(data.results.flatMap((job) => job.locations).map((loc) => loc.name))].sort()

    res.json({locations})
  } catch (error) {
    console.error('Error fetching locations:', error)
    res.status(500).json({error: 'Failed to fetch locations'})
  }
})

// HR Agent Feedback endpoint
app.post('/api/hr-agent-feedback', async (req, res) => {
  try {
    const {resumeData, generatedResume, jobDescription} = req.body

    // Create a prompt for the AI to act as an HR agent
    const prompt = `You are an experienced HR professional and recruiter with 15+ years of experience. 
    You are reviewing the following resume${jobDescription ? ' for a specific job' : ''}:
    
    ${generatedResume}
    
    ${jobDescription ? `The job description is: ${jobDescription}` : ''}
    
    Please provide detailed, professional feedback on this resume as if you were reviewing it for a hiring decision. 
    Your feedback should be constructive, specific, and actionable.
    
    Return your feedback in the following JSON format:
    {
      "overallRating": [a number from 1-5, with 5 being excellent],
      "strengths": [an array of 3-5 specific strengths of the resume],
      "areasForImprovement": [an array of 3-5 specific areas that need improvement],
      "detailedFeedback": [
        {
          "section": "Format and Layout",
          "feedback": "detailed feedback about the resume's format and layout"
        },
        {
          "section": "Content and Language",
          "feedback": "detailed feedback about the content quality and language used"
        },
        {
          "section": "Skills Presentation",
          "feedback": "detailed feedback about how skills are presented"
        },
        {
          "section": "Experience Description",
          "feedback": "detailed feedback about how work experience is described"
        },
        {
          "section": "Education and Qualifications",
          "feedback": "detailed feedback about education and qualifications"
        }${
          jobDescription
            ? `,
        {
          "section": "Job Fit",
          "feedback": "detailed feedback about how well the resume matches the job description"
        }`
            : ''
        }
      ]
    }
    
    Ensure your feedback is specific, actionable, and professional. Focus on both strengths and areas for improvement.`

    // Get the generative model
    const model = genAI.getGenerativeModel({model: 'gemini-1.5-pro'})

    // Generate content
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the JSON response
    let feedback
    try {
      feedback = JSON.parse(text)
    } catch (error) {
      console.error('Error parsing JSON from AI response:', error)
      // If parsing fails, try to extract JSON using regex
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        feedback = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Could not parse HR agent feedback')
      }
    }

    res.json({feedback})
  } catch (error) {
    console.error('Error generating HR agent feedback:', error)
    res.status(500).json({error: 'Failed to generate HR agent feedback'})
  }
})

// Improve Resume endpoint
app.post('/api/improve-resume', async (req, res) => {
  try {
    const {resumeData, generatedResume, jobDescription, feedback} = req.body

    // Create a prompt for the AI to improve the resume based on feedback
    const prompt = `You are an expert resume writer with 15+ years of experience. 
    You have been given a resume and feedback from an HR professional. 
    Your task is to improve the resume based on this feedback.
    
    Original Resume:
    ${generatedResume}
    
    HR Feedback:
    ${JSON.stringify(feedback)}
    
    ${
      jobDescription
        ? `Job Description:
    ${jobDescription}`
        : ''
    }
    
    Please rewrite the resume to address all the feedback points while maintaining the person's actual experience and qualifications. 
    Make the resume more impactful, professional, and targeted${jobDescription ? ' to the job description' : ''}.
    
    IMPORTANT FORMATTING INSTRUCTIONS:
    1. Create a clean, professional resume with standard sections
    2. Use a simple, consistent format that would work well in Microsoft Word
    3. Keep line lengths reasonable (60-80 characters per line)
    4. Use blank lines between sections for clear separation
    5. Avoid special characters or complex formatting
    6. Do not use markdown, HTML tags, or any special formatting
    7. Format dates and locations consistently
    8. Use simple bullet points (• or - ) for listing items
    9. Keep the overall width narrow enough to fit on a standard page
    10. Ensure consistent spacing throughout the document
    
    Return ONLY the improved resume without any additional explanations or comments.`

    // Get the generative model
    const model = genAI.getGenerativeModel({model: 'gemini-1.5-pro'})

    // Generate content
    const result = await model.generateContent(prompt)
    const response = await result.response
    const improvedResume = response.text()

    res.json({improvedResume})
  } catch (error) {
    console.error('Error improving resume:', error)
    res.status(500).json({error: 'Failed to improve resume'})
  }
})

// Helper functions for keyword extraction and analysis
function extractKeywords(text) {
  if (!text) return []

  // Tokenize and convert to lowercase
  const tokens = tokenizer.tokenize(text.toLowerCase())

  // Remove stopwords
  const filteredTokens = removeStopwords(tokens)

  // Count frequency of each keyword
  const keywordFrequency = {}
  filteredTokens.forEach((token) => {
    if (token.length > 2) {
      // Ignore very short words
      keywordFrequency[token] = (keywordFrequency[token] || 0) + 1
    }
  })

  // Convert to array of objects with keyword and frequency
  const keywords = Object.entries(keywordFrequency).map(([keyword, frequency]) => ({
    keyword,
    frequency,
  }))

  // Sort by frequency (descending)
  return keywords.sort((a, b) => b.frequency - a.frequency)
}

function compareKeywords(resumeKeywords, jobKeywords) {
  const resumeKeywordSet = new Set(resumeKeywords.map((k) => k.keyword))
  const jobKeywordSet = new Set(jobKeywords.map((k) => k.keyword))

  // Find matching keywords
  const matchingKeywords = jobKeywords.filter((k) => resumeKeywordSet.has(k.keyword))

  // Find missing keywords
  const missingKeywords = jobKeywords.filter((k) => !resumeKeywordSet.has(k.keyword))

  return {matchingKeywords, missingKeywords}
}

function calculateATSScore(matchingKeywords, jobKeywords) {
  if (jobKeywords.length === 0) return 100

  // Calculate score as percentage of job keywords found in resume
  const score = (matchingKeywords.length / jobKeywords.length) * 100
  return Math.round(score)
}

function generateResumeText(resumeData) {
  // Combine all text from resume data into a single string
  let text = ''

  // Add personal info
  const {personalInfo} = resumeData
  text += `${personalInfo.name} ${personalInfo.email} ${personalInfo.phone} ${personalInfo.address} ${personalInfo.linkedin} `

  // Add work experience
  resumeData.workExperience.forEach((exp) => {
    text += `${exp.company} ${exp.position} ${exp.description} `
  })

  // Add education
  resumeData.education.forEach((edu) => {
    text += `${edu.institution} ${edu.degree} ${edu.field} `
  })

  // Add skills and achievements
  text += resumeData.skills.join(' ') + ' '
  text += resumeData.achievements.join(' ')

  return text
}

function generateSuggestions(missingKeywords, resumeData) {
  // Generate suggestions for incorporating missing keywords
  const suggestions = []

  if (missingKeywords.length > 0) {
    suggestions.push({
      type: 'general',
      text: 'Consider adding these missing keywords to your resume to improve ATS score:',
    })

    // Group keywords by importance (frequency)
    const highPriority = missingKeywords.filter((k) => k.frequency > 3).slice(0, 5)
    const mediumPriority = missingKeywords.filter((k) => k.frequency > 1 && k.frequency <= 3).slice(0, 5)

    if (highPriority.length > 0) {
      suggestions.push({
        type: 'high_priority',
        text: 'High priority keywords:',
        keywords: highPriority.map((k) => k.keyword),
      })
    }

    if (mediumPriority.length > 0) {
      suggestions.push({
        type: 'medium_priority',
        text: 'Medium priority keywords:',
        keywords: mediumPriority.map((k) => k.keyword),
      })
    }

    // Specific section suggestions
    suggestions.push({
      type: 'skills',
      text: 'Consider adding these skills to your skills section:',
      keywords: missingKeywords.slice(0, 7).map((k) => k.keyword),
    })

    suggestions.push({
      type: 'experience',
      text: 'Try to incorporate these keywords in your work experience descriptions:',
      keywords: missingKeywords.slice(0, 5).map((k) => k.keyword),
    })
  } else {
    suggestions.push({
      type: 'general',
      text: 'Great job! Your resume already contains all the important keywords from the job description.',
    })
  }

  return suggestions
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
