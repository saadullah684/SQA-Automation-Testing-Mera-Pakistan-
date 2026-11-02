"""Integration Tests - Test interactions between components (API ↔ Frontend)."""

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages import HomePage, Navbar, ExplorePage, ProvincesPage
from config import BASE_URL, EXPLICIT_WAIT


class TestHomePageIntegration:
    """Tests the Home page data loading from API to UI."""

    def test_home_page_loads_with_API_data(self, driver):
        """Verify the home page loads API data and displays it in the UI."""
        home = HomePage(driver).open()

        # Check hero heading loads securely
        heading = home.get_hero_heading()
        assert "Pakistan" in heading, f"Hero heading missing 'Pakistan': {heading}"

        # Secure wait to guarantee API records rendered into cards
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: home.get_featured_count() > 0
        )
        featured_count = home.get_featured_count()
        assert featured_count > 0, f"Expected featured cards from API database, found {featured_count}"

    def test_provinces_section_renders_in_home(self, driver):
        """Verify province cards section renders in the UI."""
        home = HomePage(driver).open()

        # Wait till components complete mounting from API response
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: home.get_province_count() >= 6
        )
        province_count = home.get_province_count()
        assert province_count >= 6, \
            f"Expected at least 6 province cards mapped from API, found {province_count}"

    def test_navigation_links_work(self, driver):
        """Verify navigation between pages works smoothly using navbar interactions."""
        home = HomePage(driver).open()
        navbar = Navbar(driver)

        # Navigate to Explore route
        explore = navbar.go_explore()
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))
        assert "explore" in explore.get_current_url().lower()

        # Navigate to Provinces route
        provinces = navbar.go_provinces()
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("provinces"))
        assert "provinces" in provinces.get_current_url().lower()

        # Navigate back Home safely
        home = navbar.go_home()
        WebDriverWait(driver, EXPLICIT_WAIT).until(lambda d: "8080" in d.current_url)
        assert home.get_current_url().rstrip("/") == BASE_URL.rstrip("/")


class TestSearchFlow:
    """Tests the search functionality from UI to API data pipeline."""

    @pytest.mark.parametrize("query", ["Lahore", "Badshahi", "Karachi"])
    def test_search_via_home_redirects_to_explore(self, driver, query):
        """Verify typing a search on home redirects to explore with query context parameters."""
        home = HomePage(driver).open()
        home.search_for(query)

        # Route sync validation
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))
        current_url = driver.current_url
        
        assert "explore" in current_url.lower(), f"URL does not map to explore endpoint: {current_url}"
        assert query.lower() in current_url.lower() or "q=" in current_url.lower(), f"URL routing query token missed: {current_url}"

    def test_explore_page_shows_locations_after_search(self, driver):
        """Verify explore page renders location cards returned by backend search pipeline."""
        home = HomePage(driver).open()
        home.search_for("Lahore")

        # Explicitly wait until redirect route settles down
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))
        explore = ExplorePage(driver)
        
        # UI rendering sync from dynamic search data source
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: len(explore.get_location_cards()) > 0
        )
        cards = explore.get_location_cards()
        assert len(cards) > 0, "No location cards rendered for search request"

        card_texts = [card.text.lower() for card in cards]
        found = any(any(k in text for k in ["lahore", "badshahi", "mosque", "punjab"]) for text in card_texts)
        assert found, f"Integrational discrepancy: Search card text content validation mismatched: {card_texts[:2]}"


class TestProvinceNavigation:
    """Tests province links flow from home cards list directly to deep location detail pages."""

    def test_click_province_navigates_to_detail(self, driver):
        """Verify clicking a province card navigates to its corresponding detail page view."""
        home = HomePage(driver).open()
        
        # Correctly pull the section locators from the current active home context viewport
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: home.get_province_count() > 0
        )
        
        # Safely fetch the interactive link directly using standard test selectors
        first_province_card = driver.find_element(By.CSS_SELECTOR, "[data-testid^='link-province-']")
        href = first_province_card.get_attribute("href")
        assert "/provinces/" in href, f"Unexpected target dynamic navigation route link structure: {href}"
        
        # Real integration click simulation
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", first_province_card)
        first_province_card.click()
        
        # Sync router verification
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("/provinces/"))
        assert "/provinces/" in driver.current_url, f"Browser route failed to update path context: {driver.current_url}"


class TestExploreFilters:
    """Tests the explore page filter mechanics parsing backend data feeds."""

    def test_locations_load_in_explore_page(self, driver):
        """Verify explore page shows location cards fetched from core collection API."""
        explore = ExplorePage(driver).open()
        
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: explore.get_location_count() > 0
        )
        count = explore.get_location_count()
        assert count > 0, f"Expected active location items in DOM matrix grid layout, found {count}"

    def test_clear_filters_works(self, driver):
        """Verify the clear filters UI interaction works without wiping grid data model states."""
        explore = ExplorePage(driver).open()
        
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: explore.get_location_count() > 0
        )
        
        # Click action trigger
        explore.clear_filters()
        
        # Safe sync buffer checkpoint to ensure UI redraw finishes cleanly
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: explore.get_location_count() > 0
        )
        count = explore.get_location_count()
        assert count > 0, f"State Error: Grid reset broken or locations went missing after clearing filters: {count}"