# Dealsync

A production-ready Django REST Framework project.

## Apps

- `sales`
- `login`
- `signup`
- `product`
- `discount`
- `warehouse`
- `subscription`
- `customer`

## Quick Start

```bash
cp .env.example .env
docker compose up --build
```

The API will be available at http://localhost:8000/api/

API documentation: http://localhost:8000/api/docs/

## Development

```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env to use local DB settings
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Testing

```bash
make test
make test-cov
```

## Code Quality

```bash
make lint
make format
```
