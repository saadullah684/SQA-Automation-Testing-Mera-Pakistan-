@echo off
echo ============================================
echo  Seeding My-Pakistan Database
echo ============================================
cd /d "%~dp0"
set "MONGODB_URI=mongodb+srv://zainsiddiquim_db_user:D7YOUYrbJIWZNAY1@cluster0.vczraas.mongodb.net/mypakistan?retryWrites=true&w=majority&appName=Cluster0"
echo.
echo Running seed script...
pnpm --filter @workspace/scripts run seed
echo.
pause