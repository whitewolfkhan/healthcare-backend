require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { sequelize, User, Patient, Doctor, Department, Appointment, Prescription, LabResult, VitalSign, Medication } = require('../models');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database...');
    await sequelize.sync({ force: true });
    console.log('Database synced. Seeding data...');

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
      { userId: doctorUsers[0].id, departmentId: departments[0].id, specialization: 'Cardiologist', licenseNumber: 'BMDC-2024-001', experience: 15, consultationFee: 1500, qualifications: ['MBBS', 'FCPS (Cardiology)', 'MD (Heart)'], bio: 'Expert cardiologist with 15 years of experience in Chattagram.', rating: 4.8 },
      { userId: doctorUsers[1].id, departmentId: departments[4].id, specialization: 'General Physician', licenseNumber: 'BMDC-2024-002', experience: 10, consultationFee: 800, qualifications: ['MBBS', 'FCPS (Medicine)'], bio: 'Experienced general physician serving Chattagram for over a decade.', rating: 4.6 },
      { userId: doctorUsers[2].id, departmentId: departments[1].id, specialization: 'Neurologist', licenseNumber: 'BMDC-2024-003', experience: 12, consultationFee: 1200, qualifications: ['MBBS', 'MD (Neurology)'], bio: 'Specialist in neurological disorders.', rating: 4.7 },
      { userId: doctorUsers[3].id, departmentId: departments[6].id, specialization: 'Gynecologist', licenseNumber: 'BMDC-2024-004', experience: 8, consultationFee: 1000, qualifications: ['MBBS', 'FCPS (Gynecology)'], bio: 'Women health specialist.', rating: 4.9 },
    ]);
    console.log(`Created ${doctorUsers.length} doctors`);

    // Patients
    const patientUsers = await User.bulkCreate([
      { firstName: 'Mohammad', lastName: 'Ali', email: 'patient@healthcare.com', password: 'Patient@1234', role: 'patient', phone: '+8801755555555', isEmailVerified: true },
      { firstName: 'Ayesha', lastName: 'Siddiqui', email: 'ayesha@healthcare.com', password: 'Patient@1234', role: 'patient', phone: '+8801766666666', isEmailVerified: true },
      { firstName: 'Rahim', lastName: 'Chowdhury', email: 'rahim@healthcare.com', password: 'Patient@1234', role: 'patient', phone: '+8801777777777', isEmailVerified: true },
    ], { individualHooks: true });

    const patients = await Patient.bulkCreate([
      { userId: patientUsers[0].id, dateOfBirth: '1990-05-15', gender: 'male', bloodGroup: 'B+', address: 'Agrabad, Chattagram', city: 'Chattagram', country: 'Bangladesh', height: 172, weight: 70, allergies: ['Penicillin'], chronicConditions: ['Hypertension'] },
      { userId: patientUsers[1].id, dateOfBirth: '1995-08-22', gender: 'female', bloodGroup: 'A+', address: 'GEC Circle, Chattagram', city: 'Chattagram', country: 'Bangladesh', height: 158, weight: 55 },
      { userId: patientUsers[2].id, dateOfBirth: '1985-12-10', gender: 'male', bloodGroup: 'O+', address: 'Nasirabad, Chattagram', city: 'Chattagram', country: 'Bangladesh', height: 168, weight: 75 },
    ]);
    console.log(`Created ${patientUsers.length} patients`);

    const doctors = await Doctor.findAll();

    // Appointments
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

    await Appointment.bulkCreate([
      { patientId: patients[0].id, doctorId: doctors[0].id, appointmentDate: tomorrow.toISOString().split('T')[0], appointmentTime: '10:00:00', type: 'consultation', status: 'confirmed', reason: 'Chest pain and shortness of breath', fee: 1500 },
      { patientId: patients[1].id, doctorId: doctors[1].id, appointmentDate: today.toISOString().split('T')[0], appointmentTime: '14:00:00', type: 'follow-up', status: 'completed', reason: 'Routine checkup', fee: 800 },
      { patientId: patients[2].id, doctorId: doctors[2].id, appointmentDate: yesterday.toISOString().split('T')[0], appointmentTime: '11:00:00', type: 'consultation', status: 'completed', reason: 'Recurring headaches', fee: 1200 },
    ]);

    // Vital signs
    await VitalSign.bulkCreate([
      { patientId: patients[0].id, recordedBy: patientUsers[0].id, bloodPressureSystolic: 130, bloodPressureDiastolic: 85, heartRate: 78, temperature: 37.0, oxygenSaturation: 98, weight: 70, height: 172, bmi: 23.66, bloodGlucose: 95, recordedAt: new Date() },
      { patientId: patients[0].id, recordedBy: patientUsers[0].id, bloodPressureSystolic: 128, bloodPressureDiastolic: 83, heartRate: 75, temperature: 36.8, oxygenSaturation: 97, weight: 70.5, height: 172, bmi: 23.83, bloodGlucose: 92, recordedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    ]);

    // Medications
    await Medication.bulkCreate([
      { patientId: patients[0].id, name: 'Amlodipine', dosage: '5mg', frequency: 'once_daily', times: ['08:00'], startDate: new Date().toISOString().split('T')[0], instructions: 'Take with or without food', purpose: 'Blood pressure control', status: 'active' },
      { patientId: patients[0].id, name: 'Aspirin', dosage: '75mg', frequency: 'once_daily', times: ['20:00'], startDate: new Date().toISOString().split('T')[0], instructions: 'Take after dinner', purpose: 'Blood thinner', status: 'active' },
    ]);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin:   admin@healthcare.com    | Admin@1234');
    console.log('Doctor:  rahman@healthcare.com   | Doctor@1234');
    console.log('Patient: patient@healthcare.com  | Patient@1234');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedData();
