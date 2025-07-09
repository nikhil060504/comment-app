require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.test') });
console.log('JWT_SECRET in test:', process.env.JWT_SECRET);

// ... existing code ... 