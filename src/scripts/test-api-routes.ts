import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    token: string;
  };
}

interface ApiResponse {
  success?: boolean;
  data?: any;
  error?: string;
  message?: string;
}

class ApiTester {
  private token: string = '';
  private userId: string = '';

  async login(email: string, password: string): Promise<boolean> {
    try {
      console.log(`🔐 Logging in as ${email}...`);
      
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();
      
      if (data.success && data.data.token) {
        this.token = data.data.token;
        this.userId = data.data.user.id;
        console.log(`✅ Login successful!`);
        console.log(`   User: ${data.data.user.firstName} ${data.data.user.lastName}`);
        console.log(`   Role: ${data.data.user.role}`);
        console.log(`   Token: ${this.token.substring(0, 20)}...`);
        return true;
      } else {
        console.error(`❌ Login failed:`, data.error);
        return false;
      }
    } catch (error) {
      console.error(`❌ Login error:`, error);
      return false;
    }
  }

  private async makeRequest(endpoint: string, method: string = 'GET', body?: any): Promise<ApiResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      return { ...data, status: response.status };
    } catch (error) {
      console.error(`❌ Request error for ${endpoint}:`, error);
      return { error: 'Request failed' };
    }
  }

  async testCreateInterview(): Promise<string | null> {
    console.log('\n📝 Testing Create Interview (AI-Driven)...');
    
    const interviewData = {
      title: 'AI-Driven Software Engineer Interview',
      type: 'ai-driven',
      scheduledAt: new Date(Date.now() - 60 * 1000).toISOString(), // 1 minute ago
      duration: 45,
      resumeText: `
        JOHN DOE
        Software Engineer
        john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe
        
        SUMMARY
        Experienced software engineer with 5+ years developing web applications using React, Node.js, and Python. Led development of 3 major projects resulting in 40% performance improvement.
        
        EXPERIENCE
        Senior Software Engineer | TechCorp | 2021-Present
        - Developed and maintained React-based web applications
        - Led team of 4 developers on e-commerce platform project
        - Implemented CI/CD pipelines reducing deployment time by 60%
        - Technologies: React, Node.js, TypeScript, AWS, Docker
        
        Software Engineer | StartupXYZ | 2019-2021
        - Built RESTful APIs using Node.js and Express
        - Collaborated with cross-functional teams on mobile app development
        - Reduced API response time by 30% through optimization
        - Technologies: JavaScript, Node.js, MongoDB, Redis
        
        EDUCATION
        Bachelor of Science in Computer Science | University of Technology | 2019
        - GPA: 3.8/4.0
        - Relevant coursework: Data Structures, Algorithms, Database Systems
        
        SKILLS
        Programming: JavaScript, TypeScript, Python, Java
        Frontend: React, Angular, HTML5, CSS3, Bootstrap
        Backend: Node.js, Express, Django, FastAPI
        Database: MongoDB, PostgreSQL, Redis
        DevOps: Docker, AWS, CI/CD, Git
        Tools: VS Code, Postman, Jira, Slack
      `,
      jobRequirement: {
        title: 'Senior Full Stack Developer',
        description: 'We are looking for a Senior Full Stack Developer to join our team and help build scalable web applications. The ideal candidate should have strong experience with modern web technologies and be able to lead development teams.',
        requiredSkills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
        preferredSkills: ['Docker', 'CI/CD', 'Redis', 'Python', 'Angular'],
        experienceLevel: 'senior',
        industry: 'Technology',
        duration: 45,
      },
    };

    const result = await this.makeRequest('/api/interviews', 'POST', interviewData);
    
    if (result.success) {
      console.log('✅ Interview created successfully!');
      console.log(`   Interview ID: ${result.data._id}`);
      console.log(`   Title: ${result.data.title}`);
      console.log(`   Type: ${result.data.type}`);
      console.log(`   Status: ${result.data.status}`);
      return result.data._id;
    } else {
      console.error('❌ Failed to create interview:', result.error);
      return null;
    }
  }

  async testAnalyzeInterview(interviewId: string): Promise<void> {
    console.log('\n🔍 Testing Analyze Interview...');
    
    const analyzeData = {
      resumeText: `
        JOHN DOE
        Software Engineer
        john.doe@email.com
        
        EXPERIENCE
        Senior Software Engineer | TechCorp | 2021-Present
        - Developed React applications
        - Led team of 4 developers
        - 5 years experience
        
        SKILLS
        JavaScript, React, Node.js, MongoDB, AWS
      `,
      jobRequirement: {
        title: 'Senior Full Stack Developer',
        description: 'Looking for experienced developer with React and Node.js skills.',
        requiredSkills: ['React', 'Node.js', 'TypeScript'],
        preferredSkills: ['AWS', 'Docker'],
        experienceLevel: 'senior',
        industry: 'Technology',
        duration: 45,
      },
    };

    const result = await this.makeRequest(`/api/interviews/${interviewId}/analyze`, 'POST', analyzeData);
    
    if (result.success) {
      console.log('✅ Interview analysis completed!');
      console.log(`   Questions generated: ${result.data.analysis?.questions?.length || result.data.interview?.questions?.length || 0}`);
      console.log(`   Resume analyzed: ${result.data.analysis?.resumeAnalysis ? 'Yes' : 'No'}`);
      console.log(`   Interview plan created: ${result.data.analysis?.interviewPlan ? 'Yes' : 'No'}`);
    } else {
      console.error('❌ Failed to analyze interview:', result.error);
    }
  }

  async testStartInterview(interviewId: string): Promise<void> {
    console.log('\n🚀 Testing Start Interview...');
    
    const result = await this.makeRequest(`/api/interviews/${interviewId}/start`, 'POST');
    
    if (result.success) {
      console.log('✅ Interview started successfully!');
      console.log(`   Status: ${result.data.status}`);
    } else {
      console.error('❌ Failed to start interview:', result.error);
    }
  }

  async testSubmitResponse(interviewId: string): Promise<void> {
    console.log('\n💬 Testing Submit Response...');
    
    // First get the interview to find a question ID
    const interviewResult = await this.makeRequest(`/api/interviews/${interviewId}`);
    
    if (!interviewResult.success) {
      console.error('❌ Cannot get interview data:', interviewResult.error);
      return;
    }
    
    console.log(`   Interview questions: ${interviewResult.data?.questions?.length || 0}`);
    
    if (!interviewResult.data?.questions?.length) {
      console.error('❌ Cannot find questions in interview');
      console.log('   Available data keys:', Object.keys(interviewResult.data || {}));
      return;
    }
    
    const firstQuestion = interviewResult.data.questions[0];
    const responseData = {
      questionId: firstQuestion.questionId || firstQuestion._id,
      answer: 'I led a team of 4 developers on an e-commerce platform project. We used React for the frontend and Node.js for the backend. I implemented microservices architecture and achieved a 40% performance improvement. The project was completed on time and under budget.',
      duration: 60,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 60000).toISOString(),
    };

    const result = await this.makeRequest(`/api/interviews/${interviewId}/responses`, 'POST', responseData);
    
    if (result.success) {
      console.log('✅ Response submitted successfully!');
      console.log(`   Score: ${result.data.analysis?.score || 'N/A'}`);
      console.log(`   Feedback: ${result.data.analysis?.feedback?.substring(0, 100)}...`);
    } else {
      console.error('❌ Failed to submit response:', result.error);
    }
  }

  async testEndInterview(interviewId: string): Promise<void> {
    console.log('\n🏁 Testing End Interview...');
    
    const result = await this.makeRequest(`/api/interviews/${interviewId}/end`, 'POST');
    
    if (result.success) {
      console.log('✅ Interview ended successfully!');
      console.log(`   Overall Score: ${result.data.overallScore || 'N/A'}`);
      console.log(`   Summary: ${result.data.summary?.substring(0, 100)}...`);
    } else {
      console.error('❌ Failed to end interview:', result.error);
    }
  }

  async testGetInterviews(): Promise<void> {
    console.log('\n📋 Testing Get Interviews...');
    
    const result = await this.makeRequest('/api/interviews');
    
    if (result.success) {
      console.log('✅ Interviews retrieved successfully!');
      console.log(`   Total interviews: ${result.data?.interviews?.length || 0}`);
      if (result.data?.interviews?.length > 0) {
        const interview = result.data.interviews[0];
        console.log(`   Latest interview: ${interview.title} (${interview.status})`);
      }
    } else {
      console.error('❌ Failed to get interviews:', result.error);
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting API Route Tests...\n');
    
    // Login as candidate
    const loginSuccess = await this.login('candidate@hirenext.com', 'candidate123');
    if (!loginSuccess) {
      console.error('❌ Cannot proceed without authentication');
      return;
    }

    // Test get interviews first
    await this.testGetInterviews();

    // Test create AI-driven interview
    const interviewId = await this.testCreateInterview();
    
    if (interviewId) {
      // Test analyze interview (this creates questions)
      await this.testAnalyzeInterview(interviewId);
      
      // Test start interview (required before submitting responses)
      await this.testStartInterview(interviewId);
      
      // Test submit response (now questions should exist and interview is started)
      await this.testSubmitResponse(interviewId);
      
      // Test end interview
      await this.testEndInterview(interviewId);
    }

    console.log('\n🎉 All API route tests completed!');
  }
}

// Run the tests
async function main() {
  const tester = new ApiTester();
  await tester.runAllTests();
  process.exit(0);
}

main().catch(console.error);
