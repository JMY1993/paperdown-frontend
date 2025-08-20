// Simple test script to verify the frontend page loads correctly
fetch('/license-security-test.html')
  .then(response => {
    if (response.ok) {
      console.log('✅ Frontend security test page loaded successfully');
      return response.text();
    } else {
      throw new Error(`Failed to load page: ${response.status}`);
    }
  })
  .then(html => {
    console.log('📄 Page content length:', html.length);
    console.log('🔍 Contains security test elements:', html.includes('License Security Test'));
    console.log('🔍 Contains challenge transformer:', html.includes('ChallengeTransformer'));
  })
  .catch(error => {
    console.error('❌ Error loading frontend page:', error);
  });

// Test the API endpoint
fetch('/api/v1/license/validate-secure', {
  method: 'OPTIONS'
})
  .then(response => {
    console.log('🌐 API endpoint accessible:', response.ok);
    if (response.headers.has('access-control-allow-methods')) {
      console.log('🔓 CORS configured:', response.headers.get('access-control-allow-methods'));
    }
  })
  .catch(error => {
    console.error('❌ Error accessing API endpoint:', error);
  });