from app import db
from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15), unique=True, nullable=False)
    role = db.Column(db.String(10), nullable=False)  # 'student' or 'host'
    password_hash = db.Column(db.String(128)) # Add password hash
    about_me = db.Column(db.Text)
    preferences = db.Column(db.Text)
    location = db.Column(db.String(255))

    def __repr__(self):
        return f'<User {self.name}>'
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class HostAvailability(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    host_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    available = db.Column(db.Boolean, default=False)
    capacity = db.Column(db.Integer, default=0)
    week_start = db.Column(db.Date, default=datetime.utcnow)

class StudentRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    num_guests = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')  # e.g., 'pending', 'matched', 'confirmed', 'cancelled'

    def __repr__(self):
        return f'<StudentRequest {self.id}>'

class Match(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_request_id = db.Column(db.Integer, db.ForeignKey('student_request.id'), nullable=False)
    host_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    host_confirmed = db.Column(db.Boolean, default=False)
    student_confirmed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Match {self.id}>'