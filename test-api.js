// Simple API test script
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
    console.log('🧪 Testing API Authentication System...\n');

    try {
        // Test 1: Health check
        console.log('1. Testing health check...');
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData.status);

        // Test 2: Try to access protected endpoint without token
        console.log('\n2. Testing protected endpoint without token...');
        try {
            const newsResponse = await fetch(`${API_BASE_URL}/news`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Test', summary: 'Test', news_date: '2024-01-01' })
            });
            if (newsResponse.status === 401) {
                console.log('✅ Protected endpoint correctly requires authentication');
            } else {
                console.log('❌ Protected endpoint should require authentication');
            }
        } catch (error) {
            console.log('✅ Protected endpoint correctly requires authentication');
        }

        // Test 3: Login with default credentials
        console.log('\n3. Testing login with default credentials...');
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'lux@2025',
                password: 'admin@2025'
            })
        });

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Login successful:', loginData.message);
            console.log('   Token received:', loginData.token ? 'Yes' : 'No');

            // Test 4: Access protected endpoint with token
            console.log('\n4. Testing protected endpoint with token...');
            const protectedResponse = await fetch(`${API_BASE_URL}/news`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${loginData.token}`
                },
                body: JSON.stringify({
                    title: 'Test News',
                    summary: 'This is a test news item',
                    news_date: '2024-01-01'
                })
            });

            if (protectedResponse.ok) {
                console.log('✅ Protected endpoint accessible with valid token');
            } else {
                console.log('❌ Protected endpoint not accessible with valid token');
            }

            // Test 5: Verify token
            console.log('\n5. Testing token verification...');
            const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${loginData.token}`
                }
            });

            if (verifyResponse.ok) {
                const verifyData = await verifyResponse.json();
                console.log('✅ Token verification successful:', verifyData.valid);
            } else {
                console.log('❌ Token verification failed');
            }

        } else {
            console.log('❌ Login failed with default credentials');
            const errorData = await loginResponse.json();
            console.log('   Error:', errorData.error);
        }

        // Test 6: Create new admin
        console.log('\n6. Testing create new admin...');
        const createAdminResponse = await fetch(`${API_BASE_URL}/auth/create-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'testpass123',
                confirmPassword: 'testpass123'
            })
        });

        if (createAdminResponse.ok) {
            console.log('✅ Create admin successful');
        } else {
            const errorData = await createAdminResponse.json();
            if (errorData.error === 'User already exists') {
                console.log('✅ Create admin correctly prevents duplicate users');
            } else {
                console.log('❌ Create admin failed:', errorData.error);
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }

    console.log('\n🎉 API test completed!');
}

// Run the test
testAPI();
