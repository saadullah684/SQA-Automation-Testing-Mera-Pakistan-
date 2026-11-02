@echo off
cls
echo ============================================================
=             My-Pakistan - Test Suite Runner
=             All 6 Test Files One by One
============================================================
echo.
echo Make sure both servers are running:
echo   - Frontend: http://localhost:8080
echo   - API:      http://localhost:3001
echo.
echo Press any key to start testing...
pause >nul
cls

echo ============================================================
echo  TEST FILE 1 OF 6: Unit Testing
echo  Tests: API health, data structure, field validation
echo ============================================================
echo.
cd /d "%~dp0"
python -m pytest test_unit.py -v --tb=short
echo.
echo Press any key to continue to next test...
pause >nul
cls

echo ============================================================
echo  TEST FILE 2 OF 6: Integration Testing
echo  Tests: API + Frontend together, navigation, search
echo ============================================================
echo.
python -m pytest test_integration.py -v --tb=short
echo.
echo Press any key to continue to next test...
pause >nul
cls

echo ============================================================
echo  TEST FILE 3 OF 6: Functional Testing
echo  Tests: Complete user journeys end-to-end
echo ============================================================
echo.
python -m pytest test_functional.py -v --tb=short
echo.
echo Press any key to continue to next test...
pause >nul
cls

echo ============================================================
echo  TEST FILE 4 OF 6: User Acceptance Testing (UAT)
echo  Tests: Business requirements validation
echo ============================================================
echo.
python -m pytest test_uat.py -v --tb=short
echo.
echo Press any key to continue to next test...
pause >nul
cls

echo ============================================================
echo  TEST FILE 5 OF 6: Page Object Model Testing
echo  Tests: POM classes and methods work correctly
echo ============================================================
echo.
python -m pytest test_pom.py -v --tb=short
echo.
echo Press any key to continue to next test...
pause >nul
cls

echo ============================================================
echo  TEST FILE 6 OF 6: Single Page Application Testing
echo  Tests: SPA routing, back/forward buttons
echo ============================================================
echo.
python -m pytest test_single_page.py -v --tb=short
echo.
echo ============================================================
echo            ALL 6 TEST FILES COMPLETED!
echo ============================================================
pause