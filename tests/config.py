"""Configuration constants for Selenium tests."""

BASE_URL = "http://localhost:8080"
API_URL = "http://localhost:3001"

# Timeouts (seconds)
# CRITICAL FIX: Implicit wait ko 0 kiya hai taaky yeh Explicit Wait (WebDriverWait) ke sath clash na kare
IMPLICIT_WAIT = 12 
EXPLICIT_WAIT = 20
PAGE_LOAD_TIMEOUT = 30

# Browser Configuration
BROWSER = "chrome"  # chrome | firefox | edge

# SUPER FIX FOR BROWSER VISUALIZATION:
# Isay FALSE kar diya hai taaky test run hote hi real browser window open ho aur miss ko sab live nazar aaye!
HEADLESS = False  

# Credentials (Clerk test users - if needed)
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "TestPassword123!"

# Test data - expected province slugs
PROVINCES = [
    "punjab",
    "sindh",
    "khyber-pakhtunkhwa",
    "balochistan",
    "gilgit-baltistan",
    "azad-kashmir",
]

EXPECTED_CATEGORIES = ["monument", "nature", "food", "culture", "adventure"]