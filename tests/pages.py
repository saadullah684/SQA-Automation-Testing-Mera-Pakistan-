"""Page Object Model classes for My-Pakistan website."""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from config import EXPLICIT_WAIT


class BasePage:
    """Base class for all page objects."""

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, EXPLICIT_WAIT)

    def find_element(self, by, value, timeout=EXPLICIT_WAIT):
        """Wait for element to be visible and return it."""
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located((by, value))
            )
        except TimeoutException:
            raise AssertionError(f"Element not visible on UI: {by}={value}")

    def find_clickable(self, by, value, timeout=EXPLICIT_WAIT):
        """Wait for clickable element and return it."""
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable((by, value))
            )
        except TimeoutException:
            raise AssertionError(f"Element not clickable: {by}={value}")

    def find_elements(self, by, value, timeout=EXPLICIT_WAIT):
        """Wait for all elements to be visible and return list."""
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_all_elements_located((by, value))
            )
        except TimeoutException:
            return []  # Return empty list if no elements appear

    def get_text(self, by, value):
        """Get text of an element."""
        return self.find_element(by, value).text

    def is_element_present(self, by, value, timeout=3):
        """Check if element is visible without throwing an error."""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located((by, value))
            )
            return True
        except TimeoutException:
            return False

    def click(self, by, value):
        """Click an element safely."""
        self.find_clickable(by, value).click()

    def type_text(self, by, value, text):
        """Type text into an input field securely."""
        el = self.find_clickable(by, value)
        el.clear()
        el.send_keys(text)
        return el

    def get_title(self):
        return self.driver.title

    def get_current_url(self):
        return self.driver.current_url


class HomePage(BasePage):
    """Page Object for the Home page."""

    HERO_SEARCH_INPUT = (By.CSS_SELECTOR, "[data-testid='input-hero-search']")
    HERO_SEARCH_BTN = (By.CSS_SELECTOR, "[data-testid='btn-hero-search']")
    VIEW_ALL_FEATURED = (By.CSS_SELECTOR, "[data-testid='link-view-all-featured']")
    FEATURED_CARDS = (By.CSS_SELECTOR, "[data-testid^='link-location-']")
    PROVINCE_LINKS = (By.CSS_SELECTOR, "[data-testid^='link-province-']")
    HERO_HEADING = (By.TAG_NAME, "h1")

    def open(self):
        from config import BASE_URL
        self.driver.get(BASE_URL)
        return self

    def get_hero_heading(self):
        return self.get_text(*self.HERO_HEADING)

    def search_for(self, query):
        self.type_text(*self.HERO_SEARCH_INPUT, query)
        self.click(*self.HERO_SEARCH_BTN)
        return self

    def get_featured_locations(self):
        return self.find_elements(*self.FEATURED_CARDS)

    def get_province_links(self):
        return self.find_elements(*self.PROVINCE_LINKS)

    def get_featured_count(self):
        return len(self.get_featured_locations())

    def get_province_count(self):
        return len(self.get_province_links())

    def click_view_all(self):
        self.click(*self.VIEW_ALL_FEATURED)
        return ExplorePage(self.driver)


class ExplorePage(BasePage):
    """Page Object for the Explore page."""

    SEARCH_INPUT = (By.CSS_SELECTOR, "[data-testid='input-hero-search']")
    CATEGORY_SELECT = (By.CSS_SELECTOR, "[data-testid='select-category']")
    PROVINCE_SELECT = (By.CSS_SELECTOR, "[data-testid='select-province']")
    LOCATION_CARDS = (By.CSS_SELECTOR, "[data-testid^='link-location-']")
    TOGGLE_MAP_BTN = (By.CSS_SELECTOR, "[data-testid='btn-toggle-map']")
    CLEAR_FILTERS_BTN = (By.CSS_SELECTOR, "[data-testid='btn-clear-filters']")

    def open(self):
        from config import BASE_URL
        self.driver.get(f"{BASE_URL}/explore")
        return self

    def get_location_cards(self):
        return self.find_elements(*self.LOCATION_CARDS)

    def get_location_count(self):
        return len(self.get_location_cards())

    def clear_filters(self):
        if self.is_element_present(*self.CLEAR_FILTERS_BTN):
            self.click(*self.CLEAR_FILTERS_BTN)

    def toggle_map(self):
        self.click(*self.TOGGLE_MAP_BTN)


class ProvincesPage(BasePage):
    """Page Object for the Provinces listing page."""

    PROVINCE_LINKS = (By.CSS_SELECTOR, "[data-testid^='link-province-']")
    PAGE_HEADING = (By.TAG_NAME, "h1")

    def open(self):
        from config import BASE_URL
        self.driver.get(f"{BASE_URL}/provinces")
        return self

    def get_heading(self):
        return self.get_text(*self.PAGE_HEADING)

    def get_province_links(self):
        return self.find_elements(*self.PROVINCE_LINKS)

    def get_province_count(self):
        return len(self.get_province_links())

    def click_province(self, index=0):
        links = self.get_province_links()
        if links and index < len(links):
            links[index].click()
            return ProvinceDetailPage(self.driver)
        return None


class ProvinceDetailPage(BasePage):
    """Page Object for a single province detail page."""

    PROVINCE_NAME = (By.TAG_NAME, "h1")
    # FIX: Corrected locator to target city cards instead of duplicating province links
    CITY_CARDS = (By.CSS_SELECTOR, "[data-testid^='link-city-']") 
    LOCATION_CARDS = (By.CSS_SELECTOR, "[data-testid^='link-location-']")

    def get_province_name(self):
        return self.get_text(*self.PROVINCE_NAME)

    def get_city_cards(self):
        return self.find_elements(*self.CITY_CARDS)

    def get_location_cards(self):
        return self.find_elements(*self.LOCATION_CARDS)


class Navbar(BasePage):
    """Page Object for the main navigation bar."""

    HOME_LINK = (By.LINK_TEXT, "Home")
    EXPLORE_LINK = (By.LINK_TEXT, "Explore")
    PROVINCES_LINK = (By.LINK_TEXT, "Provinces")

    def go_home(self):
        self.click(*self.HOME_LINK)
        return HomePage(self.driver)

    def go_explore(self):
        self.click(*self.EXPLORE_LINK)
        return ExplorePage(self.driver)

    def go_provinces(self):
        self.click(*self.PROVINCES_LINK)
        return ProvincesPage(self.driver)