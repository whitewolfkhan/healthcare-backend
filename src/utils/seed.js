require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize, User, Patient, Doctor, Department, Appointment, VitalSign, Medication } = require('../models');

const seedData = async (standalone = false) => {
  try {
    if (standalone) {
      await sequelize.authenticate();
      console.log('Connected to database...');
      await sequelize.sync({ force: true });
      console.log('Database synced. Seeding data...');
    }

    // Departments
    const departments = await Department.bulkCreate([
      { name: 'Cardiology', description: 'Heart and cardiovascular system', icon: 'heart' },
      { name: 'Neurology', description: 'Brain and nervous system', icon: 'brain' },
      { name: 'Orthopedics', description: 'Bones, joints, and muscles', icon: 'bone' },
      { name: 'Pediatrics', description: 'Children and adolescent health', icon: 'baby' },
      { name: 'General Medicine', description: 'Primary care and general health', icon: 'stethoscope' },
      { name: 'Dermatology', description: 'Skin, hair, and nail conditions', icon: 'skin' },
      { name: 'Gynecology', description: 'Women health and reproductive system', icon: 'female' },
      { name: 'Ophthalmology', description: 'Eye care and vision', icon: 'eye' },
      { name: 'ENT (Ear, Nose & Throat)', description: 'Ear, nose, throat disorders', icon: 'ear' },
      { name: 'Urology', description: 'Urinary tract and reproductive health', icon: 'kidney' },
      { name: 'Oncology', description: 'Cancer diagnosis and treatment', icon: 'cancer' },
      { name: 'Psychiatry', description: 'Mental health and disorders', icon: 'brain-mental' },
      { name: 'Endocrinology', description: 'Hormones, diabetes, thyroid', icon: 'hormone' },
      { name: 'Gastroenterology', description: 'Digestive system disorders', icon: 'stomach' },
      { name: 'Pulmonology', description: 'Lung and respiratory diseases', icon: 'lungs' },
      { name: 'Emergency Medicine', description: '24/7 emergency and trauma care', icon: 'emergency' },
    ]);
    console.log(`Created ${departments.length} departments`);

    // Admin user
    const admin = await User.create({
      firstName: 'Super', lastName: 'Admin',
      email: 'admin@healthcare.com', password: 'Admin@1234',
      role: 'admin', phone: '+8801700000001',
      isActive: true, isEmailVerified: true,
    });
    console.log('Admin created:', admin.email);

    // Doctors
    const doctorUsers = await User.bulkCreate([
      { firstName: 'Dr. Rahman', lastName: 'Ahmed', email: 'rahman@healthcare.com', password: 'Doctor@1234', role: 'doctor', phone: '+8801711111111', isEmailVerified: true },
      { firstName: 'Dr. Fatima', lastName: 'Khatun', email: 'fatima@healthcare.com', password: 'Doctor@1234', role: 'doctor', phone: '+8801722222222', isEmailVerified: true },
      { firstName: 'Dr. Karim', lastName: 'Hossain', email: 'karim@healthcare.com', password: 'Doctor@1234', role: 'doctor', phone: '+8801733333333', isEmailVerified: true },
      { firstName: 'Dr. Nasrin', lastName: 'Begum', email: 'nasrin@healthcare.com', password: 'Doctor@1234', role: 'doctor', phone: '+8801744444444', isEmailVerified: true },
    ], { individualHooks: true });

    await Doctor.bulkCreate([
      { userId: doctorUsers[0].id, departmentId: departments[0].id, specialization: 'Cardiologist', licenseNumber: 'BMDC-2024-001', qualifications: ['MBBS', 'FCPS (Cardiology)', 'MD (Heart)'], experience: 15, bio: 'Expert cardiologist with 15 years of experience in Chattagram.', consultationFee: 1500, availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], availableTimeStart: '09:00:00', availableTimeEnd: '17:00:00', rating: 4.8, clinicName: 'Chittagong Medical College Hospital', clinicCity: 'Chattagram' },
      { userId: doctorUsers[1].id, departmentId: departments[4].id, specialization: 'General Physician', licenseNumber: 'BMDC-2024-002', qualifications: ['MBBS', 'FCPS (Medicine)'], experience: 10, bio: 'Experienced general physician serving Chattagram for over a decade.', consultationFee: 800, availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], availableTimeStart: '09:00:00', availableTimeEnd: '17:00:00', rating: 4.6, clinicName: 'Park View Hospital', clinicCity: 'Chattagram' },
      { userId: doctorUsers[2].id, departmentId: departments[1].id, specialization: 'Neurologist', licenseNumber: 'BMDC-2024-003', qualifications: ['MBBS', 'MD (Neurology)'], experience: 12, bio: 'Specialist in neurological disorders.', consultationFee: 1200, availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], availableTimeStart: '09:00:00', availableTimeEnd: '17:00:00', rating: 4.7, clinicName: 'Chevron Clinical', clinicCity: 'Chattagram' },
      { userId: doctorUsers[3].id, departmentId: departments[6].id, specialization: 'Gynecologist', licenseNumber: 'BMDC-2024-004', qualifications: ['MBBS', 'FCPS (Gynecology)'], experience: 8, bio: 'Women health specialist.', consultationFee: 1000, availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], availableTimeStart: '09:00:00', availableTimeEnd: '17:00:00', rating: 4.9, clinicName: 'Max Hospital', clinicCity: 'Chattagram' },
    ]);
    console.log('Created 4 doctors');

    // Patients
    const patientUsers = await User.bulkCreate([
      { firstName: 'Rahim', lastName: 'Uddin', email: 'patient@healthcare.com', password: 'Patient@1234', role: 'patient', phone: '+8801755555555', isEmailVerified: true },
      { firstName: 'Sumaiya', lastName: 'Akter', email: 'sumaiya@healthcare.com', password: 'Patient@1234', role: 'patient', phone: '+8801766666666', isEmailVerified: true },
      { firstName: 'Jamal', lastName: 'Hossain', email: 'jamal@healthcare.com', password: 'Patient@1234', role: 'patient', phone: '+8801777777777', isEmailVerified: true },
    ], { individualHooks: true });

    const patients = await Patient.bulkCreate([
      { userId: patientUsers[0].id, dateOfBirth: '1990-05-15', gender: 'male', bloodGroup: 'B+', address: 'Agrabad, Chattagram', city: 'Chattagram', country: 'Bangladesh', allergies: ['Penicillin'], chronicConditions: ['Hypertension'], height: 172, weight: 70 },
      { userId: patientUsers[1].id, dateOfBirth: '1995-08-22', gender: 'female', bloodGroup: 'A+', address: 'GEC Circle, Chattagram', city: 'Chattagram', country: 'Bangladesh', allergies: [], chronicConditions: [], height: 158, weight: 55 },
      { userId: patientUsers[2].id, dateOfBirth: '1985-12-10', gender: 'male', bloodGroup: 'O+', address: 'Nasirabad, Chattagram', city: 'Chattagram', country: 'Bangladesh', allergies: [], chronicConditions: [], height: 168, weight: 75 },
    ]);
    console.log('Created 3 patients');

    // Appointments
    const doctors = await Doctor.findAll();
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    await Appointment.bulkCreate([
      { patientId: patients[0].id, doctorId: doctors[0].id, appointmentDate: tomorrow, appointmentTime: '10:00:00', duration: 30, type: 'consultation', status: 'confirmed', reason: 'Chest pain and shortness of breath', fee: 1500 },
      { patientId: patients[1].id, doctorId: doctors[1].id, appointmentDate: today, appointmentTime: '14:00:00', duration: 30, type: 'follow-up', status: 'completed', reason: 'Routine checkup', fee: 800 },
      { patientId: patients[2].id, doctorId: doctors[2].id, appointmentDate: today, appointmentTime: '11:00:00', duration: 30, type: 'consultation', status: 'pending', reason: 'Recurring headaches', fee: 1200 },
    ]);

    // Vitals
    await VitalSign.bulkCreate([
      { patientId: patients[0].id, recordedBy: patientUsers[0].id, recordedAt: new Date(), bloodPressureSystolic: 130, bloodPressureDiastolic: 85, heartRate: 78, temperature: 37.0, oxygenSaturation: 98, weight: 70, height: 172, bmi: 23.66, bloodGlucose: 95 },
      { patientId: patients[0].id, recordedBy: patientUsers[0].id, recordedAt: new Date(Date.now() - 7 * 86400000), bloodPressureSystolic: 128, bloodPressureDiastolic: 83, heartRate: 75, temperature: 36.8, oxygenSaturation: 97, weight: 70.5, height: 172, bmi: 23.83, bloodGlucose: 92 },
    ]);

    // Medications
    await Medication.bulkCreate([
      { patientId: patients[0].id, name: 'Amlodipine', dosage: '5mg', frequency: 'once_daily', times: ['08:00'], startDate: today, instructions: 'Take with or without food', purpose: 'Blood pressure control', status: 'active' },
      { patientId: patients[0].id, name: 'Aspirin', dosage: '75mg', frequency: 'once_daily', times: ['20:00'], startDate: today, instructions: 'Take after dinner', purpose: 'Blood thinner', status: 'active' },
    ]);

    console.log('\n✅ Seed completed successfully!');
    console.log('Admin:   admin@healthcare.com    | Admin@1234');
    console.log('Doctor:  rahman@healthcare.com   | Doctor@1234');
    console.log('Patient: patient@healthcare.com  | Patient@1234');

    if (standalone) process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    if (standalone) process.exit(1);
  }
};

// Run standalone if called directly
if (require.main === module) {
  seedData(true);
} else {
  module.exports = seedData;
}
