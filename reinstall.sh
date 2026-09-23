#!/bin/bash
# ==============================================================================
# MMS Golf Club Management System - Automated Clean Reinstall & Deployment Script
# ==============================================================================
set -e

echo "=============================================================================="
echo " 1. Stopping & Removing Existing Docker Containers & Volumes..."
echo "=============================================================================="
docker compose down -v --remove-orphans || true

echo ""
echo "=============================================================================="
echo " 2. Cleaning Old Build Artifacts & Git Cache..."
echo "=============================================================================="
git fetch origin MMS
git reset --hard origin/MMS
git clean -fd

echo ""
echo "=============================================================================="
echo " 3. Rebuilding Docker Images from Scratch (No Cache)..."
echo "=============================================================================="
docker compose build --no-cache

echo ""
echo "=============================================================================="
echo " 4. Starting Containers & Waiting for MySQL Database Health..."
echo "=============================================================================="
docker compose up -d

echo "Waiting for database container to be healthy..."
sleep 8

echo ""
echo "=============================================================================="
echo " 5. Running Database Wiping, Migrations & Demo Ecosystem Seeding..."
echo "=============================================================================="
docker compose exec -T backend php /var/www/html/backend/reinstall.php

echo ""
echo "=============================================================================="
echo " 6. Pruning Unused Images & Volumes..."
echo "=============================================================================="
docker image prune -f

echo ""
echo "=============================================================================="
echo " SUCCESS: System successfully reinstalled from scratch with fresh DB & UI! "
echo "=============================================================================="
