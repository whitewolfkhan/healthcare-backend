const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Department = sequelize.define('Department', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    headDoctorId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });

  Department.associate = (models) => {
    Department.hasMany(models.Doctor, { foreignKey: 'departmentId', as: 'doctors' });
  };

  return Department;
};
