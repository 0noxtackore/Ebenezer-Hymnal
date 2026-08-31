@echo off
setlocal
set "NODE=C:\src\node"
if exist "%NODE%\npm.cmd" set "PATH=%NODE%;%PATH%"
cd /d "%~dp0"
echo Iniciando Himnario Ebenezer (dev server)...
echo Copia la URL http://localhost:5173/ en tu navegador.
call npm run dev
