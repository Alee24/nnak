@echo off
echo Starting NNAK Server...
echo Frontend: http://localhost:5525/pages/members.html
echo API:      http://localhost:5526/api
echo.
C:\xampp\php\php.exe -S 127.0.0.1:5526 server_router.php
pause
