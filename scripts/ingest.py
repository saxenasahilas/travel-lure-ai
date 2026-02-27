import os
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()
load_dotenv(".env.local")

# Use GOOGLE_API_KEY env var
client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

def upload_and_get_uri(path, name):
    print(f"Uploading {name} from {path}...")
    try:
        if not os.path.exists(path):
            print(f"Error: File not found at {path}")
            return None
            
        file_obj = client.files.upload(file=path)
        print(f"Uploaded {name}: {file_obj.name}")
        return file_obj.name
    except Exception as e:
        print(f"Failed to upload {name}: {e}")
        return None

def main():
    manifest = {}
    
    # 1. SmartTravel (Tier 1)
    smart_travel_uri = upload_and_get_uri("data/SmartTravel.md", "SmartTravel")
    if smart_travel_uri:
        manifest["smart_travel_uri"] = smart_travel_uri

    # 2. Lonely Planet (Tier 2)
    lonely_planet_uri = upload_and_get_uri("data/ILPB.pdf", "LonelyPlanet")
    if lonely_planet_uri:
        manifest["lonely_planet_uri"] = lonely_planet_uri
    
    # Save Manifest
    output_path = "src/data/file_manifest.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "w") as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\nManifest saved to {output_path}")
    print(json.dumps(manifest, indent=2))

if __name__ == "__main__":
    main()