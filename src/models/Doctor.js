const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Doctor = sequelize.define('Doctor', {
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
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'Departments', key: 'id' },
    },
    specialization: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    licenseNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    qualifications: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Years of experience',
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    consultationFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    availableDays: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    availableTimeStart: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: '09:00:00',
    },
    availableTimeEnd: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: '17:00:00',
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    totalPatients: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    clinicName: {
      type: DataTypes.STRING(300),
      allowNull: true,
      comment: 'Hospital or clinic name',
    },
    clinicAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Street address of clinic/hospital',
    },
    clinicCity: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Chattagram',
    },
    clinicPhone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
  });

  Doctor.associate = (models) => {
    Doctor.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Doctor.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
    Doctor.hasMany(models.Appointment, { foreignKey: 'doctorId', as: 'appointments' });
    Doctor.hasMany(models.Prescription, { foreignKey: 'doctorId', as: 'prescriptions' });
    Doctor.hasMany(models.LabResult, { foreignKey: 'doctorId', as: 'labResults' });
    Doctor.hasMany(models.MedicalImage, { foreignKey: 'doctorId', as: 'medicalImages' });
  };

  return Doctor;
};
