#!/usr/bin/env python
"""
Wait for the database to be available before starting the app.
Usage: python scripts/wait_for_db.py
"""
import os
import sys
import time
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", os.environ.get("DJANGO_SETTINGS_MODULE", "dealsync.settings.dev"))


def wait_for_db(max_retries: int = 30, retry_interval: int = 2) -> None:
    django.setup()
    from django.db import connections
    from django.db.utils import OperationalError

    db_conn = connections["default"]
    retries = 0
    while retries < max_retries:
        try:
            db_conn.ensure_connection()
            print("Database is available.")
            return
        except OperationalError:
            retries += 1
            print(f"Database unavailable, waiting {retry_interval}s... ({retries}/{max_retries})")
            time.sleep(retry_interval)

    print("Could not connect to the database. Exiting.")
    sys.exit(1)


if __name__ == "__main__":
    wait_for_db()
