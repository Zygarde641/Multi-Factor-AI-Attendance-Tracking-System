import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import "./FaceScan.css";

function FaceScan({ onStopScanning }) {
  const webcamRef = useRef(null);
  const [capturing, setCapturing] = useState(true);

  const handleStopScanning = () => {
    setCapturing(false);
    onStopScanning();
  };

  return (
    <div className="face-scan-container">
      <h2>🔍 Face Verification</h2>
      <p className="scan-description">Position your face inside the frame to verify your identity.</p>

      <div className="webcam-container">
        {capturing && <Webcam ref={webcamRef} className="webcam-feed" />}
      </div>

      <button className="stop-scan-btn" onClick={handleStopScanning}>
        Stop Scanning
      </button>
    </div>
  );
}

export default FaceScan;
