#!/bin/bash
set -e

echo "Waiting for database..."
python scripts/wait_for_db.py

if [ $# -eq 0 ] || [ "${1#-}" != "$1" ]; then
    set -- gunicorn dealsync.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers 4 \
        --worker-class sync \
        --timeout 120 \
        --access-logfile - \
        --error-logfile - \
        --log-level info "$@"
fi

if [ "$1" = "gunicorn" ]; then
    echo "Running migrations..."
    python manage.py migrate --noinput

    echo "Collecting static files..."
    python manage.py collectstatic --noinput
fi

exec "$@"
