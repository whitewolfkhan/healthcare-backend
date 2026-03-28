const { Medication, Patient, User } = require('../models');

exports.getMedications = async (req, res) => {
  const patient = await Patient.findOne({ where: { userId: req.user.id } });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

  const where = { patientId: patient.id };
  if (req.query.status) where.status = req.query.status;

  const medications = await Medication.findAll({ where, order: [['createdAt', 'DESC']] });
  res.json({ success: true, data: medications });
};

exports.createMedication = async (req, res) => {
  const patient = await Patient.findOne({ where: { userId: req.user.id } });
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

  const { name, dosage, frequency, times, startDate, endDate, instructions, purpose, prescriptionId, quantity } = req.body;

  const medication = await Medication.create({
    patientId: patient.id, name, dosage, frequency, times, startDate, endDate,
    instructions, purpose, prescriptionId, quantity, remainingQuantity: quantity,
  });

  res.status(201).json({ success: true, message: 'Medication added', data: medication });
};

exports.getMedicationById = async (req, res) => {
  const medication = await Medication.findByPk(req.params.id);
  if (!medication) return res.status(404).json({ success: false, message: 'Medication not found' });
  res.json({ success: true, data: medication });
};

exports.updateMedication = async (req, res) => {
  const medication = await Medication.findByPk(req.params.id);
  if (!medication) return res.status(404).json({ success: false, message: 'Medication not found' });

  const { name, dosage, frequency, times, startDate, endDate, instructions, status, remindersEnabled, refillDate, remainingQuantity } = req.body;
  await medication.update({ name, dosage, frequency, times, startDate, endDate, instructions, status, remindersEnabled, refillDate, remainingQuantity });
  res.json({ success: true, message: 'Medication updated', data: medication });
};

exports.logAdherence = async (req, res) => {
  const medication = await Medication.findByPk(req.params.id);
  if (!medication) return res.status(404).json({ success: false, message: 'Medication not found' });

  const { date, taken, notes } = req.body;
  const adherence = [...medication.adherence, { date, taken, notes, timestamp: new Date() }];
  await medication.update({ adherence });
  res.json({ success: true, message: 'Adherence logged', data: medication });
};

exports.deleteMedication = async (req, res) => {
  const medication = await Medication.findByPk(req.params.id);
  if (!medication) return res.status(404).json({ success: false, message: 'Medication not found' });
  await medication.destroy();
  res.json({ success: true, message: 'Medication deleted' });
};
