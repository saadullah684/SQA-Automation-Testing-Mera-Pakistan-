"""Functional Tests - Test complete user workflows end-to-end."""

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages import HomePage, ExplorePage, ProvincesPage, Navbar
from config import BASE_URL, EXPLICIT_WAIT


class TestUserJourney:
    """Complete user journey through the main website flow."""

    def test_complete_user_journey_home_to_explore(self, driver):
        """User lands on home, sees hero, scrolls, clicks View All, lands on Explore."""
        home = HomePage(driver).open()

        # Step 1: Hero section is visible with heading
        heading = home.get_hero_heading()
        assert heading, "Hero heading is empty"
        assert "Pakistan" in heading

        # Step 2: Search bar is present and interactive
        search_bar = home.find_element(*home.HERO_SEARCH_INPUT)
        assert search_bar.is_displayed(), "Search bar not visible"
        assert search_bar.is_enabled(), "Search bar not enabled"

        # Step 3: Scroll to featured section smoothly
        featured_section = driver.find_element(By.XPATH, "//h2[contains(text(), 'Trending')]")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", featured_section)
        assert featured_section.is_displayed(), "Featured section heading not visible"

        # Step 4: Featured locations are rendered
        featured_cards = home.get_featured_locations()
        assert len(featured_cards) > 0, "No featured location cards found"

        # Step 5: Click "View All" via POM method to transition to Explore page cleanly
        explore_page = home.click_view_all()
        
        # Explicitly wait for transition route synchronization
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))
        assert "explore" in driver.current_url.lower(), "Didn't navigate to Explore page"

    def test_province_exploration_flow(self, driver):
        """User navigates to Provinces, clicks one, sees cities and locations."""
        provinces_page = ProvincesPage(driver).open()

        # Step 1: Verify province heading
        heading = provinces_page.get_heading()
        assert "province" in heading.lower() or "region" in heading.lower()

        # Step 2: Verify province list count
        province_count = provinces_page.get_province_count()
        assert province_count >= 6, f"Expected at least 6 provinces, found {province_count}"

        # Step 3: Extract province names from the page securely
        province_cards = provinces_page.get_province_links()
        province_names = []
        for card in province_cards:
            name_el = card.find_element(By.TAG_NAME, "h2")
            province_names.append(name_el.text.strip())

        assert "Punjab" in province_names, "Punjab not found in province list"

        # Step 4: Click first province and fetch detail page context
        detail_page = provinces_page.click_province(0)
        
        # Wait for detail route parsing
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("/provinces/"))
        assert "/provinces/" in driver.current_url, f"Unexpected URL structure: {driver.current_url}"

        # Step 5: Verify province name visible on detail page
        detail_heading = driver.find_element(By.TAG_NAME, "h1")
        assert detail_heading.is_displayed(), "Province detail heading not visible on page viewport"

    def test_search_functionality_flow(self, driver):
        """User performs a search and sees filtered results."""
        home = HomePage(driver).open()

        # Step 1: Search for a specific location using POM method
        home.search_for("Badshahi Mosque")

        # Step 2: Ensure router moved to explore page context
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))
        assert "explore" in driver.current_url.lower()

        # Step 3: Explicitly wait until filtered location cards load into the grid layout
        explore = ExplorePage(driver)
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: len(explore.get_location_cards()) > 0
        )
        cards = explore.get_location_cards()

        # Step 4: Validate text relevancy across matching UI results
        card_texts = " ".join([c.text.lower() for c in cards])
        assert any(k in card_texts for k in ["badshahi", "mosque", "lahore"]), \
            "Search results do not match query criteria on UI cards"

    def test_responsive_ui_elements(self, driver):
        """Verify that key UI elements are visible and interactive."""
        explore = ExplorePage(driver).open()

        # Step 1: Toggle map view using explicit POM call
        explore.toggle_map()
        
        # Wait until leaflet container maps render visible
        map_container = WebDriverWait(driver, EXPLICIT_WAIT).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "leaflet-container"))
        )
        assert map_container.is_displayed(), "Map container not visible after toggle trigger"

        # Step 2: Toggle back to grid view context layout smoothly
        explore.toggle_map()
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            EC.invisibility_of_element_located((By.CLASS_NAME, "leaflet-loading"))
        )

    def test_navigation_between_all_sections(self, driver):
        """User navigates through all main sections using the navbar."""
        home = HomePage(driver).open()
        navbar = Navbar(driver)

        pages = [
            ("/explore", navbar.go_explore),
            ("/provinces", navbar.go_provinces),
            ("/", navbar.go_home),
        ]

        for expected_path, nav_action in pages:
            nav_action()
            
            if expected_path == "/":
                WebDriverWait(driver, EXPLICIT_WAIT).until(lambda d: "8080" in d.current_url)
                current = driver.current_url.rstrip("/")
                assert current.endswith("8080") or current.endswith("8080/"), f"Expected home navigation context, got {current}"
            else:
                WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains(expected_path.lstrip("/")))
                assert expected_path in driver.current_url, f"Expected route {expected_path}, got target {driver.current_url}"

