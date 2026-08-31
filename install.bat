@echo off
setlocal
set "NODE=C:\src\node"
if exist "%NODE%\npm.cmd" set "PATH=%NODE%;%PATH%"
cd /d "%~dp0"
echo Instalando dependencias de Himnario Ebenezer...
call npm install
echo.
echo Listo. Ya puedes ejecutar start-app.bat
pause
