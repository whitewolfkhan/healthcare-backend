const { Appointment, Patient, Doctor, User, Medication } = require('../models');
const { Op } = require('sequelize');

exports.getNotifications = async (req, res) => {
  const { role, id: userId } = req.user;
  const notifications = [];
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  try {
    if (role === 'patient') {
      const patient = await Patient.findOne({ where: { userId } });
      if (patient) {
        // Upcoming appointments
        const upcoming = await Appointment.findAll({
          where: { patientId: patient.id, appointmentDate: { [Op.gte]: today }, status: { [Op.in]: ['pending', 'confirmed'] } },
          include: [{ model: Doctor, as: 'doctor', include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }] }],
          order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']],
          limit: 5,
        });
        upcoming.forEach(apt => {
          const isToday = apt.appointmentDate === today;
          const isTomorrow = apt.appointmentDate === tomorrow;
          notifications.push({
            id: `apt-${apt.id}`,
            type: 'appointment',
            title: isToday ? 'Appointment Today' : isTomorrow ? 'Appointment Tomorrow' : 'Upcoming Appointment',
            message: `Dr. ${apt.doctor?.user?.firstName} ${apt.doctor?.user?.lastName} at ${apt.appointmentTime?.slice(0, 5)}`,
            time: apt.appointmentDate,
            urgent: isToday,
            icon: 'calendar',
          });
        });

        // Active medications
        const meds = await Medication.findAll({
          where: { patientId: patient.id, status: 'active' },
          limit: 3,
        });
        if (meds.length > 0) {
          notifications.push({
            id: 'meds-reminder',
            type: 'medication',
            title: `${meds.length} Active Medication${meds.length > 1 ? 's' : ''}`,
            message: meds.map(m => m.name).join(', '),
            time: new Date().toISOString(),
            urgent: false,
            icon: 'pill',
          });
        }

        // Recent completed appointments
        const recent = await Appointment.findAll({
          where: { patientId: patient.id, status: 'completed', appointmentDate: { [Op.gte]: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0] } },
          limit: 2,
        });
        recent.forEach(apt => {
          notifications.push({
            id: `done-${apt.id}`,
            type: 'info',
            title: 'Appointment Completed',
            message: `Your appointment on ${apt.appointmentDate} has been marked complete`,
            time: apt.updatedAt,
            urgent: false,
            icon: 'check',
          });
        });
      }
    } else if (role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId } });
      if (doctor) {
        // Today's appointments
        const todayApts = await Appointment.findAll({
          where: { doctorId: doctor.id, appointmentDate: today, status: { [Op.in]: ['pending', 'confirmed'] } },
          include: [{ model: Patient, as: 'patient', include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }] }],
          order: [['appointmentTime', 'ASC']],
          limit: 8,
        });
        if (todayApts.length > 0) {
          notifications.push({
            id: 'today-schedule',
            type: 'appointment',
            title: `${todayApts.length} Appointment${todayApts.length > 1 ? 's' : ''} Today`,
            message: todayApts.map(a => `${a.patient?.user?.firstName} at ${a.appointmentTime?.slice(0, 5)}`).join(' · '),
            time: new Date().toISOString(),
            urgent: true,
            icon: 'calendar',
          });
        }

        // Pending approvals
        const pending = await Appointment.count({ where: { doctorId: doctor.id, status: 'pending' } });
        if (pending > 0) {
          notifications.push({
            id: 'pending-apts',
            type: 'warning',
            title: `${pending} Pending Appointment Request${pending > 1 ? 's' : ''}`,
            message: 'Patients are waiting for your confirmation',
            time: new Date().toISOString(),
            urgent: pending > 3,
            icon: 'clock',
          });
        }

        // Tomorrow's appointments
        const tomorrowApts = await Appointment.count({
          where: { doctorId: doctor.id, appointmentDate: tomorrow, status: { [Op.in]: ['confirmed', 'pending'] } },
        });
        if (tomorrowApts > 0) {
          notifications.push({
            id: 'tomorrow-apts',
            type: 'info',
            title: `${tomorrowApts} Appointment${tomorrowApts > 1 ? 's' : ''} Tomorrow`,
            message: 'Prepare for tomorrow\'s schedule',
            time: new Date().toISOString(),
            urgent: false,
            icon: 'calendar',
          });
        }
      }
    } else if (role === 'admin') {
      // New users last 24h
      const newUsers = await User.count({ where: { createdAt: { [Op.gte]: new Date(Date.now() - 86400000) } } });
      if (newUsers > 0) {
        notifications.push({
          id: 'new-users',
          type: 'info',
          title: `${newUsers} New Registration${newUsers > 1 ? 's' : ''} Today`,
          message: 'New users joined the platform',
          time: new Date().toISOString(),
          urgent: false,
          icon: 'user',
        });
      }

      // Today's total appointments
      const todayTotal = await Appointment.count({ where: { appointmentDate: today } });
      if (todayTotal > 0) {
        notifications.push({
          id: 'admin-today',
          type: 'appointment',
          title: `${todayTotal} Appointments Today`,
          message: 'Across all departments',
          time: new Date().toISOString(),
          urgent: false,
          icon: 'calendar',
        });
      }

      // Pending appointments across hospital
      const allPending = await Appointment.count({ where: { status: 'pending' } });
      if (allPending > 0) {
        notifications.push({
          id: 'admin-pending',
          type: 'warning',
          title: `${allPending} Pending Appointments`,
          message: 'Awaiting doctor confirmation',
          time: new Date().toISOString(),
          urgent: allPending > 10,
          icon: 'clock',
        });
      }

      notifications.push({
        id: 'system-ok',
        type: 'success',
        title: 'System Status: Normal',
        message: 'All services are running smoothly',
        time: new Date().toISOString(),
        urgent: false,
        icon: 'check',
      });
    }
  } catch {}

  res.json({ success: true, data: notifications, count: notifications.length });
};
