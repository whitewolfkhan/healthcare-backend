const { MedicalImage, Patient, Doctor, User } = require('../models');

const includes = [
  { model: Patient, as: 'patient', include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }] },
  { model: Doctor, as: 'doctor', include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }] },
  { model: User, as: 'uploader', attributes: ['firstName', 'lastName', 'role'] },
];

exports.getMedicalImages = async (req, res) => {
  let where = {};
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    where.patientId = patient?.id;
  } else if (req.user.role === 'doctor') {
    if (req.query.patientId) where.patientId = req.query.patientId;
  }
  if (req.query.imageType) where.imageType = req.query.imageType;

  const images = await MedicalImage.findAll({ where, include: includes, order: [['date', 'DESC']] });
  res.json({ success: true, data: images });
};

exports.uploadMedicalImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const { patientId, title, imageType, bodyPart, description } = req.body;

  let doctorId = null;
  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    doctorId = doctor?.id;
  }

  let resolvedPatientId = patientId;
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    resolvedPatientId = patient?.id;
  }

  const image = await MedicalImage.create({
    patientId: resolvedPatientId,
    doctorId,
    uploadedBy: req.user.id,
    title,
    imageType: imageType || 'other',
    bodyPart,
    date: new Date(),
    fileUrl: `/uploads/medical-images/${req.file.filename}`,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
    description,
  });

  const full = await MedicalImage.findByPk(image.id, { include: includes });
  res.status(201).json({ success: true, message: 'Medical image uploaded', data: full });
};

exports.getMedicalImageById = async (req, res) => {
  const image = await MedicalImage.findByPk(req.params.id, { include: includes });
  if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
  res.json({ success: true, data: image });
};

exports.updateAnnotations = async (req, res) => {
  const image = await MedicalImage.findByPk(req.params.id);
  if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
  const { annotations, findings, radiologistNotes } = req.body;
  await image.update({ annotations, findings, radiologistNotes, isReviewed: true });
  res.json({ success: true, message: 'Annotations saved', data: image });
};

exports.deleteMedicalImage = async (req, res) => {
  const image = await MedicalImage.findByPk(req.params.id);
  if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
  await image.destroy();
  res.json({ success: true, message: 'Image deleted' });
};
