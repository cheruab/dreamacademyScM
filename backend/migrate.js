// migrate.js
const mongoose = require('mongoose');
require('./models/studentSchemas');
require('./models/studentSchema');

const migrate = async () => {
  try {
    await mongoose.connect('mongodb+srv://cheruab:cheruab123@cluster0.vn7ktrw.mongodb.net');
    
    // 1. Update parent-child references
    await mongoose.model('parent').updateMany(
      {},
      { $rename: { "children": "child" } }
    );
    
    // 2. Clean up student roles
    await mongoose.model('student').updateMany(
      { role: 'Parent' },
      { $set: { role: "Student" } }
    );
    
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    mongoose.disconnect();
  }
};

migrate();