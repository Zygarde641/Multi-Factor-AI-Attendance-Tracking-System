import React from "react";
import "./RoleSelection.css";

function RoleSelection({ setRole }) {
  return (
    <div className="container">
      <div className="content">
        <h1 className="title">AI Attendance System</h1>
        <p className="subtitle">Choose your role to continue</p>

        <div className="cards">
          {/* Student Card */}
          <div className="card student" onClick={() => setRole("student")}>
            <img src="https://img.icons8.com/clouds/100/student-male.png" alt="Student Icon" />
            <h2>Student Dashboard</h2>
            <p>Access your classes and mark attendance</p>
          </div>

          {/* Teacher Card (Fixed Image URL) */}
          <div className="card teacher" onClick={() => setRole("teacher")}>
          <img src="https://img.icons8.com/clouds/100/classroom.png" alt="Teacher Icon" />
            <h2>Teacher Dashboard</h2>
            <p>Manage attendance and monitor students</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;
