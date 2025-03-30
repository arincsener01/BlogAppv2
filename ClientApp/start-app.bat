@echo off
echo Starting the Blog App...

REM Check if .NET API is already running
SET PORT_CHECK=7042
netstat -ano | findstr :%PORT_CHECK% > nul
IF %ERRORLEVEL% EQU 0 (
  echo API is already running on port %PORT_CHECK%
  
  REM Optionally restart the API to clear any memory issues
  SET /P RESTART_API=Would you like to restart the API to ensure it has sufficient resources? (y/n): 
  IF /I "%RESTART_API%"=="y" (
    echo Finding and stopping the API process on port %PORT_CHECK%...
    FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :%PORT_CHECK% ^| findstr LISTENING') DO (
      echo Stopping process with PID: %%P
      taskkill /PID %%P /F
      echo Waiting for process to stop...
      timeout /t 3 /nobreak > nul
    )
    
    echo Starting the .NET API...
    start cmd /k "cd %~dp0\..\API.BLOG && echo === API BLOG SERVER === && dotnet run --no-build"
    echo Waiting for the API to initialize (15 seconds)...
    timeout /t 15 /nobreak > nul
  )
) ELSE (
  echo Starting the .NET API...
  start cmd /k "cd %~dp0\..\API.BLOG && echo === API BLOG SERVER === && dotnet run"
  echo Waiting for the API to initialize (20 seconds)...
  timeout /t 20 /nobreak > nul
)

REM Check system resources before starting frontend
echo Checking system resources...
wmic cpu get loadpercentage | find /i "LoadPercentage" > nul
FOR /F "skip=1" %%P IN ('wmic cpu get loadpercentage') DO (
  SET CPU_LOAD=%%P
  goto :CHECK_COMPLETE
)
:CHECK_COMPLETE

IF %CPU_LOAD% GEQ 80 (
  echo WARNING: CPU load is high (%CPU_LOAD%%%). The application may experience performance issues.
  echo Consider closing other applications before proceeding.
  pause
)

REM Start the React frontend
echo Starting the React frontend...
cd /d %~dp0
npm start

echo Blog App started successfully! 