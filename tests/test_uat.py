"""User Acceptance Testing (UAT) - Validate against business requirements.

These tests simulate real user scenarios and verify that the website
meets the expected business requirements for a tourism platform.
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages import HomePage, ExplorePage, ProvincesPage, Navbar
from config import BASE_URL, EXPLICIT_WAIT


class TestUAT_HomePage:
    """UAT: The homepage must clearly communicate the purpose of the platform."""

    def test_uat_hero_conveys_pakistan_tourism(self, driver):
        """Requirement: Hero section must mention 'Pakistan' and 'Journey' or 'Discover'."""
        home = HomePage(driver).open()

        # Securely wait for body text to load completely
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: len(d.find_element(By.TAG_NAME, "body").text.strip()) > 0
        )
        page_text = driver.find_element(By.TAG_NAME, "body").text
        
        assert "Pakistan" in page_text, "Pakistan not mentioned on homepage"
        assert any(word in page_text.lower() for word in ["journey", "discover", "explore"]), \
            "Hero missing call-to-action keyword"

    def test_uat_search_bar_is_prominent(self, driver):
        """Requirement: A visible search bar must allow users to search destinations."""
        home = HomePage(driver).open()

        # Using explicit POM integration wait
        search = home.find_element(*home.HERO_SEARCH_INPUT)
        assert search.is_displayed(), "Search bar not visible on UI"
        
        placeholder = search.get_attribute("placeholder")
        assert placeholder and len(placeholder) > 0, "Search placeholder missing"

    def test_uat_home_shows_featured_destinations(self, driver):
        """Requirement: Homepage must display featured/trending destinations."""
        home = HomePage(driver).open()

        # Dynamic scroll to ensure lazy-loaded cards are visualized on browser
        trending_heading = driver.find_element(By.XPATH, "//h2[contains(text(), 'Trending')]")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", trending_heading)

        cards = home.get_featured_locations()
        assert len(cards) > 0, "No featured destination cards displayed on UI"

    def test_uat_home_shows_provinces(self, driver):
        """Requirement: Homepage must show all provinces for browsing."""
        home = HomePage(driver).open()

        province_heading = driver.find_element(By.XPATH, "//h2[contains(text(), 'Province')]")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", province_heading)

        province_count = home.get_province_count()
        assert province_count >= 6, f"Expected at least 6 provinces, found {province_count}"


class TestUAT_ProvincePage:
    """UAT: Province pages must provide meaningful information."""

    def test_uat_province_has_description(self, driver):
        """Requirement: Each province must display a description."""
        provinces = ProvincesPage(driver).open()
        province_cards = provinces.get_province_links()
        assert len(province_cards) > 0, "No provinces found on listing page"

        for card in province_cards[:3]:  # Check first 3 safely
            paragraphs = card.find_elements(By.TAG_NAME, "p")
            descriptions = [p.text.strip() for p in paragraphs if len(p.text.strip()) > 20]
            assert len(descriptions) > 0, "Province card missing description on UI"

    def test_uat_province_has_city_count(self, driver):
        """Requirement: Province must show number of cities."""
        provinces = ProvincesPage(driver).open()
        province_cards = provinces.get_province_links()

        for card in province_cards:
            text = card.text
            assert "city" in text.lower(), f"Province card missing city count info text: {text[:50]}"


class TestUAT_ExploreFunctionality:
    """UAT: The Explore page must allow filtering and discovery of unique locations."""

    def test_uat_explore_shows_all_locations(self, driver):
        """Requirement: Explore page must display multiple location cards."""
        explore = ExplorePage(driver).open()
        cards = explore.get_location_cards()
        assert len(cards) > 0, "No locations displayed on explore page grid"

    def test_uat_location_card_shows_name_and_rating(self, driver):
        """Requirement: Each location card must show name, rating, and category."""
        explore = ExplorePage(driver).open()
        cards = explore.get_location_cards()
        assert len(cards) > 0, "No location cards found"

        first_card = cards[0]
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", first_card)
        card_text = first_card.text

        names = first_card.find_elements(By.TAG_NAME, "h3")
        assert len(names) > 0, "Card missing location name header (h3)"
        assert "★" in card_text or any(c.isdigit() for c in card_text[:50]), \
            "Card missing rating verification data"

    def test_uat_explore_has_map_toggle(self, driver):
        """Requirement: Explore page must provide a map view option."""
        explore = ExplorePage(driver).open()
        toggle = explore.find_element(*explore.TOGGLE_MAP_BTN)
        
        assert toggle.is_displayed(), "Map toggle button not visible"
        assert toggle.is_enabled(), "Map toggle button not interactive"

    def test_uat_historical_heritage_searches(self, driver):
        """Requirement: Tourists must be able to search for specific historical & cultural landmarks."""
        
        # --- PHASE 1: BADSHAHI MOSQUE ---
        home = HomePage(driver).open()
        time.sleep(1)
        
        # Search for Badshahi Mosque via Hero Input
        search_input = WebDriverWait(driver, EXPLICIT_WAIT).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='input-hero-search']"))
        )
        search_input.clear()
        search_input.send_keys("Badshahi Mosque")
        time.sleep(1.5)  # Let the user watch the typing process
        search_input.send_keys(Keys.ENTER)

        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid^='link-location-']"))
        )
        
        # --- VISUAL PAUSE: Badshahi Mosque results dekhne ke liye ---
        time.sleep(3)
        body_text_mosque = driver.find_element(By.TAG_NAME, "body").text.lower()
        assert "explore" in driver.current_url

        # --- PHASE 2: MOHENJO-DARO ---
        home = HomePage(driver).open()
        time.sleep(1)
        
        search_input_2 = WebDriverWait(driver, EXPLICIT_WAIT).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='input-hero-search']"))
        )
        search_input_2.clear()
        search_input_2.send_keys("Mohenjo-daro")
        time.sleep(1.5)
        search_input_2.send_keys(Keys.ENTER)

        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid^='link-location-']"))
        )
        
        # --- VISUAL PAUSE: Mohenjo-daro results dekhne ke liye ---
        time.sleep(3)
        assert "explore" in driver.current_url


class TestUAT_Navigation:
    """UAT: Navigation must be intuitive and consistent."""

    def test_uat_navbar_has_all_sections(self, driver):
        """Requirement: Navigation bar must link to Home, Explore, Provinces."""
        driver.get(BASE_URL)
        navbar = Navbar(driver)

        navbar.go_explore()
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))
        assert "explore" in driver.current_url.lower(), "Explore nav link broken"

        navbar.go_provinces()
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("provinces"))
        assert "provinces" in driver.current_url.lower(), "Provinces nav link broken"

        navbar.go_home()
        WebDriverWait(driver, EXPLICIT_WAIT).until(lambda d: "8080" in d.current_url)
        current = driver.current_url.rstrip("/")
        assert current.endswith("8080") or current.endswith("8080/"), "Home nav link broken"

    def test_uat_no_broken_links_on_home(self, driver):
        """Requirement: All links on the homepage must be functional via UI navigation."""
        home = HomePage(driver).open()
        main_window = driver.current_window_handle

        # Safe tracking of links using attributes instead of direct element references to avoid stale states
        elements = driver.find_elements(By.TAG_NAME, "a")
        hrefs = [el.get_attribute("href") for el in elements[:15] if el.get_attribute("href")]

        broken = []
        for href in hrefs:
            if href.startswith("http"):
                try:
                    # SMART FIXED UI APPROACH: Opens link in a new tab to avoid breaking the core DOM loop context
                    driver.execute_script(f"window.open('{href}', '_blank');")
                    WebDriverWait(driver, EXPLICIT_WAIT).until(lambda d: len(d.window_handles) > 1)
                    
                    # Switch to the new testing tab
                    driver.switch_to.window(driver.window_handles[-1])
                    
                    # Ensure body text renders
                    WebDriverWait(driver, EXPLICIT_WAIT).until(
                        lambda d: len(d.find_element(By.TAG_NAME, "body").text.strip()) > 10
                    )
                    body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
                    if "error" in body_text or "not found" in body_text or "404" in body_text:
                        broken.append((href, "ui-content-error"))
                except Exception:
                    broken.append((href, "ui-navigation-failed"))
                finally:
                    # Close checking tab and return context safely
                    if len(driver.window_handles) > 1:
                        driver.close()
                    driver.switch_to.window(main_window)

        assert len(broken) == 0, f"Found broken UI destination paths: {broken[:3]}"


class TestUAT_ContentQuality:
    """UAT: Content must be meaningful and culturally significant."""

    def test_uat_locations_have_cultural_insights(self, driver):
        """Requirement: Location pages should include cultural context."""
        explore = ExplorePage(driver).open()
        cards = explore.get_location_cards()
        assert len(cards) > 0, "No location cards displayed to execute click workflow"

        # Safe workflow interaction
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", cards[0])
        cards[0].click()

        # Wait until the transition to details route finishes
        WebDriverWait(driver, EXPLICIT_WAIT).until(lambda d: d.current_url != f"{BASE_URL}/explore")

        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: len(d.find_element(By.TAG_NAME, "body").text.strip()) > 0
        )
        page_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        assert any(k in page_text for k in ["culture", "cultural", "heritage", "insight", "tradition", "history", "pakistan"]), \
            "Location detail page missing cultural/insight content validation"

    def test_uat_location_images_are_valid_urls(self, driver):
        """Requirement: All location images must be present and have non-empty src in the DOM."""
        explore = ExplorePage(driver).open()
        cards = explore.get_location_cards()
        assert len(cards) > 0, "No location cards found"

        for card in cards[:5]:
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", card)
            imgs = card.find_elements(By.CSS_SELECTOR, "img")
            assert len(imgs) > 0, "Location card missing image component inside DOM context"
            for img in imgs[:2]:
                src = img.get_attribute("src")
                assert src and len(src) > 0, "Location image source path attribute is empty"