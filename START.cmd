@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto bundled
node server/server.mjs
goto done
:bundled
set "STUDIO_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%STUDIO_NODE%" goto missing
"%STUDIO_NODE%" server/server.mjs
goto done
:missing
echo Node.js 20 or newer is required.
:done
pause
