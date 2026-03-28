const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Prescription = sequelize.define('Prescription', {
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
      allowNull: false,
      references: { model: 'Doctors', key: 'id' },
    },
    appointmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'Appointments', key: 'id' },
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    medications: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of {name, dosage, frequency, duration, instructions}',
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    nextVisitDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'cancelled'),
      defaultValue: 'active',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  Prescription.associate = (models) => {
    Prescription.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
    Prescription.belongsTo(models.Doctor, { foreignKey: 'doctorId', as: 'doctor' });
    Prescription.belongsTo(models.Appointment, { foreignKey: 'appointmentId', as: 'appointment' });
  };

  return Prescription;
};
