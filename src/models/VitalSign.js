const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VitalSign = sequelize.define('VitalSign', {
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
    recordedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'Users', key: 'id' },
    },
    recordedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    bloodPressureSystolic: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'mmHg',
    },
    bloodPressureDiastolic: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'mmHg',
    },
    heartRate: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'bpm',
    },
    temperature: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true,
      comment: 'Celsius',
    },
    respiratoryRate: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'breaths per minute',
    },
    oxygenSaturation: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true,
      comment: 'SpO2 %',
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'kg',
    },
    height: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'cm',
    },
    bmi: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
    },
    bloodGlucose: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'mg/dL',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isAbnormal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  VitalSign.associate = (models) => {
    VitalSign.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
    VitalSign.belongsTo(models.User, { foreignKey: 'recordedBy', as: 'recorder' });
  };

  return VitalSign;
};
