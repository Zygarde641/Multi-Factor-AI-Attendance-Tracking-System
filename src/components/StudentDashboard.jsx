import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./StudentDashboard.css";

function StudentDashboard({ studentName }) {
  const [qrCode, setQrCode] = useState("");
  const [message, setMessage] = useState("");
  const [validationStep, setValidationStep] = useState(0); // 0 - QR Scan, 1 - IP Check, 2 - Location, 3 - Countdown, 4 - Camera
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (validationStep === 0) {
      const scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 300, height: 300 }, // ✅ ADJUSTED SIZE
      });

      scanner.render(
        (decodedText) => {
          setQrCode(decodedText);
          scanner.clear();
          setValidationStep(1);
        },
        (errorMessage) => console.error("QR Scan Error:", errorMessage)
      );

      return () => {
        scanner.clear();
      };
    }
  }, [validationStep]);

  useEffect(() => {
    if (validationStep === 1) {
      setTimeout(() => setValidationStep(2), 2000);
    } else if (validationStep === 2) {
      setTimeout(() => setValidationStep(3), 2000);
    } else if (validationStep === 3) {
      setTimeout(() => setValidationStep(4), 2000);
    } else if (validationStep === 4) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    }
  }, [validationStep]);

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video) {
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg");
    }
    return null;
  };

  const verifyAttendance = async () => {
    const capturedImage = captureImage();
    if (!capturedImage) {
      alert("Could not capture image. Please allow camera access.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("qr_code", qrCode);
      formData.append("name", studentName);
      formData.append("image", dataURLtoBlob(capturedImage));

      const response = await axios.post("http://127.0.0.1:5000/verify-attendance", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(response.data.message);
    } catch (error) {
      setMessage("Verification failed.");
    }
  };

  function dataURLtoBlob(dataURL) {
    const byteString = atob(dataURL.split(",")[1]);
    const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-container">
        <h1>🎓 Welcome, {studentName}</h1>

        {validationStep === 0 && (
          <div className="qr-scanner-container">
            <h3>📷 Scan QR Code</h3>
            <div id="reader" className="qr-scanner"></div>
          </div>
        )}

        {validationStep === 1 && <p className="validation-step">✅ Validating IP Address...</p>}
        {validationStep === 2 && <p className="validation-step">✅ Verifying Location...</p>}
        {validationStep === 3 && <p className="validation-step">⏳ Time Remaining: 4 Minutes...</p>}

        {validationStep === 4 && (
          <>
            <h3>📷 Capture Your Face</h3>
            <div className="camera-container">
              <video ref={videoRef} autoPlay className="webcam-feed" />
              <canvas ref={canvasRef} width="300" height="200" style={{ display: "none" }} />
            </div>
            <button className="verify-btn" onClick={verifyAttendance}>Verify Attendance</button>
          </>
        )}

        {message && <p className="verification-message">{message}</p>}
      </div>
    </div>
  );
}

export default StudentDashboard;
