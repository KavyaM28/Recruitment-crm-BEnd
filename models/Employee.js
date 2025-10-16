const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employee_id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: String,
  joining_date: Date,
  leaving_date: Date,
  designation: String,
  department: String,
  education_details: Array,
  experience_details: Array,
  current_ctc: Number,
  salary_breakup: Object,
  status: { type: String, enum: ['Active', 'Left'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
