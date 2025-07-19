import React, { useState } from "react";
import axios from "axios";
import "./TeacherDashboard.css";

function TeacherDashboard() {
  const [classId, setClassId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [allowedIp, setAllowedIp] = useState("");
  const [allowedLocation, setAllowedLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      class_id: classId,
      subject_name: subjectName,
      teacher_email: teacherEmail,
      student_email: studentEmail,
      seat_number: seatNumber,
      allowed_ip: allowedIp,
      allowed_location: allowedLocation,
      start_time: startTime,
      end_time: endTime,
    };

    try {
      const response = await axios.post("http://127.0.0.1:5000/assign-seat", data);
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error assigning seat: " + error.response?.data?.error);
    }
  };

  return (
    <div className="teacher-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Teacher Panel</h2>
        <ul>
          <li className="active">📂 Assign Seats</li>
          <li>📊 View Attendance</li>
          <li>⚙️ Settings</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <h1>Assign Seats & Generate QR Codes</h1>
        <p className="description">Fill in the details below to assign seats and generate QR codes.</p>

        <form className="assign-seat-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>📌 Class ID</label>
            <input type="text" placeholder="Class ID" value={classId} onChange={(e) => setClassId(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>📖 Subject Name</label>
            <input type="text" placeholder="Subject Name" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>👨‍🏫 Teacher Email</label>
            <input type="email" placeholder="Teacher Email" value={teacherEmail} onChange={(e) => setTeacherEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>📧 Student Email</label>
            <input type="email" placeholder="Student Email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>🪑 Seat Number</label>
            <input type="text" placeholder="Seat Number" value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>🌍 Allowed IP</label>
            <input type="text" placeholder="Allowed IP" value={allowedIp} onChange={(e) => setAllowedIp(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>📍 Allowed Location</label>
            <input type="text" placeholder="Allowed Location" value={allowedLocation} onChange={(e) => setAllowedLocation(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>⏰ Start Time</label>
            <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>🕒 End Time</label>
            <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>

          <button className="submit-btn" type="submit">Assign Seat</button>
        </form>

        {message && <p className="message">{message}</p>}
      </main>
    </div>
  );
}

export default TeacherDashboard;
