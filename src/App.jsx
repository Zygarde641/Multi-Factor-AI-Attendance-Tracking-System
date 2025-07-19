import React, { useState } from "react";
import RoleSelection from "./components/RoleSelection";
import StudentLogin from "./components/StudentLogin";
import TeacherDashboard from "./components/TeacherDashboard";

function App() {
  const [role, setRole] = useState("");

  return (
    <div>
      {!role && <RoleSelection setRole={setRole} />}
      {role === "student" && <StudentLogin />}
      {role === "teacher" && <TeacherDashboard />}
    </div>
  );
}

export default App;
