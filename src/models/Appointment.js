const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Appointment = sequelize.define('Appointment', {
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
    appointmentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    appointmentTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      comment: 'Duration in minutes',
    },
    type: {
      type: DataTypes.ENUM('consultation', 'follow-up', 'emergency', 'telemedicine', 'lab', 'imaging'),
      defaultValue: 'consultation',
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no-show'),
      defaultValue: 'pending',
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    symptoms: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    followUpDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    cancelReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    videoCallLink: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  });

  Appointment.associate = (models) => {
    Appointment.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
    Appointment.belongsTo(models.Doctor, { foreignKey: 'doctorId', as: 'doctor' });
    Appointment.hasOne(models.Prescription, { foreignKey: 'appointmentId', as: 'prescription' });
  };

  return Appointment;
};
