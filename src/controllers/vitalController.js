const { VitalSign, Patient, User } = require('../models');
const { Op } = require('sequelize');

exports.getVitals = async (req, res) => {
  let patientId;
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    patientId = patient?.id;
  } else {
    patientId = req.query.patientId;
  }
  if (!patientId) return res.status(400).json({ success: false, message: 'Patient not found' });

  const where = { patientId };
  if (req.query.startDate || req.query.endDate) {
    where.recordedAt = {};
    if (req.query.startDate) where.recordedAt[Op.gte] = new Date(req.query.startDate);
    if (req.query.endDate) where.recordedAt[Op.lte] = new Date(req.query.endDate);
  }

  const limit = parseInt(req.query.limit) || 30;
  const vitals = await VitalSign.findAll({
    where,
    include: [{ model: User, as: 'recorder', attributes: ['firstName', 'lastName', 'role'] }],
    order: [['recordedAt', 'DESC']],
    limit,
  });

  res.json({ success: true, data: vitals });
};

exports.createVital = async (req, res) => {
  let patientId;
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    patientId = patient?.id;
  } else {
    patientId = req.body.patientId;
  }
  if (!patientId) return res.status(400).json({ success: false, message: 'Patient ID required' });

  const { bloodPressureSystolic, bloodPressureDiastolic, heartRate, temperature,
    respiratoryRate, oxygenSaturation, weight, height, bloodGlucose, notes, recordedAt } = req.body;

  let bmi = null;
  if (weight && height) {
    const heightM = height / 100;
    bmi = parseFloat((weight / (heightM * heightM)).toFixed(2));
  }

  const isAbnormal = (
    (bloodPressureSystolic && (bloodPressureSystolic > 140 || bloodPressureSystolic < 90)) ||
    (heartRate && (heartRate > 100 || heartRate < 60)) ||
    (temperature && (temperature > 37.5 || temperature < 36)) ||
    (oxygenSaturation && oxygenSaturation < 95) ||
    (bloodGlucose && (bloodGlucose > 180 || bloodGlucose < 70))
  );

  const vital = await VitalSign.create({
    patientId, recordedBy: req.user.id,
    bloodPressureSystolic, bloodPressureDiastolic, heartRate, temperature,
    respiratoryRate, oxygenSaturation, weight, height, bmi, bloodGlucose, notes,
    recordedAt: recordedAt || new Date(),
    isAbnormal: !!isAbnormal,
  });

  res.status(201).json({ success: true, message: 'Vital signs recorded', data: vital });
};

exports.getVitalTrends = async (req, res) => {
  let patientId;
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    patientId = patient?.id;
  } else {
    patientId = req.query.patientId;
  }

  const days = parseInt(req.query.days) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const vitals = await VitalSign.findAll({
    where: { patientId, recordedAt: { [Op.gte]: startDate } },
    order: [['recordedAt', 'ASC']],
    attributes: ['recordedAt', 'bloodPressureSystolic', 'bloodPressureDiastolic', 'heartRate', 'temperature', 'oxygenSaturation', 'weight', 'bmi', 'bloodGlucose'],
  });

  res.json({ success: true, data: vitals });
};

exports.deleteVital = async (req, res) => {
  const vital = await VitalSign.findByPk(req.params.id);
  if (!vital) return res.status(404).json({ success: false, message: 'Vital record not found' });
  await vital.destroy();
  res.json({ success: true, message: 'Vital record deleted' });
};
