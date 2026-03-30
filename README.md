# webOS Subscription Management Dashboard

## Prerequisites

- Python 3.12+

## Setup

```bash
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload
```

The app will be available at http://localhost:8000.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Dashboard UI |
| GET | `/health` | Health check |
| GET | `/api/subscribers` | List all subscribers |
| GET | `/api/subscribers/{user_id}/devices` | List devices for a subscriber |
| GET | `/api/devices/{device_id}/usage` | Device usage details |
