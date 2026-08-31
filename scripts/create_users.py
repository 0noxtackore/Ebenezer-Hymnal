"""
Create Firebase Authentication users for Ebenezer Hymnal.

Usage:
    python scripts/create_users.py

Creates four admin accounts and deletes legacy accounts.
Outputs credentials to firebase-credentials.txt.
"""

import json
import requests
from datetime import datetime
from pathlib import Path

API_KEY = "AIzaSyCPnsegptU8dCOOimhsPSmHUE5KwbXiDoM"
AUTH_URL = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={API_KEY}"
DELETE_URL = f"https://identitytoolkit.googleapis.com/v1/accounts:delete?key={API_KEY}"
LOGIN_URL = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}"

NEW_USERS = [
    {"name": "Ramon Camacho", "email": "ramon@ebenezer.dev", "password": "Ramon2026"},
    {"name": "Oswaldo Eli", "email": "eli@ebenezer.dev", "password": "Eli2026"},
    {"name": "Oswaldo Tona", "email": "tona@ebenezer.dev", "password": "Tona2026"},
    {"name": "Isaac Rodriguez", "email": "isaac@ebenezer.dev", "password": "Isaac2026"},
]

OLD_USERS = [
    {"email": "ramon.camacho@ebenezerhymnal.dev", "password": "hJP%M=FBfi6Cq^ao&vT6"},
    {"email": "oswaldo.eli@ebenezerhymnal.dev", "password": "ZzLKDA$C9ES^9qGxGNTj"},
    {"email": "oswaldo.tona@ebenezerhymnal.dev", "password": "kphVTVWw&?YMd7n4a@qT"},
    {"email": "isaac.rodriguez@ebenezerhymnal.dev", "password": "UentkM*tj76*AmDV3p?Y"},
    {"email": "probe.973119141.test@ebenezerhymnal.dev", "password": "ProbePass123!"},
]


def delete_account(email: str, password: str) -> str:
    """Login and delete a Firebase Auth account."""
    try:
        resp = requests.post(LOGIN_URL, json={
            "email": email,
            "password": password,
            "returnSecureToken": True,
        }, timeout=25)
        token = resp.json().get("idToken")
        if not token:
            return "NO_LOGIN"
    except Exception as e:
        return f"NO_LOGIN: {e}"

    try:
        requests.post(DELETE_URL, json={"idToken": token}, timeout=25)
        return "DELETED"
    except Exception as e:
        return f"NO_DELETE: {e}"


def main():
    lines = [
        "=================================================",
        " CREDENTIALS - EBENEZER HYMNAL",
        " Firebase Authentication (Email/Password)",
        f" Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "=================================================",
        "",
    ]

    # Create new users
    for user in NEW_USERS:
        status = "OK"
        detail = ""
        try:
            resp = requests.post(AUTH_URL, json={
                "email": user["email"],
                "password": user["password"],
                "returnSecureToken": False,
            }, timeout=25)
            uid = resp.json().get("localId", "")
            detail = f"uid={uid}"
            print(f"CREATED: {user['email']} ({detail})")
        except requests.exceptions.HTTPError as e:
            body = e.response.json() if e.response else {}
            error_code = body.get("error", {}).get("message", "")
            if error_code == "EMAIL_EXISTS":
                detail = "email already exists"
            else:
                status = "ERROR"
                detail = error_code or str(e)
                print(f"FAILED: {user['email']} - {detail}")

        lines.extend([
            f"Name     : {user['name']}",
            f"Email    : {user['email']}",
            f"Password : {user['password']}",
            f"Status   : {status} | {detail}",
            "-------------------------------------------------",
        ])

    # Delete old users
    print("\n--- Deleting old accounts ---")
    for user in OLD_USERS:
        result = delete_account(user["email"], user["password"])
        print(f"  {user['email']} => {result}")

    lines.extend(["", "NOTE: passwords are simple for development purposes."])

    out_path = Path(__file__).resolve().parent.parent / "firebase-credentials.txt"
    out_path.write_text("\r\n".join(lines), encoding="utf-8")
    print(f"\nCredentials saved to: {out_path}")


if __name__ == "__main__":
    main()
