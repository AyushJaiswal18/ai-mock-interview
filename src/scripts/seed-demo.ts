import 'dotenv/config';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';

import { User } from '@/lib/models/user';
import { JobOpening } from '@/lib/models/jobOpening';
import { Interview } from '@/lib/models/interview';
import { ROLES } from '@/lib/constants';

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: path.resolve(process.cwd(), '.env.local') });

// Fallback to dev secret if not provided
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Verify required environment variables
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

console.log('🔧 Environment loaded:');
console.log('MONGODB_URI:', MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', JWT_SECRET ? '✅ Set' : '❌ Missing');

// Job opening templates for different roles
const JOB_OPENINGS = [
  {
    title: 'Frontend Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    seniority: 'mid',
    team: 'Frontend Team',
    industry: 'SaaS',
    description: 'Build modern, responsive web applications using React, TypeScript, and Next.js. Collaborate with designers and backend engineers to create exceptional user experiences.',
    requirements: ['React', 'TypeScript', 'Next.js', 'CSS/SCSS', 'Git', 'REST APIs'],
    niceToHave: ['Tailwind CSS', 'GraphQL', 'Testing (Jest/RTL)', 'CI/CD', 'Performance optimization'],
    primaryStack: ['React', 'TypeScript', 'Next.js'],
    keywords: ['Frontend', 'React', 'TypeScript', 'UI/UX', 'Web Development'],
    tags: ['frontend', 'react', 'typescript'],
  },
  {
    title: 'Backend Engineer',
    company: 'DataFlow Inc',
    location: 'New York, NY',
    locationType: 'remote',
    employmentType: 'full-time',
    seniority: 'senior',
    team: 'Backend Services',
    industry: 'FinTech',
    description: 'Design and implement scalable backend services using Node.js and Python. Work on high-performance APIs, database optimization, and microservices architecture.',
    requirements: ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
    niceToHave: ['GraphQL', 'Kubernetes', 'Event-driven architecture', 'Security best practices', 'Performance monitoring'],
    primaryStack: ['Node.js', 'Python', 'PostgreSQL'],
    keywords: ['Backend', 'API', 'Database', 'Microservices', 'Scalability'],
    tags: ['backend', 'nodejs', 'python'],
  },
  {
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'Austin, TX',
    locationType: 'onsite',
    employmentType: 'full-time',
    seniority: 'mid',
    team: 'Product Engineering',
    industry: 'E-commerce',
    description: 'Develop end-to-end features for our e-commerce platform. Work on both frontend and backend, from user interface to database design and API development.',
    requirements: ['JavaScript/TypeScript', 'React', 'Node.js', 'MongoDB', 'Express.js', 'Git'],
    niceToHave: ['Vue.js', 'GraphQL', 'Docker', 'AWS', 'Payment processing', 'Analytics'],
    primaryStack: ['React', 'Node.js', 'MongoDB'],
    keywords: ['Full Stack', 'E-commerce', 'JavaScript', 'MERN Stack'],
    tags: ['fullstack', 'mern', 'ecommerce'],
  },
  {
    title: 'DevOps Engineer',
    company: 'CloudScale',
    location: 'Seattle, WA',
    locationType: 'hybrid',
    employmentType: 'full-time',
    seniority: 'senior',
    team: 'Platform Engineering',
    industry: 'Cloud Services',
    description: 'Build and maintain our cloud infrastructure, CI/CD pipelines, and deployment automation. Ensure high availability and security of our production systems.',
    requirements: ['AWS/Azure/GCP', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'Bash/Python'],
    niceToHave: ['Jenkins/GitLab CI', 'Prometheus/Grafana', 'Security compliance', 'Database administration', 'Network security'],
    primaryStack: ['AWS', 'Docker', 'Kubernetes'],
    keywords: ['DevOps', 'Cloud', 'Infrastructure', 'CI/CD', 'Automation'],
    tags: ['devops', 'cloud', 'kubernetes'],
  },
  {
    title: 'Mobile Developer (React Native)',
    company: 'AppWorks',
    location: 'Los Angeles, CA',
    locationType: 'remote',
    employmentType: 'full-time',
    seniority: 'mid',
    team: 'Mobile Team',
    industry: 'Healthcare',
    description: 'Develop cross-platform mobile applications using React Native. Focus on creating intuitive healthcare apps that improve patient experience and outcomes.',
    requirements: ['React Native', 'JavaScript/TypeScript', 'Redux', 'REST APIs', 'Git', 'Mobile UI/UX'],
    niceToHave: ['Firebase', 'Push notifications', 'Offline functionality', 'Biometric authentication', 'HIPAA compliance'],
    primaryStack: ['React Native', 'TypeScript', 'Redux'],
    keywords: ['Mobile', 'React Native', 'Healthcare', 'Cross-platform'],
    tags: ['mobile', 'react-native', 'healthcare'],
  },
  {
    title: 'Data Scientist',
    company: 'AnalyticsPro',
    location: 'Boston, MA',
    locationType: 'onsite',
    employmentType: 'full-time',
    seniority: 'senior',
    team: 'Data Science',
    industry: 'AI/ML',
    description: 'Develop machine learning models and data-driven insights to drive business decisions. Work with large datasets and implement predictive analytics solutions.',
    requirements: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'SQL', 'Statistics'],
    niceToHave: ['TensorFlow/PyTorch', 'Deep Learning', 'Big Data (Spark)', 'MLOps', 'Data visualization', 'A/B testing'],
    primaryStack: ['Python', 'Pandas', 'Scikit-learn'],
    keywords: ['Data Science', 'Machine Learning', 'Python', 'Analytics'],
    tags: ['data-science', 'python', 'ml'],
  },
  {
    title: 'UI/UX Designer',
    company: 'DesignHub',
    location: 'Portland, OR',
    locationType: 'hybrid',
    employmentType: 'full-time',
    seniority: 'mid',
    team: 'Design Team',
    industry: 'Creative Agency',
    description: 'Create beautiful, intuitive user interfaces and experiences. Conduct user research, create wireframes, and collaborate with developers to bring designs to life.',
    requirements: ['Figma/Sketch', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'User Testing'],
    niceToHave: ['Adobe Creative Suite', 'HTML/CSS', 'Animation', 'Accessibility', 'Brand design', 'Illustration'],
    primaryStack: ['Figma', 'User Research', 'Prototyping'],
    keywords: ['UI/UX', 'Design', 'User Research', 'Prototyping'],
    tags: ['design', 'ui-ux', 'figma'],
  },
  {
    title: 'Product Manager',
    company: 'ProductFirst',
    location: 'Chicago, IL',
    locationType: 'remote',
    employmentType: 'full-time',
    seniority: 'senior',
    team: 'Product Management',
    industry: 'B2B SaaS',
    description: 'Lead product strategy and development for our B2B SaaS platform. Work with cross-functional teams to define product roadmap and deliver customer value.',
    requirements: ['Product Strategy', 'User Research', 'Agile/Scrum', 'Data Analysis', 'Stakeholder Management', 'Market Research'],
    niceToHave: ['SQL', 'A/B Testing', 'Customer Success', 'Technical background', 'Go-to-market strategy'],
    primaryStack: ['Product Strategy', 'User Research', 'Data Analysis'],
    keywords: ['Product Management', 'Strategy', 'B2B', 'SaaS'],
    tags: ['product', 'strategy', 'b2b'],
  }
];

async function main() {
  try {
    // Connect directly to MongoDB using the environment variable
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log('✅ Connected to MongoDB');
    
    // 1) Upsert recruiter
    const recruiterEmail = 'recruiter.demo@mock.ai';
    const recruiterPwd = 'demo-recruiter';
    const recruiterHash = await bcrypt.hash(recruiterPwd, 10);

    const recruiter = await User.findOneAndUpdate(
      { email: recruiterEmail },
      {
        email: recruiterEmail,
        password: recruiterHash,
        firstName: 'Rhea',
        lastName: 'Recruiter',
        role: ROLES.RECRUITER,
        isActive: true,
        metadata: { profileComplete: true },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 2) Upsert multiple candidates
    const candidates = [
      {
        email: 'candidate.demo@mock.ai',
        password: 'demo-candidate',
        firstName: 'Carl',
        lastName: 'Candidate',
      },
      {
        email: 'sarah.dev@mock.ai',
        password: 'demo-sarah',
        firstName: 'Sarah',
        lastName: 'Developer',
      },
      {
        email: 'mike.engineer@mock.ai',
        password: 'demo-mike',
        firstName: 'Mike',
        lastName: 'Engineer',
      },
      {
        email: 'lisa.designer@mock.ai',
        password: 'demo-lisa',
        firstName: 'Lisa',
        lastName: 'Designer',
      }
    ];

    const createdCandidates: any[] = [];
    for (const candidateData of candidates) {
      const candidateHash = await bcrypt.hash(candidateData.password, 10);
      const candidate = await User.findOneAndUpdate(
        { email: candidateData.email },
        {
          email: candidateData.email,
          password: candidateHash,
          firstName: candidateData.firstName,
          lastName: candidateData.lastName,
          role: ROLES.CANDIDATE,
          isActive: true,
          metadata: { profileComplete: true },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      createdCandidates.push(candidate);
    }

    // 3) Create multiple job openings
    const createdJobs: any[] = [];
    for (const jobData of JOB_OPENINGS) {
      const job = await JobOpening.create({
        recruiterId: recruiter._id,
        ...jobData,
        status: 'open',
        visibility: 'private',
      });
      createdJobs.push(job);
      console.log(`✅ Created job: ${job.title} at ${job.company}`);
    }

    // 4) Create interviews for each job opening
    const createdInterviews = [];
    const interviewTypes = ['mock', 'practice', 'ai-driven'];
    const difficulties = ['easy', 'medium', 'hard'];
    
    for (let i = 0; i < createdJobs.length; i++) {
      const job = createdJobs[i];
      const candidate = createdCandidates[i % createdCandidates.length];
      const interviewType = interviewTypes[i % interviewTypes.length];
      const difficulty = difficulties[i % difficulties.length];
      
      // Schedule interviews at different times
      const scheduledAt = new Date(Date.now() + (i + 1) * 30 * 60 * 1000); // +30min, +1hr, +1.5hr, etc.
      
      const interview = await Interview.create({
        candidateId: candidate._id,
        recruiterId: recruiter._id,
        jobOpeningId: job._id,
        title: `${job.title} Interview`,
        type: interviewType,
        status: 'scheduled',
        scheduledAt: scheduledAt,
        duration: 45,
        config: {
          difficulty: difficulty,
          category: job.title,
          industry: job.industry,
          questionCount: 6,
          allowRetakes: true,
          aiMode: 'structured',
        },
        questions: [],
        responses: [],
        media: {},
        metadata: {
          totalQuestions: 0,
          completedQuestions: 0,
          sessionId: undefined,
          flow: {
            stage: 'intro',
            turn: 0,
            currentQuestion: '',
            currentRubric: '',
            scores: [],
          },
        },
      });
      
      createdInterviews.push(interview);
      console.log(`✅ Scheduled interview: ${interview.title} for ${candidate.firstName} ${candidate.lastName}`);
    }

    // 5) Generate JWT tokens for all users
    const recruiterToken = jwt.sign(
      { userId: String(recruiter._id), email: recruiter.email, role: recruiter.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const candidateTokens = createdCandidates.map(candidate => 
      jwt.sign(
        { userId: String(candidate._id), email: candidate.email, role: candidate.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      )
    );

    const host = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    console.log('\n🎉 Seed complete!');
    console.log(`\n📊 Created:`);
    console.log(`- 1 Recruiter`);
    console.log(`- ${createdCandidates.length} Candidates`);
    console.log(`- ${createdJobs.length} Job Openings`);
    console.log(`- ${createdInterviews.length} Scheduled Interviews`);

    console.log('\n🔑 Recruiter Token:');
    console.log(recruiterToken);

    console.log('\n👥 Candidate Tokens:');
    createdCandidates.forEach((candidate, index) => {
      console.log(`${candidate.firstName} ${candidate.lastName}: ${candidateTokens[index]}`);
    });

    console.log('\n💼 Job Openings:');
    createdJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} at ${job.company} (${job.location})`);
    });

    console.log('\n📅 Scheduled Interviews:');
    createdInterviews.forEach((interview, index) => {
      const candidate = createdCandidates[index % createdCandidates.length];
      const job = createdJobs[index];
      console.log(`${index + 1}. ${interview.title} - ${candidate.firstName} ${candidate.lastName} (${interview.scheduledAt.toLocaleString()})`);
    });

    console.log('\n🌐 Quick Links:');
    console.log(`Recruiter Dashboard: ${host}/admin/dashboard`);
    console.log(`Candidate Dashboard: ${host}/candidate/dashboard`);
    
    // Show first interview details for testing
    if (createdInterviews.length > 0) {
      const firstInterview = createdInterviews[0];
      const firstCandidate = createdCandidates[0];
      const firstJob = createdJobs[0];
      
      console.log('\n🧪 Test First Interview:');
      console.log(`Live Interview: ${host}/candidate/interview/${firstInterview._id}/live`);
      console.log(`Candidate: ${firstCandidate.firstName} ${firstCandidate.lastName} (${firstCandidate.email})`);
      console.log(`Job: ${firstJob.title} at ${firstJob.company}`);
      console.log(`Token: ${candidateTokens[0]}`);
    }
    
    // Close mongoose (important for one-off scripts)
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('Seed error:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

main();
