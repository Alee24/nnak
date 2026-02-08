@echo off
echo Starting NNAK Server...
echo Frontend: http://localhost:4875/pages/members.html
echo API:      http://localhost:4549/api
echo.
C:\xampp\php\php.exe -S 127.0.0.1:4549 server_router.php
pause
