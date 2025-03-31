#  app/whatsapp.py
import os
import requests

WHATSAPP_API_URL = "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages"  #  Replace with your API URL
ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")  #  Ensure you have this in your .env

def send_whatsapp_message(phone, message):
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": phone,
        "type": "text",
        "text": {"body": message}
    }
    try:
        response = requests.post(WHATSAPP_API_URL, headers=headers, json=payload)
        response.raise_for_status()  # Raise an exception for bad status codes
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error sending WhatsApp message: {e}")
        return None

def generate_availability_request_message():
    """
    Generates the message to send to hosts for weekly availability.
    """
    return "Are you available to host students this week? If so, how many students can you host? Please reply with 'Yes <number>' or 'No'."

def generate_match_notification_host(num_guests, location):
    """
    Generates the message to notify a host of a new match.
    """
    return f"You have a new student match! {num_guests} guests from {location} are interested in staying with you."

def generate_match_notification_student(location):
    """
    Generates the message to notify a student of a new match.
    """
    return f"You have been matched with a host in {location}!"

def generate_confirmation_reminder():
    """
    Generates a reminder message for hosts and students to confirm.
    """
    return "Please confirm your match within 24 hours."