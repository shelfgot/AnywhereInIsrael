from celery import Celery
from app.matching import match_students_with_hosts
from app.whatsapp import send_whatsapp_message, generate_availability_request_message
from app.models import User, Match
from datetime import datetime, timedelta
from app import create_app  # Import create_app to have app context

celery = Celery('tasks', broker='redis://localhost:6379/0')

#  Get the Flask app instance by calling the factory function
flask_app = create_app()

#  Configure Celery to use the Flask app's context
celery.conf.update(
    broker_url=flask_app.config['CELERY_BROKER_URL'],
    result_backend=flask_app.config['CELERY_RESULT_BACKEND'],
)

def get_app_context():
    """
    Pushes an application context manually.
    Necessary for Celery tasks to access Flask resources.
    """
    ctx = flask_app.app_context()
    ctx.push()
    return ctx

@celery.task
def send_weekly_availability_requests():
    """
    Sends weekly availability requests to all hosts.
    """
    with get_app_context():
        hosts = User.query.filter_by(role='host').all()
        for host in hosts:
            message = generate_availability_request_message()
            send_whatsapp_message(host.phone, message)

@celery.task
def check_for_expired_confirmations():
    """
    Checks for matches that have not been confirmed within 24 hours
    and takes appropriate action (e.g., cancel the match, notify admins).
    """
    with get_app_context():
        #  Calculate the time 24 hours ago
        cutoff_time = datetime.utcnow() - timedelta(hours=24)

        #  Find matches created before the cutoff time that are not confirmed
        expired_matches = Match.query.filter(
            Match.created_at < cutoff_time,
            (Match.host_confirmed == False) | (Match.student_confirmed == False)
        ).all()

        for match in expired_matches:
            #  Logic to handle expired matches:
            #  -  Potentially set the match status to "expired" or "cancelled"
            #  -  Potentially notify the student and host that the match has expired
            #  -  Potentially re-queue the student request for matching
            #  For this example, I'll just print a message:
            print(f"Match {match.id} has expired.")
            #  Example of updating match status (if you have a status field):
            #  match.status = 'expired'
            #  db.session.commit()

@celery.task
def run_matching():
    """
    Runs the matching algorithm.
    """
    with get_app_context():
        matches = match_students_with_hosts()
        for match in matches:
            send_whatsapp_message(match['host_phone'], f"New match: {match['student']} wants to stay with you.")