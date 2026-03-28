const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LabResult = sequelize.define('LabResult', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Patients', key: 'id' },
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'Doctors', key: 'id' },
    },
    testName: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    testDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    resultDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('blood', 'urine', 'imaging', 'biopsy', 'microbiology', 'chemistry', 'hematology', 'other'),
      defaultValue: 'other',
    },
    results: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of {parameter, value, unit, normalRange, status}',
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    interpretation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'reviewed'),
      defaultValue: 'pending',
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    fileName: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    labName: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    referenceRange: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isAbnormal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    doctorNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  LabResult.associate = (models) => {
    LabResult.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
    LabResult.belongsTo(models.Doctor, { foreignKey: 'doctorId', as: 'doctor' });
  };

  return LabResult;
};
