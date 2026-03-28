const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Medication = sequelize.define('Medication', {
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
    prescriptionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'Prescriptions', key: 'id' },
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    dosage: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    frequency: {
      type: DataTypes.ENUM('once_daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'every_6_hours', 'every_8_hours', 'as_needed', 'weekly', 'monthly'),
      allowNull: false,
    },
    times: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Times to take medication e.g. ["08:00", "20:00"]',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    purpose: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    sideEffects: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'discontinued'),
      defaultValue: 'active',
    },
    adherence: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of {date, taken, notes}',
    },
    remindersEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    refillDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    remainingQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });

  Medication.associate = (models) => {
    Medication.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
    Medication.belongsTo(models.Prescription, { foreignKey: 'prescriptionId', as: 'prescription' });
  };

  return Medication;
};
