from app import db
from app.models import User, StudentRequest, Match, HostAvailability
from app.whatsapp import send_whatsapp_message

def match_students_with_hosts():
    """
    Matches students with available hosts based on location and capacity.
    """
    matches = []

    # Get all pending student requests
    student_requests = StudentRequest.query.filter_by(status='pending').all()

    for request in student_requests:
        # Find available hosts in the requested location
        available_hosts = User.query.filter_by(
            role='host',
            location=request.location
        ).join(HostAvailability).filter(
            HostAvailability.available == True,
            HostAvailability.capacity >= request.num_guests
        ).all()

        if available_hosts:
            #  In a real application, you might have more sophisticated matching logic
            #  For example, considering host preferences, student about_me, etc.
            host = available_hosts[0]  #  For simplicity, take the first available host

            #  Create a new match
            match = Match(
                student_request_id=request.id,
                host_id=host.id
            )
            db.session.add(match)
            db.session.commit()

            #  Update the student request status
            request.status = 'matched'
            db.session.commit()

            #  Send WhatsApp messages to host and student
            send_whatsapp_message(
                host.phone,
                f"You have a new student match! {request.num_guests} guests from {request.location}."
            )
            send_whatsapp_message(
                User.query.get(request.student_id).phone,
                f"You have been matched with a host in {request.location}!"
            )

            matches.append({
                'student': User.query.get(request.student_id).name,
                'host': host.name,
                'host_phone': host.phone
            })

    return matches