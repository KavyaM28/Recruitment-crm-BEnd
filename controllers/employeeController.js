const Employee = require('../models/Employee');
const ExcelJS = require('exceljs');

// ➕ Create Employee (with duplicate email check)
exports.createEmployee = async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await Employee.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// 📋 Get All Employees + Search + Filter
exports.getEmployees = async (req, res) => {
  try {
    const { department, status, search } = req.query;
    const query = {};

    if (department) query.department = department;
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };

    const employees = await Employee.find(query);
    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 🔍 Get Employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update Employee
exports.updateEmployee = async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await Employee.findOne({ email, _id: { $ne: req.params.id } });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    res.status(200).json(employee);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// 🗑️ Delete Employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 📤 Export Employees to Excel
exports.exportEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employees');

    worksheet.columns = [
      { header: 'Employee ID', key: 'employee_id', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Department', key: 'department', width: 15 },
      { header: 'Designation', key: 'designation', width: 20 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Joining Date', key: 'joining_date', width: 15 },
      { header: 'Current CTC', key: 'current_ctc', width: 15 },
    ];

    employees.forEach(emp => worksheet.addRow(emp));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
