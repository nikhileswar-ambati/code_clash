import os
import requests
from dotenv import load_dotenv

dotenv_path='.env'
load_dotenv(dotenv_path)

# API Keys (Set these as environment variables)
API_KEY=os.getenv("GOOGLE_API_KEY")
CSE_ID=os.getenv("CSE_ID")
YOUTUBE_API_KEY=os.getenv("YOUTUBE_API_KEY")
gemini_api_key = os.getenv("gemini_api_key")

# Function to perform Google Search with SafeSearch enabled
def google_search(query,num_results=6):
    url="https://www.googleapis.com/customsearch/v1"
    params={
        "key":API_KEY,
        "cx":CSE_ID,
        "q":query,
        "num":num_results,
        "safe":"high"  
    }
    
    try:
        response=requests.get(url,params=params)
        response.raise_for_status()
        data=response.json()
        return [{"title":item["title"],"link":item["link"]} for item in data.get("items",[])]
    except requests.exceptions.RequestException as e:
        print(f"Google Search Error: {e}")
        return []

# Function to fetch YouTube videos with SafeSearch enabled
def fetch_youtube_videos(topic,max_results=6):
    if not YOUTUBE_API_KEY:
        return {"error":"YouTube API key is missing"}
    
    url="https://www.googleapis.com/youtube/v3/search"
    params={
        "part":"snippet",
        "q":topic,
        "key":YOUTUBE_API_KEY,
        "maxResults":max_results,
        "type":"video",
        "safe_search":"strict"  
    }

    try:
        response=requests.get(url,params=params)
        response.raise_for_status()
        data=response.json()

        if "items" not in data:
            return []

        return [{"title":item["snippet"]["title"],
                 "url":f"https://www.youtube.com/watch?v={item['id']['videoId']}"} for item in data["items"]]

    except requests.exceptions.RequestException as e:
        return []

# Function to fetch relevant resources
def fetch_resources(topic):
    queries=[f"{topic} best blogs",topic]
    return {
        "blogs":google_search(queries[0])[:6],
        "websites":google_search(queries[1])[:6],
        "videos":fetch_youtube_videos(topic,6)
    }

def format_resources(topic):
    resources=fetch_resources(topic)
    return {
        "blogs":[{"title":r["title"],"link":r["link"]} for r in resources["blogs"]],
        "websites":[{"title":r["title"],"link":r["link"]} for r in resources["websites"]],
        "videos":[{"title":r["title"],"url":r["url"]} for r in resources["videos"]]
    }