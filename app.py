import os
import sys
import json
import datetime

from deepgram import Deepgram
from django.conf import settings
from django.core.wsgi import get_wsgi_application
from django.http import JsonResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.urls import path
from django.utils.crypto import get_random_string
from dotenv import load_dotenv
from whitenoise import WhiteNoise

load_dotenv()

settings.configure(
    ALLOWED_HOSTS=["localhost"],
    DEBUG=(os.environ.get("DEBUG", "") == "1"),
    ROOT_URLCONF=__name__,
    SECRET_KEY=get_random_string(40),
    MIDDLEWARE=[
        "whitenoise.middleware.WhiteNoiseMiddleware",
    ],
    STATIC_URL="/",
    STATIC_ROOT="static/",
    STATICFILES_STORAGE="whitenoise.storage.CompressedManifestStaticFilesStorage",
    TEMPLATES=[
        {
            "BACKEND": "django.template.backends.django.DjangoTemplates",
            "DIRS": ["static"],
        },
    ],
)

deepgram = Deepgram(os.environ.get("DEEPGRAM_API_KEY"))

# Create results directory if it doesn't exist
RESULTS_DIR = "results"
if not os.path.exists(RESULTS_DIR):
    os.makedirs(RESULTS_DIR)


async def transcribe(request):
    if request.method == "POST":
        form = request.POST
        files = request.FILES

        url = form.get("url")
        features = form.get("features")
        model = form.get("model")
        version = form.get("version")
        tier = form.get("tier")

        dgFeatures = json.loads(features)
        dgRequest = None

        try:
            if url and url.startswith("https://res.cloudinary.com/deepgram"):
                dgRequest = {"url": url}

            if "file" in files:
                file = files["file"]
                dgRequest = {"mimetype": file.content_type, "buffer": file.read()}

            dgFeatures["model"] = model

            if version:
                dgFeatures["version"] = version

            # Handle different model types properly
            if model == "whisper-cloud":
                dgFeatures["tier"] = tier if tier else "base"
            elif model == "whisper":
                dgFeatures["tier"] = tier
            elif model == "general":
                dgFeatures["tier"] = tier if tier else "nova-2"

            if not dgRequest:
                raise Exception(
                    "Error: You need to choose a file to transcribe your own audio."
                )

            transcription = await deepgram.transcription.prerecorded(
                dgRequest, dgFeatures
            )

            # Save JSON results automatically
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"transcript_{timestamp}.json"
            filepath = os.path.join(RESULTS_DIR, filename)
            
            with open(filepath, 'w') as f:
                json.dump(transcription, f, indent=2)

            return JsonResponse(
                {
                    "model": model,
                    "version": version,
                    "tier": tier,
                    "dgFeatures": dgFeatures,
                    "transcription": transcription,
                    "saved_file": filename,
                }
            )
        except Exception as error:
            return json_abort(str(error))
    else:
        return HttpResponseBadRequest("Invalid HTTP method")


def json_abort(message):
    return HttpResponseBadRequest(json.dumps({"err": str(message)}))


def index(request):
    return render(request, "index.html")


urlpatterns = [
    path("", index),
    path("api", transcribe, name="transcribe"),
]

app = get_wsgi_application()
app = WhiteNoise(app, root="static/", prefix="/")

if __name__ == "__main__":
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
