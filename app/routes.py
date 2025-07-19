import os
import numpy as np
import cv2
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from keras_facenet import FaceNet
from app.database import supabase_client
from scipy.spatial.distance import cosine
import qrcode
import requests
from datetime import datetime

api_routes = Blueprint("api_routes", __name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ✅ Initialize FaceNet embedder
embedder = FaceNet()

def preprocess_image(image_path):
    """ Load and preprocess the image for face recognition """
    img = cv2.imread(image_path)
    if img is None:
        return None
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Convert to RGB
    return img

def verify_student(uploaded_image_path):
    """ Compare uploaded face with stored embeddings in database """
    uploaded_img = preprocess_image(uploaded_image_path)
    detections = embedder.extract(uploaded_img, threshold=0.95)

    if len(detections) == 0:
        return {"error": "Face not detected"}

    uploaded_embedding = detections[0]["embedding"]

    # Retrieve all registered students from Supabase
    students = supabase_client.table("students").select("name, face_embedding").execute()

    min_distance = 1.0  # Higher value means less similarity
    matched_student = None

    for student in students.data:
        stored_embedding = np.array(student["face_embedding"])  # Convert stored JSON embedding to NumPy
        distance = cosine(stored_embedding, uploaded_embedding)  # Compute similarity

        if distance < min_distance:  # Find best match
            min_distance = distance
            matched_student = student["name"]

    if matched_student and min_distance < 0.5:  # Threshold tuning (Lower = stricter)
        return {"matched": True, "name": matched_student}
    else:
        return {"matched": False, "error": "Face not recognized"}

@api_routes.route("/register", methods=["POST"])
def register_student():
    try:
        name = request.form["name"]
        email = request.form["email"]
        image = request.files["image"]

        # ✅ Step 1: Save Image
        filename = secure_filename(image.filename)
        image_path = os.path.join(UPLOAD_FOLDER, filename)
        image.save(image_path)

        # ✅ Step 2: Preprocess and Extract Face Embeddings
        img = preprocess_image(image_path)
        detections = embedder.extract(img, threshold=0.95)

        if len(detections) == 0:
            return jsonify({"error": "No face detected in the image"}), 400

        face_embedding = detections[0]["embedding"].tolist()  # Extract face encoding

        # ✅ Step 3: Upload Image to Supabase Storage
        with open(image_path, "rb") as f:
            res = supabase_client.storage.from_("student_images").upload(f"images/{filename}", f, {"content-type": "image/jpeg"})

        image_url = f"https://your-supabase-url.storage.supabase.co/storage/v1/object/public/student_images/images/{filename}"

        # ✅ Step 4: Store Student Data in Supabase
        student_data = {
            "name": name,
            "email": email,
            "face_embedding": face_embedding,
            "image_url": image_url
        }
        supabase_client.table("students").insert(student_data).execute()

        return jsonify({"message": "Student registered successfully!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@api_routes.route("/generate-qr/<seat_id>", methods=["GET"])
def generate_qr(seat_id):
    qr = qrcode.make(f"seat-{seat_id}")
    qr_path = os.path.join(UPLOAD_FOLDER, f"qr_{seat_id}.png")
    qr.save(qr_path)

    return jsonify({"message": f"QR Code generated for seat {seat_id}!", "qr_image": qr_path})


@api_routes.route("/assign-seat", methods=["POST"])
def assign_seat():
    try:
        data = request.json
        class_id = data["class_id"]
        subject_name = data["subject_name"]
        teacher_email = data["teacher_email"]
        student_email = data["student_email"]
        seat_number = data["seat_number"]
        allowed_ip = data["allowed_ip"]
        allowed_location = data["allowed_location"]
        start_time = data["start_time"]
        end_time = data["end_time"]

        # Generate QR Code (Unique)
        qr_data = f"{class_id}-{seat_number}-{student_email}"
        qr = qrcode.make(qr_data)
        qr_path = os.path.join(UPLOAD_FOLDER, f"qr_{class_id}_{seat_number}.png")
        qr.save(qr_path)

        # Store Seat Assignment in Supabase
        seat_data = {
            "class_id": class_id,
            "subject_name": subject_name,
            "teacher_email": teacher_email,
            "student_email": student_email,
            "seat_number": seat_number,
            "qr_code": qr_data,
            "allowed_ip": allowed_ip,
            "allowed_location": allowed_location,
            "start_time": start_time,
            "end_time": end_time
        }
        supabase_client.table("class_seats").insert(seat_data).execute()

        return jsonify({"message": f"Seat {seat_number} assigned to {student_email}!", "qr_image": qr_path})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_routes.route("/verify-attendance", methods=["POST"])
def verify_attendance():
    try:
        print("DEBUG: Incoming Request Data:")
        print(f"Headers: {request.headers}")
        print(f"Form Data: {request.form}")
        print(f"Files: {request.files}")

        if "qr_code" not in request.form or "image" not in request.files or "name" not in request.form:
            print("DEBUG ERROR: Missing required form fields")
            return jsonify({"error": "Invalid request. Missing fields."}), 400

        qr_code = request.form["qr_code"]
        student_name = request.form["name"]
        image = request.files["image"]

        print(f"DEBUG: Received QR Code -> {qr_code}")
        print(f"DEBUG: Received Student Name -> {student_name}")

        # ✅ Check if Student Exists
        student_info = supabase_client.table("students").select("*").eq("name", student_name).execute()
        if not student_info.data:
            print("DEBUG ERROR: Student not found in database")
            return jsonify({"error": "Student not found"}), 400

        # ✅ Fetch Seat Details Using QR Code
        seat_info = supabase_client.table("class_seats").select("*").eq("qr_code", qr_code).execute()
        if not seat_info.data:
            print("DEBUG ERROR: QR Code Not Found in Database")
            return jsonify({"error": "Invalid QR Code"}), 400

        # ✅ Face Recognition (Check if Image is Valid)
        if image.filename == "":
            print("DEBUG ERROR: No image uploaded")
            return jsonify({"error": "No image uploaded"}), 400

        print("DEBUG: Image Successfully Received")

        return jsonify({
            "message": f"Attendance Verified for {student_name}!",
        })

    except Exception as e:
        print(f"DEBUG ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500

    
@api_routes.route("/check-student", methods=["POST"])
def check_student():
    try:
        data = request.json
        name = data["name"]

        student_info = supabase_client.table("students").select("*").eq("name", name).execute()

        if student_info.data:
            return jsonify({"exists": True})
        else:
            return jsonify({"exists": False})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@api_routes.route("/get-attendance", methods=["GET"])
def get_attendance():
    try:
        # ✅ Fetch all attendance records from Supabase
        attendance_records = supabase_client.table("attendance").select("*").execute()

        if not attendance_records.data:
            return jsonify({"message": "No attendance records found."}), 200

        return jsonify(attendance_records.data), 200

    except Exception as e:
        print(f"DEBUG ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500

