// Simple script to test fanbase data structure
const fetch = require('node-fetch');

async function testFanbaseData() {
  try {
    // Call analytics API and check what it logs
    const response = await fetch('https://home-run-records.vercel.app/api/viberate/analytics?artistId=aad79908-8123-4a1d-a9d4-bdaa6a6f2b28');
    const data = await response.json();
    
    console.log('Total followers:', data.totalFollowers);
    console.log('Platforms:', JSON.stringify(data.platforms, null, 2));
    console.log('Is real data:', data.isRealData);
  } catch (error) {
    console.error('Error:', error);
  }
}

testFanbaseData();