const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MedicalImage = sequelize.define('MedicalImage', {
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
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    title: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    imageType: {
      type: DataTypes.ENUM('xray', 'mri', 'ct', 'ultrasound', 'ecg', 'other'),
      defaultValue: 'other',
    },
    bodyPart: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    findings: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    annotations: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Doctor annotations on the image',
    },
    radiologistNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isReviewed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  MedicalImage.associate = (models) => {
    MedicalImage.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
    MedicalImage.belongsTo(models.Doctor, { foreignKey: 'doctorId', as: 'doctor' });
    MedicalImage.belongsTo(models.User, { foreignKey: 'uploadedBy', as: 'uploader' });
  };

  return MedicalImage;
};
