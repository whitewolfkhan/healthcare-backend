const sequelize = require('../config/database');
const User = require('./User')(sequelize);
const Patient = require('./Patient')(sequelize);
const Doctor = require('./Doctor')(sequelize);
const Department = require('./Department')(sequelize);
const Appointment = require('./Appointment')(sequelize);
const Prescription = require('./Prescription')(sequelize);
const MedicalRecord = require('./MedicalRecord')(sequelize);
const LabResult = require('./LabResult')(sequelize);
const MedicalImage = require('./MedicalImage')(sequelize);
const Medication = require('./Medication')(sequelize);
const VitalSign = require('./VitalSign')(sequelize);

const models = {
  User,
  Patient,
  Doctor,
  Department,
  Appointment,
  Prescription,
  MedicalRecord,
  LabResult,
  MedicalImage,
  Medication,
  VitalSign,
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = { ...models, sequelize };
