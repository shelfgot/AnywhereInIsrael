from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_login import LoginManager
from .config import Config
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from werkzeug.exceptions import HTTPException

db = SQLAlchemy()
login_manager = LoginManager() # Initialize LoginManager

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    from app.routes import main
    app.register_blueprint(main)

    CORS(app)
    db.init_app(app)
    migrate = Migrate(app, db)
    login_manager.init_app(app) # Initialize within create_app
    login_manager.login_view = 'main.login'  #  Set the login view

    @app.errorhandler(Exception)
    def handle_error(e):
        code = 500
        if isinstance(e, HTTPException):
            code = e.code
        return jsonify(error=str(e)), code

    from app.models import User, HostAvailability

    admin = Admin(app, name='Anywhere in Israel', template_mode='bootstrap3')
    admin.add_view(ModelView(User, db.session))
    admin.add_view(ModelView(HostAvailability, db.session))

    return app