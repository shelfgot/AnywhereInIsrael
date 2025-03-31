from flask import Blueprint, request, jsonify
from app import db, login_manager, limiter
from app.models import User, HostAvailability, StudentRequest, Match
from app.whatsapp import send_whatsapp_message
from datetime import datetime
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from flask_login import login_user, logout_user, login_required, current_user # Import login functions
from werkzeug.security import generate_password_hash, check_password_hash

main = Blueprint('main', __name__)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))



@main.route('/')
def home():
    return jsonify({'message': 'Welcome to Anywhere in Israel'}), 200

@main.route('/api/register', methods=['POST'])
@limiter.limit("5/minute") # Limit to 5 requests per minute
def register():
    data = request.get_json()
    phone = data.get('phone')
    name = data.get('name')
    role = data.get('role')  # 'student' or 'host'
    password = data.get('password') # Get the password
    confirmPassword = data.get('confirmPassword') # Get the password conf
    print(f"{phone} {name} {role} {password} {confirmPassword}")

    if password != confirmPassword:
        return jsonify({'error': 'Passwords do not match'}), 400
        

    if not all([phone, name, role, password, confirmPassword]):
        return jsonify({'error': 'Missing fields'}), 400

    user = User.query.filter_by(phone=phone).first()
    if user:
        return jsonify({'error': 'User already exists'}), 400

    try:
        new_user = User(name=name, phone=phone, role=role)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        print(f"IntegrityError: {e}")
        return jsonify({'error': 'A user with this phone number already exists'}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"SQLAlchemyError: {e}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        db.session.rollback()
        print(f"An unexpected error occurred: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

    return jsonify({'message': 'User registered successfully'}, 201)

@main.route('/api/login', methods=['POST'])
@limiter.limit("5/minute") # Limit to 5 requests per minute
def login():
    data = request.get_json()
    phone = data.get('phone')
    role = data.get('role')
    password = data.get('password')

    user = User.query.filter_by(phone=phone).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if not user.check_password(password): # Check the password
        return jsonify({'error': 'Invalid credentials'}), 401

    login_user(user) #  Log the user in
    return jsonify({'message': 'Login successful', 'user': {'name': user.name, 'role': role, 'id': user.id}}), 200

@main.route('/api/logout', methods=['POST'])
@login_required #  Protect this route
def logout():
    logout_user()
    return jsonify({'message': 'Logged out'}), 200

@main.route('/api/profile/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    profile = {
        'id': user.id,
        'name': user.name,
        'phone': user.phone,
        'role': user.role,
        'about_me': user.about_me,
        'preferences': user.preferences,
        'location': user.location
    }
    return jsonify(profile), 200

@main.route('/api/profile/<int:user_id>', methods=['PUT'])
def update_user_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    user.name = data.get('name', user.name)
    user.about_me = data.get('about_me', user.about_me)
    user.preferences = data.get('preferences', user.preferences)
    user.location = data.get('location', user.location)

    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'}), 200

@main.route('/api/request', methods=['POST'])
def create_student_request():
    data = request.get_json()
    student_id = data.get('student_id')
    location = data.get('location')
    num_guests = data.get('num_guests')

    if not all([student_id, location, num_guests]):
        return jsonify({'error': 'Missing fields'}), 400

    new_request = StudentRequest(student_id=student_id, location=location, num_guests=num_guests)
    db.session.add(new_request)
    db.session.commit()

    #  Potentially trigger matching here or in a Celery task
    # match_students_with_hosts() 

    return jsonify({'message': 'Request created successfully'}), 201

@main.route('/api/request/<int:request_id>', methods=['GET'])
def get_student_request(request_id):
    request_obj = StudentRequest.query.get(request_id)
    if not request_obj:
        return jsonify({'error': 'Request not found'}), 404

    request_data = {
        'id': request_obj.id,
        'student_id': request_obj.student_id,
        'location': request_obj.location,
        'num_guests': request_obj.num_guests,
        'created_at': request_obj.created_at,
        'status': request_obj.status
    }
    return jsonify(request_data), 200

@main.route('/api/request/student/<int:student_id>', methods=['GET'])
def get_student_requests(student_id):
    requests = StudentRequest.query.filter_by(student_id=student_id).all()
    requests_data = []
    for request_obj in requests:
        requests_data.append({
            'id': request_obj.id,
            'student_id': request_obj.student_id,
            'location': request_obj.location,
            'num_guests': request_obj.num_guests,
            'created_at': request_obj.created_at,
            'status': request_obj.status
        })
    return jsonify(requests_data), 200

@main.route('/api/match/<int:match_id>', methods=['GET'])
def get_match(match_id):
    match = Match.query.get(match_id)
    if not match:
        return jsonify({'error': 'Match not found'}), 404
    
    match_data = {
        'id': match.id,
        'student_request_id': match.student_request_id,
        'host_id': match.host_id,
        'host_confirmed': match.host_confirmed,
        'student_confirmed': match.student_confirmed,
        'created_at': match.created_at
    }
    return jsonify(match_data), 200

@main.route('/api/match/<int:match_id>/confirm/host', methods=['PUT'])
def confirm_match_host(match_id):
    match = Match.query.get(match_id)
    if not match:
        return jsonify({'error': 'Match not found'}), 404

    match.host_confirmed = True
    db.session.commit()
    return jsonify({'message': 'Host confirmed the match'}), 200

@main.route('/api/match/<int:match_id>/confirm/student', methods=['PUT'])
def confirm_match_student(match_id):
    match = Match.query.get(match_id)
    if not match:
        return jsonify({'error': 'Match not found'}), 404

    match.student_confirmed = True
    db.session.commit()
    return jsonify({'message': 'Student confirmed the match'}), 200

@main.route('/api/host/availability', methods=['POST'])
@login_required
def update_availability():
    data = request.get_json()
    host_id = current_user.id
    available = data.get('available')
    capacity = data.get('capacity')

    if not all([isinstance(available, bool), isinstance(capacity, int)]):
        return jsonify({'error': 'Invalid data'}), 400

    availability = HostAvailability.query.filter_by(host_id=host_id).first()
    if not availability:
        availability = HostAvailability(host_id=host_id, available=available, capacity=capacity)
        db.session.add(availability)
    else:
        availability.available = available
        availability.capacity = capacity

    db.session.commit()
    return jsonify({'message': 'Availability updated'}), 200


@main.route('/api/webhook/whatsapp', methods=['POST'])
def whatsapp_webhook():
    data = request.get_json()
    message = data.get('message')
    sender = data.get('phone')

    #  Logic to extract host_id from sender/message is crucial here
    #  This is highly dependent on how your WhatsApp integration works
    #  For example, you might have a mapping of phone numbers to host_ids
    #  Or you might use a keyword in the message.
    #  For now, I'll leave this as a placeholder:
    
    host_id = extract_host_id(sender, message)  
    if not host_id:
        return jsonify({'error': 'Host ID not found'}), 400

    if "yes" in message.lower():
        #  Update HostAvailability
        availability = HostAvailability.query.filter_by(host_id=host_id).first()
        if availability:
            availability.available = True
            #  Extract capacity from the message if provided
            capacity = extract_capacity(message)
            if capacity:
                availability.capacity = capacity
            db.session.commit()
        
        #  Potentially update Match status if a match is pending for this host
        #  (Logic depends on your match workflow)
        response = "Great! You've confirmed hosting."
    elif "no" in message.lower():
        #  Update HostAvailability if needed
        availability = HostAvailability.query.filter_by(host_id=host_id).first()
        if availability:
            availability.available = False
            db.session.commit()
        #  Potentially update Match status if a match is pending
        response = "No problem, we will find another student."
    else:
        response = "Reply with 'Yes' to confirm or 'No' to decline."

    send_whatsapp_message(sender, response)
    return jsonify({'message': 'Response received'}), 200

#  Helper functions (these need to be implemented based on your WhatsApp setup)
def extract_host_id(sender, message):
    #  Implement logic to extract host_id from WhatsApp message
    #  This is a placeholder
    return None

def extract_capacity(message):
    #  Implement logic to extract capacity from WhatsApp message
    #  This is a placeholder
    return None

