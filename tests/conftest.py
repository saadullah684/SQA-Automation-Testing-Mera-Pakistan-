"""Shared fixtures for all test files."""

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.edge.options import Options as EdgeOptions
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.edge.service import Service as EdgeService

from config import BASE_URL, BROWSER, HEADLESS, PAGE_LOAD_TIMEOUT


def _create_driver():
    """Create a WebDriver instance based on config."""
    if BROWSER == "chrome":
        options = ChromeOptions()
        if HEADLESS:
            options.add_argument("--headless=new")
            options.add_argument("--window-size=1920,1080")
        else:
            # Jab browser samne chalay to automatic screen size par perfect open ho
            options.add_argument("--start-maximized") 
        
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_experimental_option("excludeSwitches", ["enable-logging"])
        
        service = ChromeService(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)

    elif BROWSER == "firefox":
        options = FirefoxOptions()
        if HEADLESS:
            options.add_argument("--headless")
        service = FirefoxService(GeckoDriverManager().install())
        driver = webdriver.Firefox(service=service, options=options)

    elif BROWSER == "edge":
        options = EdgeOptions()
        if HEADLESS:
            options.add_argument("--headless")
        else:
            options.add_argument("--start-maximized")
            
        service = EdgeService(EdgeChromiumDriverManager().install())
        driver = webdriver.Edge(service=service, options=options)

    else:
        raise ValueError(f"Unsupported browser: {BROWSER}")

    # Timeouts and Window presentation
    driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
    if not HEADLESS:
        driver.maximize_window() # Double-ensure full screen validation for the UI
        
    return driver


@pytest.fixture(scope="function")
def driver():
    """Fixture that provides a WebDriver instance."""
    driver = _create_driver()
    yield driver
    driver.quit()


@pytest.fixture(scope="function")
def base_url():
    """Return the base URL."""
    return BASE_URL