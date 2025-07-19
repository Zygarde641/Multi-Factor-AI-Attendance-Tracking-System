import React, { useState } from "react";
import axios from "axios";
import StudentDashboard from "./StudentDashboard";
import RegisterStudent from "./RegisterStudent";
import "./StudentLogin.css";

function StudentLogin() {
  const [name, setName] = useState("");
  const [studentExists, setStudentExists] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const checkStudent = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/check-student", { name });

      if (response.data.exists) {
        setStudentExists(true);
      } else {
        setErrorMessage("❌ Student not found! Please register.");
        setShowRegister(true);
      }
    } catch (error) {
      setErrorMessage("⚠️ Error checking student. Try again!");
    }
  };

  return (
    <div className="student-login">
      <div className="login-container">
        {!studentExists && !showRegister ? (
          <div>
            <h1>📚 Student Login</h1>
            <p className="description">Enter your name to continue.</p>

            <div className="form-group">
              <label>👤 Student Name</label>
              <input
                type="text"
                placeholder="Enter Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <button className="login-btn" onClick={checkStudent}>Login</button>

            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        ) : studentExists ? (
          <StudentDashboard studentName={name} />
        ) : (
          <RegisterStudent />
        )}
      </div>
    </div>
  );
}

export default StudentLogin;
