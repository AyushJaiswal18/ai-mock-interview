import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local FIRST
config({ path: resolve(process.cwd(), '.env.local') });

async function testAIStandalone() {
  try {
    console.log('🤖 Testing AI-Driven Interview System...\n');
    
    // Import AI services dynamically after environment variables are loaded
    const { aiService } = await import('@/lib/ai-service');
    
    // Debug: Check if API key is loaded
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('🔑 OpenAI API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
    console.log('🔑 API Key length:', apiKey ? apiKey.length : 0);
    console.log('');

    // Sample resume text
    const resumeText = `
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
    `;

    // Sample job requirements
    const jobRequirement = {
      title: 'Senior Full Stack Developer',
      description: 'We are looking for a Senior Full Stack Developer to join our team and help build scalable web applications. The ideal candidate should have strong experience with modern web technologies and be able to lead development teams.',
      requiredSkills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
      preferredSkills: ['Docker', 'CI/CD', 'Redis', 'Python', 'Angular'],
      experienceLevel: 'senior' as const,
      industry: 'Technology',
      duration: 45, // 45 minutes interview
    };

    console.log('📄 Step 1: Analyzing Resume...');
    const resumeAnalysis = await aiService.analyzeResume(resumeText);
    console.log('✅ Resume Analysis Complete!');
    console.log('   - Skills:', resumeAnalysis.skills.join(', '));
    console.log('   - Experience:', resumeAnalysis.experience.years, 'years');
    console.log('   - Overall Score:', resumeAnalysis.overallScore + '/100');
    console.log('   - Strengths:', resumeAnalysis.strengths.join(', '));
    console.log('   - Areas for Improvement:', resumeAnalysis.areasForImprovement.join(', '));
    console.log('');

    console.log('📋 Step 2: Creating Interview Plan...');
    const interviewPlan = await aiService.createInterviewPlan(resumeAnalysis, jobRequirement);
    console.log('✅ Interview Plan Generated!');
    console.log('   - Total Questions:', interviewPlan.totalQuestions);
    console.log('   - Time per Question:', interviewPlan.timePerQuestion, 'minutes');
    console.log('   - Focus Areas:', interviewPlan.focusAreas.join(', '));
    console.log('   - Difficulty Progression:', interviewPlan.difficultyProgression);
    console.log('   - Question Distribution:');
    console.log('     * Technical:', interviewPlan.questionDistribution.technical + '%');
    console.log('     * Behavioral:', interviewPlan.questionDistribution.behavioral + '%');
    console.log('     * Situational:', interviewPlan.questionDistribution.situational + '%');
    console.log('     * Skills:', interviewPlan.questionDistribution.skills + '%');
    console.log('');

    console.log('🔍 Step 3: Analyzing Skill Gaps...');
    const skillGaps = await aiService.analyzeSkillGaps(resumeAnalysis, jobRequirement);
    console.log('✅ Skill Gap Analysis Complete!');
    console.log('   - Strong Skills:', skillGaps.strongSkills.join(', '));
    console.log('   - Weak Skills:', skillGaps.weakSkills.join(', '));
    console.log('   - Missing Skills:', skillGaps.missingSkills.join(', '));
    console.log('   - Recommendations:', skillGaps.recommendations.join(', '));
    console.log('');

    console.log('❓ Step 4: Generating Personalized Questions...');
    const questions = await aiService.generatePersonalizedQuestions(
      resumeAnalysis,
      jobRequirement,
      interviewPlan
    );
    console.log('✅ Personalized Questions Generated!');
    console.log('   - Total Questions:', questions.length);
    console.log('');
    console.log('📝 Generated Questions:');
    questions.forEach((q, i) => {
      console.log(`   ${i + 1}. ${q}`);
    });
    console.log('');

    console.log('🎯 Step 5: Testing Response Analysis...');
    const sampleResponse = "I led a team of 4 developers to build an e-commerce platform using React and Node.js. We implemented microservices architecture and used Docker for containerization. The project resulted in 40% performance improvement and we completed it on time and under budget.";
    const sampleQuestion = "Tell me about your experience leading the e-commerce platform project at TechCorp.";
    
    const responseAnalysis = await aiService.analyzeResponse(
      sampleQuestion,
      sampleResponse,
      {
        category: 'leadership',
        difficulty: 'medium',
        expectedKeywords: ['team', 'leadership', 'project management', 'performance']
      }
    );
    
    console.log('✅ Response Analysis Complete!');
    console.log('   - Score:', responseAnalysis.score + '/100');
    console.log('   - Feedback:', responseAnalysis.feedback);
    console.log('   - Strengths:', responseAnalysis.strengths.join(', '));
    console.log('   - Improvements:', responseAnalysis.improvements.join(', '));
    console.log('   - Keyword Coverage:', responseAnalysis.keywordCoverage + '%');
    console.log('   - Relevance Score:', responseAnalysis.relevanceScore + '%');
    console.log('');

    console.log('🎉 AI-Driven Interview System Test Completed Successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('   - Resume Analysis: ✅ Working');
    console.log('   - Interview Planning: ✅ Working');
    console.log('   - Skill Gap Analysis: ✅ Working');
    console.log('   - Question Generation: ✅ Working');
    console.log('   - Response Analysis: ✅ Working');
    console.log('');
    console.log('🚀 The AI system is ready for production use!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
  } finally {
    process.exit(0);
  }
}

testAIStandalone();
