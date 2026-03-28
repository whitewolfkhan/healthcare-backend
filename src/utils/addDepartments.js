require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize, Department } = require('../models');

const newDepartments = [
  { name: 'ENT (Ear, Nose & Throat)', description: 'Ear, nose, throat disorders', icon: 'ear' },
  { name: 'Urology', description: 'Urinary tract and reproductive health', icon: 'kidney' },
  { name: 'Oncology', description: 'Cancer diagnosis and treatment', icon: 'cancer' },
  { name: 'Psychiatry', description: 'Mental health and disorders', icon: 'brain-mental' },
  { name: 'Endocrinology', description: 'Hormones, diabetes, thyroid', icon: 'hormone' },
  { name: 'Gastroenterology', description: 'Digestive system disorders', icon: 'stomach' },
  { name: 'Pulmonology', description: 'Lung and respiratory diseases', icon: 'lungs' },
  { name: 'Nephrology', description: 'Kidney diseases and treatment', icon: 'kidney2' },
  { name: 'Rheumatology', description: 'Arthritis and autoimmune diseases', icon: 'joints' },
  { name: 'Hematology', description: 'Blood disorders and diseases', icon: 'blood' },
  { name: 'Radiology', description: 'Medical imaging and diagnostics', icon: 'xray' },
  { name: 'Emergency Medicine', description: '24/7 emergency and trauma care', icon: 'emergency' },
];

(async () => {
  try {
    await sequelize.authenticate();
    const existing = await Department.findAll({ attributes: ['name'] });
    const existingNames = existing.map(d => d.name);
    const toAdd = newDepartments.filter(d => !existingNames.includes(d.name));
    if (toAdd.length === 0) {
      console.log('All departments already exist!');
    } else {
      await Department.bulkCreate(toAdd);
      console.log(`Added ${toAdd.length} new departments:`);
      toAdd.forEach(d => console.log(`  + ${d.name}`));
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
