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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
