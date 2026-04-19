import smtplib
from email.message import EmailMessage
from shared.config import settings

def send_otp_email(to_email: str, otp: str):
    msg = EmailMessage()
    msg['Subject'] = 'Your Chat App Verification Code'
    msg['From'] = settings.sender_email
    msg['To'] = to_email

    html_content = f"""
    <html>
      <body>
        <h2>Welcome to Chat App!</h2>
        <p>Your OTP verification code is: <strong>{otp}</strong></p>
        <p>This code will expire in 5 minutes.</p>
      </body>
    </html>
    """
    msg.set_content("Please enable HTML to view this message.")
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
            print(f"OTP sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
