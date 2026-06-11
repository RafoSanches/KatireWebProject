@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo          INICIANDO O KATIRE
echo ==========================================
echo.

if not exist package.json (
  echo ERRO: package.json nao encontrado.
  echo Extraia o ZIP completo antes de executar.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Instalando dependencias pela primeira vez...
  call npm install
  if errorlevel 1 (
    echo.
    echo Nao foi possivel instalar as dependencias.
    pause
    exit /b 1
  )
)

echo.
echo Site:  http://localhost:4200
echo Banco: http://localhost:3000
echo.
call npm run dev

endlocal
