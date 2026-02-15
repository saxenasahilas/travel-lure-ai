import os
from google import genai
from dotenv import load_dotenv
load_dotenv()

# Use GOOGLE_API_KEY env var in production instead of hardcoding
client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

# Upload the file to the Files API (supports up to 2GB).
# The Python SDK has no "file_search_stores"; use the file in generate_content instead.
print("Uploading large PDF...")
sample_file = client.files.upload(file="data/ILPB.pdf")

print(f"Upload complete. File: {sample_file.name}")
print(
    "Use this file in generate_content, e.g.:\n"
    "  response = client.models.generate_content(\n"
    "      model='gemini-2.0-flash',\n"
    f"      contents=['Your prompt about the guide', sample_file]\n"
    "  )"
)