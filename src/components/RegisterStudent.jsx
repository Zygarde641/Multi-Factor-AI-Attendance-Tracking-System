import React from "react";
import "./RoleSelection.css"; // Import CSS file

function RoleSelection({ setRole }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>AI Attendance System</h1>
        <p>Select your role to continue</p>
      </div>

      <div className="dashboard-content">
        {/* Student Card */}
        <div className="role-card student-card" onClick={() => setRole("student")}>
          <img src="https://img.icons8.com/clouds/100/000000/student-male.png" alt="Student Icon" />
          <h2>Student Dashboard</h2>
          <p>Access your classes and mark attendance</p>
        </div>

        {/* Teacher Card */}
        <div className="role-card teacher-card" onClick={() => setRole("teacher")}>
          <img src="https://img.icons8.com/clouds/100/000000/teacher.png" alt="Teacher Icon" />
          <h2>Teacher Dashboard</h2>
          <p>Manage attendance and monitor students</p>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;
