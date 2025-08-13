const fs = require('fs');
const path = require('path');

// Read the Laylo CSV file
const csvPath = '/Users/juangarcia/Downloads/Mary Sarah Fan Data 8_12_25 - Sheet1 (1).csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse first few lines to verify structure
const lines = csvContent.split('\n').slice(0, 10);
console.log('First 10 lines of CSV:');
lines.forEach((line, index) => {
  console.log(`Line ${index}: ${line}`);
});

// Count total records
const allLines = csvContent.split('\n').filter(line => line.trim());
console.log(`\nTotal records (including header): ${allLines.length}`);

// Analyze the data
const headers = allLines[0].split(',');
console.log('\nHeaders:', headers);

// Sample data transformation for import
console.log('\nSample transformed record for import:');
const sampleLine = allLines[2]; // Get a sample data line
const values = sampleLine.split(',');
const transformedRecord = {
  record_type: 'imported_fans',
  contact_name: values[1] || '',
  contact_email: values[2] || '',
  phone: values[3] || '',
  city: values[5] || '',
  state: values[6] || '',
  country: values[7] || '',
  engagement_level: 'imported',
  source: 'laylo',
  joined_on: values[8] || '',
  rsvp_frequency: values[9] || '0',
  presaved: values[10] || 'FALSE'
};

console.log(JSON.stringify(transformedRecord, null, 2));