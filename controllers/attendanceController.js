const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const fs = require('fs');
const csv = require('csv-parser'); // For CSV parsing
const moment = require('moment'); // For date handling

// ✅ Create single attendance entry
exports.createAttendance = async (req, res) => {
  try {
    const { employee_id, date, status, in_time, out_time } = req.body;

    // Check if employee exists
    const employee = await Employee.findById(employee_id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Validate date: skip weekends
    const day = moment(date).day(); // 0 = Sunday, 6 = Saturday
    if (day === 0 || day === 6) return res.status(400).json({ message: 'Cannot mark attendance on weekend' });

    // Create attendance
    const attendance = await Attendance.create({ employee_id, date, status, in_time, out_time });
    res.status(201).json(attendance);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) return res.status(400).json({ message: 'Attendance already exists for this employee and date' });
    res.status(400).json({ message: error.message });
  }
};

// ✅ Get all attendance records with optional filters
exports.getAttendance = async (req, res) => {
  try {
    const { employee_id, startDate, endDate, status } = req.query;
    const query = {};

    if (employee_id) query.employee_id = employee_id;
    if (status) query.status = status;
    if (startDate || endDate) query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);

    const attendance = await Attendance.find(query).populate('employee_id', 'name email department');
    res.status(200).json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAttendanceById = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id).populate('employee_id', 'name email department');
        if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });
        res.status(200).json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// ✅ Update attendance
exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });
    res.status(200).json(attendance);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Delete attendance
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });
    res.status(200).json({ message: 'Attendance deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Bulk CSV upload
exports.uploadAttendanceCSV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'CSV file is required' });

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        const saved = [];

        for (const row of results) {
          const { employee_id, date, status, in_time, out_time } = row;

          // Skip weekends
          const day = moment(date).day();
          if (day === 0 || day === 6) continue;

          // Check if employee exists
          const employee = await Employee.findById(employee_id);
          if (!employee) continue;

          try {
            const att = await Attendance.create({ employee_id, date, status, in_time, out_time });
            saved.push(att);
          } catch (err) {
            // Skip duplicates
            if (err.code !== 11000) console.error(err);
          }
        }

        // Delete CSV after processing
        fs.unlinkSync(req.file.path);
        res.status(200).json({ message: 'CSV uploaded', count: saved.length, saved });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
