import sqlite3
import json
import re
from datetime import datetime
from langchain_google_genai import ChatGoogleGenerativeAI
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

now = datetime.now()
formatted_now = now.strftime("%A, %d %B %Y, %H:%M")

api_key = "AIzaSyBh0ad5gUxamAF_QtMLjE4hpxP5VDBqGcw"  # Replace with your actual API key
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key)

DATABASE = 'tasks.db'

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_title TEXT,
            description TEXT,
            review TEXT,
            priority TEXT,
            time_required TEXT,
            schedule_date TEXT,
            schedule_from TEXT,
            schedule_to TEXT,
            status BOOL,
            tags TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

def get_filtered_tasks(tag, date):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    tag_pattern = f"%{tag.upper()}%"
    cursor.execute('''
        SELECT task_title, description, review, priority, time_required,
               schedule_date, schedule_from, schedule_to, status, tags
        FROM tasks
        WHERE tags LIKE ? AND schedule_date = ?
    ''', (tag_pattern, date))

    rows = cursor.fetchall()
    conn.close()
    return rows

def extract_section(text, summary_type):
    pattern = f"{summary_type}.*?:\\s*(.*?)(?=\\n\\n|\\Z)"
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    return match.group(1).strip() if match else "Could not extract summary."

def main():
    tags_input = input("Enter TAGS (comma-separated, e.g., WORK,READ): ").strip()
    tags = [t.strip().upper() for t in tags_input.split(",") if t.strip()]
    date = input("Enter DATE (dd/mm/yyyy): ").strip()

    try:
        datetime.strptime(date, "%d/%m/%Y")
    except ValueError:
        print("Date format is invalid. Use dd/mm/yyyy.")
        return


    date_obj = datetime.strptime(date, "%d/%m/%Y")

    # Format as mm/dd/yyyy
    date_prompt = date_obj.strftime("%d %B, %Y")

    combined_task_list = []

    for tag in tags:
        print(tag)
        tasks = get_filtered_tasks(tag, date)

        if not tasks:
            print(f"\n⚠️ No tasks found for tag '{tag}' on {date}")
            continue

        task_list = [
            {
                "task_title": t[0],
                "description": t[1],
                "review": t[2],
                "priority": t[3],
                "time_required": t[4],
                "schedule_from": t[6],
                "schedule_to": t[7],
                "status": "Done" if t[8] else "Missed",
                "tags": t[9]
            } for t in tasks
        ]

        combined_task_list.extend(task_list)


    # === Prompt Gemini ===
    prompt1 = f"""
Based on the following tasks, provide a short summary in a point wise manner. 
The tone is positive and optimistic. 
Do not use Emojis. Date is {date_prompt}.
Tasks:
{json.dumps(combined_task_list, indent=2)}
"""
    prompt2 = f"""
Write a short, precise and well-structured summary in bullet points.
Each point should be written in a natural, engaging to read, descriptive tone that adapts to the specifics of the task. 
Avoid repetitive sentence structures—each point should flow with 
its own voice, almost like a small story of what happened with that task.

Date is {date_prompt}. Today is {formatted_now}

Tasks:
{json.dumps(combined_task_list, indent=2)}
"""
    response1 = llm.invoke(prompt1)

    print("\n\n")
    print(response1.content)
    print("\n\n")
    response2 = llm.invoke(prompt2)
    print(response2.content)
    print("\n\n")

@app.route('/generate-summary', methods=['POST'])
def generate_summary():
    data = request.json
    date = data.get('date')
    tags = data.get('tags', [])
    
    combined_task_list = []
    for tag in tags:
        tasks = get_filtered_tasks(tag, date)
        task_list = [
            {
                "task_title": t[0],
                "description": t[1],
                "review": t[2],
                "priority": t[3],
                "time_required": t[4],
                "schedule_from": t[6],
                "schedule_to": t[7],
                "status": "Done" if t[8] else "Missed",
                "tags": t[9]
            } for t in tasks
        ]
        combined_task_list.extend(task_list)

    date_obj = datetime.strptime(date, "%Y-%m-%d")
    date_prompt = date_obj.strftime("%d %B, %Y")
    formatted_now = datetime.now().strftime("%A, %d %B %Y, %H:%M")

    prompt = f"""
Write a short, precise and well-structured summary in bullet points.
Each point should be written in a natural, engaging to read, descriptive tone that adapts to the specifics of the task. 
Avoid repetitive sentence structures—each point should flow with its own voice.

Date is {date_prompt}. Today is {formatted_now}

Tasks:
{json.dumps(combined_task_list, indent=2)}
"""
    response = llm.invoke(prompt)
    return jsonify({"summary": response.content})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
