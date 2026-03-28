const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MedicalRecord = sequelize.define('MedicalRecord', {
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
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    title: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('diagnosis', 'treatment', 'surgery', 'vaccination', 'allergy', 'chronic', 'other'),
      defaultValue: 'other',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    fileName: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    isConfidential: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  MedicalRecord.associate = (models) => {
    MedicalRecord.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
    MedicalRecord.belongsTo(models.User, { foreignKey: 'uploadedBy', as: 'uploader' });
  };

  return MedicalRecord;
};
