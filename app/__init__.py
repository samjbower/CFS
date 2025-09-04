from flask import Flask
from pathlib import Path

# Resolve project root: .../your-project/
BASE_DIR = Path(__file__).resolve().parent.parent

def create_app():
    app = Flask(
        __name__,
        static_folder=str(BASE_DIR / "static"),
        template_folder=str(BASE_DIR / "templates"),
    )

    # Dev-friendly reloading
    app.config.update(
        TEMPLATES_AUTO_RELOAD=True,
        SEND_FILE_MAX_AGE_DEFAULT=0,
    )

    from .routes import bp as pages_bp
    from .api import bp as api_bp
    app.register_blueprint(pages_bp)
    app.register_blueprint(api_bp, url_prefix="/api")
    return app
