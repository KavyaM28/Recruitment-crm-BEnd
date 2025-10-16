const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Leave'],
    required: true,
  },
  in_time: {
    type: String,
    default: null,
  },
  out_time: {
    type: String,
    default: null,
  },
}, { timestamps: true });

// Prevent duplicate attendance entries for same employee and date
attendanceSchema.index({ employee_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
