"""
Upload hymns to Firebase Realtime Database.

Usage:
    python scripts/upload_hymns.py

Authenticates with Firebase, reads local hymns.json,
and uploads the data to the 'hymnario' node.
"""

import json
import sys
from pathlib import Path

import requests

API_KEY = "AIzaSyCPnsegptU8dCOOimhsPSmHUE5KwbXiDoM"
DB_URL = "https://ebenezer-hymnal-default-rtdb.europe-west1.firebasedatabase.app"
AUTH_URL = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}"

ADMIN_EMAIL = "ramon@ebenezer.dev"
ADMIN_PASSWORD = "Ramon2026"

HYMNS_PATH = Path(__file__).resolve().parent.parent / "assets" / "hymns.json"


def login() -> str:
    """Authenticate and return idToken."""
    resp = requests.post(AUTH_URL, json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
        "returnSecureToken": True,
    }, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    print(f"LOGIN OK: {data['email']} (uid={data['localId']})")
    return data["idToken"]


def upload(token: str, payload: dict) -> None:
    """Upload data to Firebase with PUT."""
    url = f"{DB_URL}/hymnario.json?auth={token}"
    resp = requests.put(url, json=payload, timeout=120)
    resp.raise_for_status()
    print("UPLOAD PUT: OK")


def verify() -> None:
    """Read back and verify the uploaded data."""
    resp = requests.get(f"{DB_URL}/hymnario.json", timeout=30)
    resp.raise_for_status()
    data = resp.json()
    categories = data.get("categories", [])
    hymns = data.get("hymns", [])
    print(f"VERIFY: categories={len(categories)} hymns={len(hymns)}")
    if hymns:
        h0 = hymns[0]
        print(f"FIRST: N{h0['number']} - {h0['title']} [cat={h0.get('category', '')}]")


def main():
    # 1) Login
    token = login()

    # 2) Load local data
    if not HYMNS_PATH.exists():
        print(f"ERROR: {HYMNS_PATH} not found")
        sys.exit(1)

    with open(HYMNS_PATH, "r", encoding="utf-8") as f:
        payload = json.load(f)

    categories = payload.get("categories", [])
    hymns = payload.get("hymns", [])
    print(f"LOCAL DATA: categories={len(categories)} hymns={len(hymns)}")

    # 3) Upload
    upload(token, payload)

    # 4) Verify
    verify()


if __name__ == "__main__":
    main()
