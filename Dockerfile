FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir flask

COPY portal.py .
COPY templates/ templates/
COPY index.html profile.html script.js data.js profile.js analytics.html ./

EXPOSE 2020

CMD ["python", "portal.py"]
