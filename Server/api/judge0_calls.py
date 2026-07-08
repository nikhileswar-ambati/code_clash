import os
import requests
from dotenv import load_dotenv
import json
import base64
import time
from django.http import JsonResponse
from App.models import Question

dotenv_path='.env'
load_dotenv(dotenv_path)

api_url=os.getenv("JUDGE0_BASE_URL", "https://ce.judge0.com/").rstrip("/") + "/"
rapid_api_key=os.getenv('rapid_api_key') or os.getenv('RAPIDAPI_KEY')
rapid_api_url="https://judge0-ce.p.rapidapi.com/"
use_rapidapi=os.getenv("JUDGE0_PROVIDER", "").lower() == "rapidapi"
supported_language_ids={50, 51, 54, 62, 63, 71}
fallback_languages=[
    {"id":54, "name":"C++ (GCC 9.2.0)"},
    {"id":50, "name":"C (GCC 9.2.0)"},
    {"id":71, "name":"Python (3.8.1)"},
    {"id":62, "name":"Java (OpenJDK 13.0.1)"},
    {"id":63, "name":"JavaScript (Node.js 12.14.0)"},
    {"id":51, "name":"C# (Mono 6.6.0.161)"},
]

def judge0_headers():
    if not use_rapidapi or not rapid_api_key:
        return {"content-type":"application/json"}
    return {
        "content-type":"application/json",
        "X-RapidAPI-Key":rapid_api_key,
        "X-RapidAPI-Host":"judge0-ce.p.rapidapi.com"
    }

def judge0_endpoint(path):
    base_url = rapid_api_url if use_rapidapi and rapid_api_key else api_url
    return base_url + path.lstrip("/")

def get_languages():
    try:
        url=judge0_endpoint("languages/")
        response=requests.get(url, headers=judge0_headers(), timeout=15)
        response.raise_for_status()
        languages=response.json()
        filtered=[language for language in languages if language.get("id") in supported_language_ids]
        return filtered or fallback_languages
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] get_languages: Exception -> {e}")
        return fallback_languages

def get_submission_token(source_code,lang_id,inputs,outputs):
    try:
        url=judge0_endpoint("submissions")
        querystring={"base64_encoded":"true","fields":"*"}
        encoded_source_code=base64.b64encode(source_code.encode()).decode()
        encoded_inputs=base64.b64encode(inputs.encode()).decode()
        encoded_outputs=base64.b64encode(outputs.encode()).decode()

        payload={
            "language_id":lang_id,
            "source_code":encoded_source_code,
            "stdin":encoded_inputs,
            "expected_output":encoded_outputs
        }
        response=requests.post(url,json=payload,headers=judge0_headers(),params=querystring, timeout=20)
        response.raise_for_status()
        body=response.json()
        token=body.get('token')
        if not token:
            print(f"[ERROR] get_submission_token: Missing token -> {body}")
        return token
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] get_submission_token: Exception -> {e}")
        return None

def check_submission_status(token, attempts=0):
    try:
        url=judge0_endpoint(f"submissions/{token}")
        querystring={"base64_encoded":"false","fields":"*"}

        response=requests.get(url,headers=judge0_headers(),params=querystring, timeout=20)
        response.raise_for_status()
        response=response.json()

        if response.get('status',{}).get('id') in [1,2]:
            if attempts >= 20:
                return {"error":"Judge0 took too long to finish this submission."}
            time.sleep(1)
            return check_submission_status(token, attempts + 1)
        
        return {
            'output':response.get('stdout',''),
            'error':response.get('stderr',''),
            'time':response.get('time',''),
            'memory':response.get('memory',''),
            'status':response.get('status','')
        }
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] check_submission_status: Exception -> {e}")
        return {"error":f"Error checking submission status: {e}"}

def compile_code(source_code,lang_id,testcases):
    results=[]
    overall_status=3
    description="Accepted"
    try:
        if not source_code or not lang_id:
            return {"results": [], "status": 4, "description": "Missing source code or language."}
        if not isinstance(testcases, list) or len(testcases) == 0:
            return {"results": [], "status": 4, "description": "No test cases are available for this problem."}

        for idx,testcase in enumerate(testcases):
            formatted_input="\n".join(testcase.get('input', []))
            formatted_output="\n".join(testcase.get('output', []))

            print(f"Input -> {formatted_input}")
            print(f"Expected Output -> {formatted_output}")

            token=get_submission_token(source_code,lang_id,formatted_input,formatted_output)
            if not token:
                print("[ERROR] compile_code: Failed to get submission token.")
                overall_status=4
                description="Judge0 did not return a submission token."
                results.append({
                    "input":testcase.get('input', []),
                    "expected_output":testcase.get('output', []),
                    "actual_output":[],
                    "error":"Unable to create compiler submission.",
                    "status":{"id":4,"description":"Compiler Submission Failed"},
                    "time":"",
                    "memory":""
                })
                continue

            result=check_submission_status(token)
            print(f"[DEBUG] compile_code: Judge0 Result -> {result}")

            if result.get("error"):
                overall_status=4
                description=result.get("error")
                results.append({
                    "input":testcase.get('input', []),
                    "expected_output":testcase.get('output', []),
                    "actual_output":[],
                    "error":result.get("error"),
                    "status":{"id":4,"description":"Runtime Error"},
                    "time":"",
                    "memory":""
                })
                continue

            status_id=result.get('status',{}).get('id',4)
            if status_id!=3:
                overall_status=4
                description=result.get('status',{}).get('description',"Wrong Answer")

            results.append({
                "input":testcase.get('input', []),
                "expected_output":testcase.get('output', []),
                "actual_output":result.get('output','').strip().split("\n") if result.get('output') else [],
                "error":result.get('error'),
                "status":result.get('status'),
                "time":result.get('time'),
                "memory":result.get('memory')
            })

        if overall_status == 3:
            description="Accepted"
        print(f"[DEBUG] compile_code: Final Status -> {overall_status}, Description -> {description}")
        return {
            "results":results,
            "status":overall_status,
            "description":description
        }
    except Question.DoesNotExist:
        print("[ERROR] compile_code: Question with the given ID does not exist.")
        return {"error":"Question with the given ID does not exist."}
    except Exception as e:
        print(f"[ERROR] compile_code: Exception -> {str(e)}")
        return {"error":f"Error occurred: {str(e)}"}
