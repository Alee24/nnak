@echo off
echo Starting NNAK Server...
echo Frontend: http://localhost:8000/pages/members.html
echo API:      http://localhost:8000/api
echo.
C:\xampp\php\php.exe -S localhost:8000 server_router.php
pause
