const { createComprehensiveTestScenario } = require('./src/lib/comprehensive-test-data.ts');

// Run the test data creation
createComprehensiveTestScenario()
  .then(result => {
    console.log('Test data creation result:', result);
    if (result.success) {
      console.log('\n🎉 SUCCESS! Test data created successfully.');
      console.log(result.message);
      if (result.details) {
        console.log('\nDetails:', JSON.stringify(result.details, null, 2));
      }
    } else {
      console.error('\n❌ FAILED to create test data:', result.message);
    }
  })
  .catch(error => {
    console.error('Error running test data creation:', error);
  });