# AI Resume & Cover Letter Generator

## Overview

The AI Resume & Cover Letter Generator is a full-stack web application built with React and Express that helps job seekers create professional, ATS-optimized resumes and cover letters. The application leverages AI to generate tailored content based on user input, making the job application process faster and more effective.

## Features

- **Resume Generation**: Create professional resumes with customizable sections for personal information, work experience, education, skills, and achievements.
- **Cover Letter Creation**: Generate personalized cover letters tailored to specific job positions and companies.
- **Dark/Light Mode**: Toggle between dark and light themes for comfortable viewing in any environment.
- **PDF Export**: Export your resume or cover letter as a PDF document for easy sharing.
- **Copy to Clipboard**: Quickly copy the generated content to use in other applications.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.

## Technology Stack

### Frontend

- React.js
- CSS3 with CSS variables for theming
- HTML5
- JavaScript (ES6+)
- HTML2Canvas & jsPDF for PDF generation

### Backend

- Express.js
- Node.js
- AI text generation API integration

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/ai-resume-generator.git
   cd ai-resume-generator
   ```

2. Install dependencies for both frontend and backend:

   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with your API keys:

   ```
   PORT=5000
   API_KEY=your_api_key_here
   ```

4. Start the development servers:

   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Choose Generator Type**: Select either Resume Generator or Cover Letter Generator from the tabs.
2. **Fill in Your Information**:
   - For resumes: Add personal details, work experience, education, skills, and achievements.
   - For cover letters: Include personal information, job title, company name, relevant skills, and additional information.
3. **Generate Content**: Click the "Generate" button to create your document.
4. **Review and Export**: Review the generated content, make any necessary adjustments, and export as a PDF or copy to clipboard.

## Customization

- **Themes**: Toggle between dark and light mode using the theme switch in the top-left corner.
- **Content**: Edit the generated content directly before exporting if needed.

## Deployment

The application can be deployed to platforms like Heroku, Vercel, or AWS:

## Future Enhancements

- ATS optimization score and feedback
- Multiple resume and cover letter templates
- Job description analysis for keyword optimization
- User accounts to save and manage multiple documents
- Integration with job boards for direct application

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

Google Gemini for providing the AI text generation capabilities
The React and Express.js communities for their excellent documentation and support
All contributors who have helped improve this project

---

Note: This project is intended for educational purposes and to assist job seekers. The AI-generated content should be reviewed and personalized before use in actual job applications.
