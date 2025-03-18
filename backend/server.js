const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const {GoogleGenerativeAI} = require('@google/generative-ai')

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Define port
const PORT = process.env.PORT || 5000

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// API endpoint to generate resume
app.post('/api/generate-resume', async (req, res) => {
  try {
    const {personalInfo, workExperience, education, skills, achievements} = req.body

    // Create a prompt for Gemini
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
    
    Format the resume in a clean, professional style with appropriate sections.`

    // Get the generative model - using the correct model name
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

    // Create a prompt for Gemini
    const prompt = `Generate a professional cover letter for ${
      personalInfo.name
    } applying for the position of ${jobTitle} at ${company}. 
    
    Include the following information:
    Personal Information: ${JSON.stringify(personalInfo)}
    Key Skills: ${JSON.stringify(skills)}
    Additional Information: ${additionalInfo}
    
    Format the cover letter in a professional style with appropriate greeting, body paragraphs, and closing.`

    // Get the generative model - using the correct model name
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
