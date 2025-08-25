import '@/lib/env-config';

// Test the complete authentication flow
async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Testing Login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'candidate@hirenext.com',
        password: 'candidate123',
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', {
      success: loginData.success,
      userRole: loginData.data?.user?.role,
      tokenReceived: !!loginData.data?.token,
      tokenLength: loginData.data?.token?.length || 0,
      tokenParts: loginData.data?.token?.split('.').length || 0,
    });

    const token = loginData.data?.token;
    if (!token) {
      throw new Error('No token received from login');
    }

    // Step 2: Test token with interviews API
    console.log('\n2️⃣ Testing Interviews API with token...');
    const interviewsResponse = await fetch('http://localhost:3000/api/interviews', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📊 Interviews API Response:', {
      status: interviewsResponse.status,
      ok: interviewsResponse.ok,
    });

    if (!interviewsResponse.ok) {
      const errorText = await interviewsResponse.text();
      console.log('❌ Error details:', errorText);
    } else {
      const interviewsData = await interviewsResponse.json();
      console.log('✅ Interviews API successful:', {
        success: interviewsData.success,
        interviewCount: interviewsData.data?.interviews?.length || 0,
      });
    }

    // Step 3: Test creating interview
    console.log('\n3️⃣ Testing Create Interview...');
    const createResponse = await fetch('http://localhost:3000/api/interviews', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test AI Interview',
        type: 'ai-driven',
        scheduledAt: new Date(Date.now() - 60000).toISOString(),
        duration: 30,
        questionCount: 5,
        resumeText: 'Test resume content',
        jobRequirement: {
          position: 'Developer',
          company: 'Test Company',
          industry: 'Technology',
          level: 'mid',
          skills: ['JavaScript', 'React'],
          experience: '3+ years',
          description: 'Test job description',
        },
      }),
    });

    console.log('🔨 Create Interview Response:', {
      status: createResponse.status,
      ok: createResponse.ok,
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.log('❌ Create error details:', errorText);
    } else {
      const createData = await createResponse.json();
      console.log('✅ Create interview successful:', {
        success: createData.success,
        interviewId: createData.data?._id,
      });
    }

  } catch (error) {
    console.error('❌ Auth flow test failed:', error);
  }
}

// Run the test
testAuthFlow().then(() => {
  console.log('\n🏁 Auth flow test completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test script error:', error);
  process.exit(1);
});
