# Silicon Sample Simulator

LLM-based synthetic participant platform for psychology research.

## Quick Start

1. Start PostgreSQL:
```bash
docker-compose up -d
```

2. Backend setup:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings
uvicorn app.main:app --reload
```

3. Frontend setup:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Development

Backend runs on http://localhost:8000
Frontend runs on http://localhost:5173
API docs: http://localhost:8000/docs
