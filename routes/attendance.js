const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  uploadAttendanceCSV: uploadAttendanceCSVController
} = require('../controllers/attendanceController');  // ✅ renamed

// Multer setup for CSV uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Routes
router.post('/', createAttendance);                 // Create attendance
router.get('/', getAttendance);                     // Get all attendance
router.get('/:id', getAttendanceById);             // Get attendance by ID
router.put('/:id', updateAttendance);              // Update attendance
router.delete('/:id', deleteAttendance);           // Delete attendance
router.post('/upload', upload.single('file'), uploadAttendanceCSVController);  // ✅ use controller function

module.exports = router;
