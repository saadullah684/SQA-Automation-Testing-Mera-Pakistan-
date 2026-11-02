"""Page Object Model Tests - Test that the POM classes work correctly.

These tests validate that every Page Object method functions as expected
and that the locators are correctly defined.
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages import (
    HomePage,
    ExplorePage,
    ProvincesPage,
    Navbar,
)
from config import BASE_URL, EXPLICIT_WAIT


class TestHomePagePOM:
    """Validate all HomePage POM methods in isolation."""

    def test_homepage_open_and_title(self, driver):
        """Verify open() and get_title() work cleanly."""
        home = HomePage(driver).open()
        
        # Guard wait to ensure window title or shell context finishes binding
        WebDriverWait(driver, EXPLICIT_WAIT).until(lambda d: d.title is not None)
        title = home.get_title()
        
        assert title is not None
        assert len(title.strip()) > 0, "Homepage tab title is completely blank"

    def test_homepage_hero_heading(self, driver):
        """Verify get_hero_heading() returns expected text layout."""
        home = HomePage(driver).open()
        
        # Sync guard to avoid getting text from unmounted components
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: len(home.get_hero_heading().strip()) > 0
        )
        heading = home.get_hero_heading()
        
        assert isinstance(heading, str)
        assert "Pakistan" in heading, f"Unexpected landing hero heading content: {heading}"

    def test_homepage_featured_locations(self, driver):
        """Verify get_featured_locations() extracts localized DOM structures."""
        home = HomePage(driver).open()
        
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: home.get_featured_count() > 0
        )
        cards = home.get_featured_locations()
        
        assert isinstance(cards, list)
        assert home.get_featured_count() == len(cards), "Card counter metadata mismatch"

    def test_homepage_province_links(self, driver):
        """Verify get_province_links() maps out all region items on layout."""
        home = HomePage(driver).open()
        
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: len(home.get_province_links()) >= 6
        )
        links = home.get_province_links()
        
        assert isinstance(links, list)
        assert len(links) >= 6, f"Expected full geographic coverage cards, found {len(links)}"

    def test_homepage_search_sends_query(self, driver):
        """Verify search_for() transitions the URL with parameters correctly."""
        home = HomePage(driver).open()
        home.search_for("Islamabad")
        
        # Explicit router safety lock
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))
        current_url = driver.current_url.lower()
        
        assert "explore" in current_url
        assert "islamabad" in current_url or "q=" in current_url, f"Search payload dropped from router path: {driver.current_url}"

    def test_homepage_metropolitan_searches_pom(self, driver):
        """Verify metropolitan city searches (Lahore & Karachi) load grid cards using POM methods."""
        
        # --- PHASE 1: LAHORE FLOW ---
        home = HomePage(driver).open()
        time.sleep(1.5)  # Safe buffer to look at landing shell
        
        # Triggering the POM method for searching Lahore
        home.search_for("Lahore")
        
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))
        
        # Confirming cards or list views update for Lahore context
        explore = ExplorePage(driver)
        WebDriverWait(driver, EXPLICIT_WAIT).until(lambda d: explore.get_location_count() > 0)
        
        # --- VISUAL PAUSE: Lahore results dekhne ke liye ---
        time.sleep(3)
        assert "explore" in driver.current_url.lower()

        # --- PHASE 2: KARACHI FLOW ---
        home = HomePage(driver).open()
        time.sleep(1.5)
        
        # Triggering the POM method for searching Karachi
        home.search_for("Karachi")
        
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))
        WebDriverWait(driver, EXPLICIT_WAIT).until(lambda d: explore.get_location_count() > 0)
        
        # --- VISUAL PAUSE: Karachi results dekhne ke liye ---
        time.sleep(3)
        assert "explore" in driver.current_url.lower()


class TestExplorePagePOM:
    """Validate all ExplorePage POM methods and interaction filters."""

    def test_explore_open(self, driver):
        """Verify explore page opens and triggers lazy grid rendering."""
        explore = ExplorePage(driver).open()
        
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: explore.get_location_count() > 0
        )
        count = explore.get_location_count()
        assert count > 0, "Grid failed to map backend layout feeds"

    def test_explore_clear_filters(self, driver):
        """Verify clear_filters() maintains grid model structure securely."""
        explore = ExplorePage(driver).open()
        
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: explore.get_location_count() > 0
        )
        explore.clear_filters()
        
        # Sync validation after DOM cleanup pipeline finishes executing
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: explore.get_location_count() > 0
        )
        count = explore.get_location_count()
        assert count > 0, "Grid completely cleared out or broke after filter reset"

    def test_explore_toggle_map(self, driver):
        """Verify toggle_map() safely switches visual presentation layouts."""
        explore = ExplorePage(driver).open()
        explore.toggle_map()
        
        # Safe structural retrieval using POM element locator bindings instead of raw drivers
        toggle_btn = WebDriverWait(driver, EXPLICIT_WAIT).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='btn-toggle-map']"))
        )
        assert toggle_btn.is_displayed(), "Map canvas layout toggle went missing from active viewport"


class TestProvincesPagePOM:
    """Validate all ProvincesPage list and directional binding structures."""

    def test_provinces_open(self, driver):
        """Verify provinces container mounts and shows title headers."""
        provinces = ProvincesPage(driver).open()
        
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: len(provinces.get_heading().strip()) > 0
        )
        heading = provinces.get_heading()
        assert any(k in heading.lower() for k in ["province", "region", "territory"]), f"Invalid header format: {heading}"

    def test_provinces_get_links(self, driver):
        """Verify get_province_links() scans interactive navigation elements."""
        provinces = ProvincesPage(driver).open()
        
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: len(provinces.get_province_links()) >= 6
        )
        links = provinces.get_province_links()
        assert len(links) >= 6

    def test_provinces_get_count(self, driver):
        """Verify get_province_count() maps accurately with target links array sizes."""
        provinces = ProvincesPage(driver).open()
        
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: provinces.get_province_count() >= 6
        )
        count = provinces.get_province_count()
        links = provinces.get_province_links()
        assert count == len(links), "Data synchronization issue across POM counting arrays"

    def test_provinces_click_first(self, driver):
        """Verify clicking a province shifts routing to detail view structures."""
        provinces = ProvincesPage(driver).open()
        
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: provinces.get_province_count() > 0
        )
        detail = provinces.click_province(0)
        
        # Sync validation ensuring router settled safely on target detail route
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("/provinces/"))
        assert detail is not None
        assert "/provinces/" in driver.current_url


class TestNavbarPOM:
    """Validate all shared Navbar utility redirections across router paths."""

    def test_navbar_go_explore(self, driver):
        """Verify go_explore() safely routes context target objects."""
        driver.get(BASE_URL)
        navbar = Navbar(driver)
        page = navbar.go_explore()
        
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))
        assert isinstance(page, ExplorePage), "Page factory abstraction returned wrong model instance type"
        assert "explore" in driver.current_url.lower()

    def test_navbar_go_provinces(self, driver):
        """Verify go_provinces() triggers route matching mechanisms safely."""
        driver.get(BASE_URL)
        navbar = Navbar(driver)
        page = navbar.go_provinces()
        
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("provinces"))
        assert isinstance(page, ProvincesPage)
        assert "provinces" in driver.current_url.lower()

    def test_navbar_go_home(self, driver):
        """Verify go_home() resets route states back to entry endpoints."""
        driver.get(f"{BASE_URL}/explore")
        navbar = Navbar(driver)
        page = navbar.go_home()
        
        WebDriverWait(driver, EXPLICIT_WAIT).until(lambda d: "8080" in d.current_url)
        assert isinstance(page, HomePage)
        
        current = page.get_current_url().rstrip("/")
        assert current.endswith("8080") or current.endswith("8080/"), f"Base route reset tracking failed: {current}"