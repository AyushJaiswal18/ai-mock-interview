# AI-Driven Interview API Documentation

## Overview

The AI-driven interview system analyzes resumes and job requirements to create personalized interview experiences. The AI generates questions based on the candidate's background, skills, and the specific job requirements.

## API Endpoints

### 1. Create AI-Driven Interview

**POST** `/api/interviews`

Creates a new AI-driven interview that will be personalized based on resume analysis.

```json
{
  "title": "Senior Developer Interview",
  "type": "ai-driven",
  "scheduledAt": "2024-01-15T10:00:00Z",
  "duration": 45,
  "resumeText": "Full resume text content...",
  "jobRequirement": {
    "title": "Senior Full Stack Developer",
    "description": "We are looking for a Senior Full Stack Developer...",
    "requiredSkills": ["React", "Node.js", "TypeScript", "MongoDB"],
    "preferredSkills": ["Docker", "AWS", "Redis"],
    "experienceLevel": "senior",
    "industry": "Technology",
    "duration": 45
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "interview": {
      "_id": "interview_id",
      "title": "Senior Developer Interview",
      "type": "ai-driven",
      "status": "scheduled",
      "config": {
        "resumeAnalysis": { /* AI analysis of resume */ },
        "jobRequirement": { /* Job requirements */ },
        "interviewPlan": { /* Generated interview plan */ },
        "skillGaps": { /* Skill gap analysis */ }
      },
      "questions": [ /* Generated questions */ ]
    }
  }
}
```

### 2. Analyze Resume and Generate Interview Plan

**POST** `/api/interviews/{id}/analyze`

Analyzes the resume and generates a personalized interview plan for an existing interview.

```json
{
  "resumeText": "Full resume text content...",
  "jobRequirement": {
    "title": "Senior Full Stack Developer",
    "description": "Job description...",
    "requiredSkills": ["React", "Node.js", "TypeScript"],
    "preferredSkills": ["Docker", "AWS"],
    "experienceLevel": "senior",
    "industry": "Technology",
    "duration": 45
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "interview": { /* Updated interview with analysis */ },
    "analysis": {
      "resumeAnalysis": {
        "skills": ["JavaScript", "React", "Node.js"],
        "experience": {
          "years": 5,
          "roles": ["Software Engineer", "Senior Developer"],
          "industries": ["Technology", "E-commerce"]
        },
        "education": {
          "degree": "Bachelor of Science",
          "field": "Computer Science",
          "institution": "University of Technology"
        },
        "strengths": ["Technical skills", "Leadership"],
        "areasForImprovement": ["Communication", "System design"],
        "overallScore": 85
      },
      "interviewPlan": {
        "totalQuestions": 8,
        "questionDistribution": {
          "technical": 40,
          "behavioral": 35,
          "situational": 15,
          "skills": 10
        },
        "focusAreas": ["System design", "Leadership", "Technical depth"],
        "difficultyProgression": "medium",
        "timePerQuestion": 5,
        "customInstructions": "Focus on their React and Node.js experience..."
      },
      "skillGaps": {
        "missingSkills": ["Kubernetes"],
        "weakSkills": ["System design"],
        "strongSkills": ["React", "Node.js", "JavaScript"],
        "recommendations": ["Practice system design questions", "Learn containerization"]
      },
      "questions": [
        "Tell me about your experience leading the e-commerce platform project...",
        "How would you design a scalable microservices architecture?",
        "Describe a challenging technical problem you solved..."
      ]
    }
  }
}
```

### 3. Start Interview Session

**POST** `/api/interviews/{id}/start`

Starts the interview session. The interview must be analyzed first.

**Response:**
```json
{
  "success": true,
  "data": {
    "interview": {
      "status": "in-progress",
      "startedAt": "2024-01-15T10:00:00Z",
      "questions": [ /* Personalized questions */ ]
    }
  }
}
```

### 4. Submit Interview Response

**POST** `/api/interviews/{id}/responses`

Submit a response to an interview question with AI analysis.

```json
{
  "questionId": "question_id",
  "answer": "My response to the question...",
  "audioUrl": "optional_audio_url",
  "videoUrl": "optional_video_url",
  "duration": 180,
  "startTime": "2024-01-15T10:05:00Z",
  "endTime": "2024-01-15T10:08:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": {
      "questionId": "question_id",
      "answer": "My response...",
      "aiAnalysis": {
        "score": 85,
        "feedback": "Excellent technical depth and clear communication...",
        "improvements": ["Provide more specific examples", "Explain the reasoning behind your decisions"],
        "strengths": ["Strong technical knowledge", "Clear communication"],
        "keywordCoverage": 90,
        "relevanceScore": 95
      }
    },
    "progress": 12.5,
    "totalQuestions": 8,
    "completedQuestions": 1
  }
}
```

### 5. End Interview

**POST** `/api/interviews/{id}/end`

Ends the interview and generates comprehensive AI analysis.

**Response:**
```json
{
  "success": true,
  "data": {
    "interview": {
      "status": "completed",
      "endedAt": "2024-01-15T10:45:00Z",
      "aiAnalysis": {
        "overallScore": 82,
        "communicationScore": 85,
        "technicalScore": 88,
        "confidenceScore": 78,
        "improvementAreas": ["System design", "Leadership examples"],
        "strengths": ["Technical depth", "Problem-solving"],
        "summary": "Strong technical candidate with room for growth in system design...",
        "recommendations": ["Practice system design questions", "Prepare more leadership examples"]
      }
    }
  }
}
```

## Interview Flow

1. **Create Interview**: Initialize an AI-driven interview with resume and job requirements
2. **Analyze**: The AI analyzes the resume and creates a personalized interview plan
3. **Start**: Begin the interview session
4. **Answer Questions**: Submit responses to personalized questions
5. **Get Feedback**: Receive real-time AI analysis for each response
6. **Complete**: End interview and get comprehensive analysis

## AI Features

- **Resume Analysis**: Extracts skills, experience, education, and identifies strengths/weaknesses
- **Job Matching**: Compares candidate skills with job requirements
- **Personalized Questions**: Generates questions specific to the candidate's background
- **Real-time Analysis**: Provides immediate feedback on responses
- **Skill Gap Analysis**: Identifies areas for improvement
- **Comprehensive Feedback**: Final analysis with recommendations

## Testing

Run the AI interview test:

```bash
npm run test-ai
```

This will test the complete AI-driven interview flow with sample data.
