"""
SPARC AI - Real-Time Automatic GitHub File Watcher & Sync Engine
Watches for file modifications in the workspace and automatically commits and pushes to GitHub.
Includes a debounce delay (10 seconds) so rapid edits are grouped into clean, single commits.
"""

import os
import time
import subprocess
from datetime import datetime

WATCH_EXTENSIONS = {'.py', '.csv', '.toml', '.md', '.txt', '.bat', '.json'}
IGNORE_DIRS = {'.git', '__pycache__', '.streamlit', '.gemini', 'venv', '.venv'}
DEBOUNCE_SECONDS = 10

def get_last_modified_timestamp():
    latest = 0
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in WATCH_EXTENSIONS:
                fp = os.path.join(root, f)
                try:
                    mtime = os.path.getmtime(fp)
                    if mtime > latest:
                        latest = mtime
                except OSError:
                    pass
    return latest

def auto_push():
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    msg = f"auto-sync: real-time update at {timestamp}"
    print(f"\n[SPARC Auto-Sync] Detected changes. Committing & Pushing: '{msg}'...")
    try:
        subprocess.run(["git", "add", "-A"], check=True)
        # Check if there are staged changes
        res = subprocess.run(["git", "diff", "--cached", "--quiet"])
        if res.returncode != 0:
            subprocess.run(["git", "commit", "-m", msg], check=True)
            subprocess.run(["git", "push", "origin", "main"], check=True)
            print(f"[SPARC Auto-Sync] SUCCESS: GitHub & Live Web App updated at {timestamp}!")
        else:
            print("[SPARC Auto-Sync] No staged changes to commit.")
    except subprocess.CalledProcessError as e:
        print(f"[SPARC Auto-Sync] Error during git sync: {e}")

def main():
    print("=" * 65)
    print("  🌿 SPARC AI - Real-Time Automatic GitHub Sync Engine")
    print("  Listening for local code edits... will auto-push on file save!")
    print("=" * 65)
    last_known = get_last_modified_timestamp()
    
    while True:
        time.sleep(3)
        current = get_last_modified_timestamp()
        if current > last_known:
            print(f"\n[Change Detected] Waiting {DEBOUNCE_SECONDS}s for editing to settle...")
            time.sleep(DEBOUNCE_SECONDS)
            auto_push()
            last_known = get_last_modified_timestamp()

if __name__ == "__main__":
    main()
