const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Patient = sequelize.define('Patient', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true,
    },
    bloodGroup: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Chattagram',
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Bangladesh',
    },
    emergencyContact: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    emergencyContactName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    allergies: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    chronicConditions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    currentMedications: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    insuranceProvider: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    insuranceNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    height: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Height in cm',
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Weight in kg',
    },
    occupation: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  Patient.associate = (models) => {
    Patient.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Patient.hasMany(models.Appointment, { foreignKey: 'patientId', as: 'appointments' });
    Patient.hasMany(models.MedicalRecord, { foreignKey: 'patientId', as: 'medicalRecords' });
    Patient.hasMany(models.LabResult, { foreignKey: 'patientId', as: 'labResults' });
    Patient.hasMany(models.MedicalImage, { foreignKey: 'patientId', as: 'medicalImages' });
    Patient.hasMany(models.Medication, { foreignKey: 'patientId', as: 'medications' });
    Patient.hasMany(models.VitalSign, { foreignKey: 'patientId', as: 'vitalSigns' });
    Patient.hasMany(models.Prescription, { foreignKey: 'patientId', as: 'prescriptions' });
  };

  return Patient;
};
