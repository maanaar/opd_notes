# Linux Deployment Guide — Revy Health Platform

## Prerequisites

- Ubuntu 22.04 / 24.04
- Root or sudo access
- Domain or server IP ready

---

## 1 — Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

---

## 2 — Upload the Project

```bash
# Clone all three repos into the same folder
mkdir -p ~/revy
cd ~/revy

git clone <opd_notes-repo-url> opd_notes
cd opd_notes

git clone <resubmission-repo-url> Resubmission-main
git clone <screening-repo-url> Screening-main
```

---

## 3 — Create the Screening Dockerfile


```bash
cat > ~/revy/opd_notes/Screening-main/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 2030

CMD ["python", "app.py"]
EOF
```

---

## 4 — Create the .env File

```bash
cat > ~/revy/opd_notes/.env << 'EOF'
FIREWORKS_API_KEY=your_fireworks_key_here
GEMINI_API_KEY=your_gemini_key_here
FLASK_SECRET_KEY=any-random-secret-string
EOF
```

---

## 5 — Update Portal with Server IP

```bash
SERVER_IP=$(curl -s ifconfig.me)

sed -i "s/localhost:2200/$SERVER_IP:2200/g" ~/revy/opd_notes/templates/portal.html
sed -i "s/localhost:2030/$SERVER_IP:2030/g" ~/revy/opd_notes/templates/portal.html
```

---

## 6 — Build and Start All Containers

```bash
cd ~/revy/opd_notes
docker compose up --build -d
```

This starts 4 containers:

| Container | Service | Port |
|-----------|---------|------|
| revy_portal | Portal landing page | 2020 |
| revy_resubmission | Resubmission Copilot | 2200 |
| revy_screening | Doctor Screening | 2030 |
| revy_mongodb | MongoDB database | internal only |

---

## 7 — Insert MongoDB Data

```bash
cat > /tmp/insert.py << 'EOF'
from mongoengine import disconnect, connect
disconnect('default')
connect(db='resubmission_db', host='mongodb', port=27017, alias='default')
from datetime import datetime
from src.resubmission.models import Policy, CoverageDetail

existing = Policy.objects(policy_number="514891001").first()
if existing:
    existing.delete()

bupa = Policy(
    policy_number="514891001",
    company_name="Demo Corp",
    policy_holder="Demo Corp HR",
    effective_from=datetime(2024, 1, 1),
    effective_to=datetime(2025, 1, 1),
    coverage_details=[
        CoverageDetail(vip_level="VIP", overall_annual_limit="1,000,000 SAR", network="National Network"),
        CoverageDetail(vip_level="VIP+", overall_annual_limit="1,000,000 SAR", network="Premium Network"),
        CoverageDetail(vip_level="Gold", overall_annual_limit="500,000 SAR", network="Standard Network"),
    ]
)
bupa.save()
print("Done")
EOF

docker cp /tmp/insert.py revy_resubmission:/app/insert.py
docker exec revy_resubmission python insert.py
```

---

## 8 — Open the Platform

```
http://YOUR_SERVER_IP:2020
```

---

## Useful Commands

```bash
# Check all containers are running
docker ps

# View logs for a specific service
docker logs revy_resubmission
docker logs revy_screening
docker logs revy_portal

# Restart a single service
docker compose restart resubmission

# Rebuild and restart everything
docker compose up --build -d

# Stop everything
docker compose down

# Stop and delete database
docker compose down -v
```

---

## Common Issues & Fixes

### Port already in use
If port 27017 is already used by a local MongoDB:
- Remove the `ports` mapping for mongodb in `docker-compose.yaml`
- Containers communicate internally without it

### .dockerignore blocking files
The original `.dockerignore` excluded `*.toml`, `*.cfg`, `*.ini` which blocked `pyproject.toml` from being copied.
Fixed by removing those lines from `.dockerignore`.

### Case-sensitive paths on Linux
`Path("Data")` fails on Linux — fixed to `Path("data")` in `utils_patched.py`.

### iframes not loading (Resubmission / Screening)
The portal uses `localhost` URLs inside iframes. On a remote server the browser cannot reach `localhost`.
Fix: replace with the actual server IP in `templates/portal.html`.

### MongoDB connection in Docker
Services inside Docker cannot connect to `localhost` — they use the service name (`mongodb`).
Fixed by reading `MONGO_HOST` from environment variables in `flask_app.py` and `insert_polices.py`.
