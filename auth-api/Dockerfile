# VULNERABILITY: Not pinned to digest, using full image (CWE-1104)
FROM python:3.9

# VULNERABILITY: No .dockerignore, copies everything
WORKDIR /app
COPY . .

# VULNERABILITY: No pip hash verification, no lockfile
RUN pip install -r requirements.txt

# VULNERABILITY: Overly permissive file permissions (CWE-732)
RUN chmod 777 /app

# VULNERABILITY: Running as root (CWE-250)
USER root

EXPOSE 5000

# VULNERABILITY: Debug mode enabled
CMD ["python", "app.py"]
