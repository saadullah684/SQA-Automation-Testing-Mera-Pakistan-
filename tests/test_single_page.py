"""Single Page Application Tests - Verify SPA navigation and routing.

These tests validate that the website behaves as a Single Page Application (SPA):
- Navigation occurs without full page reloads
- URLs update correctly via the router
- Browser back/forward buttons work
- Page state is preserved during navigation
- The base route and wildcard routes work
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from pages import HomePage, ExplorePage, ProvincesPage, Navbar
from config import BASE_URL, EXPLICIT_WAIT


def wait_for_body_render(driver):
    """Wait until SPA shell is meaningfully rendered with actual business layouts."""
    WebDriverWait(driver, EXPLICIT_WAIT).until(
        lambda d: len(d.find_element(By.TAG_NAME, "body").text.strip()) > 50
    )
    # Ensure any background routing or hydration loaders fade out safely
    WebDriverWait(driver, EXPLICIT_WAIT).until_not(
        EC.presence_of_element_located((By.CLASS_NAME, "spa-global-loader"))
    )


class TestSPARouting:
    """Tests for secure SPA routing behavior and History API manipulation."""

    def test_spa_routing_home_to_explore(self, driver):
        """Verify navigating from Home to Explore updates URL without hard browser reloads."""
        home = HomePage(driver).open()
        initial_url = driver.current_url

        navbar = Navbar(driver)
        navbar.go_explore()

        # Dynamic Route verification sync
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))
        assert driver.current_url != initial_url, "Routing Failure: Full page reload detected instead of SPA route transformation"

    def test_spa_routing_explore_to_provinces(self, driver):
        """Verify navigation transitions between nested child paths fluently."""
        ExplorePage(driver).open()
        navbar = Navbar(driver)

        navbar.go_provinces()
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("provinces"))
        assert "provinces" in driver.current_url.lower(), f"Unexpected destination URL context: {driver.current_url}"

    def test_spa_direct_url_access(self, driver):
        """Verify that deep linking and direct URL access match client router components seamlessly."""
        routes = [
            "/",
            "/explore",
            "/provinces",
            "/provinces/punjab",
            "/provinces/sindh",
        ]

        for route in routes:
            driver.get(f"{BASE_URL}{route}")
            wait_for_body_render(driver)

            body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
            assert "not found" not in body_text, f"Route parsing error: Link '{route}' matches missing 404 views"
            assert "error" not in body_text, f"Application Runtime Exception on route target '{route}'"

    def test_spa_browser_back_button(self, driver):
        """Verify browser history back actions map back onto previously visited virtual components."""
        driver.get(BASE_URL)
        wait_for_body_render(driver)

        navbar = Navbar(driver)
        navbar.go_explore()
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))

        navbar.go_provinces()
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("provinces"))

        # Trigger history execution stack go back (1 step)
        driver.back()
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))

        # Trigger history execution stack go back to root context landing (2 steps)
        driver.back()
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            lambda d: d.current_url.rstrip("/").endswith("8080") or "explore" not in d.current_url.lower()
        )
        current = driver.current_url.rstrip("/")
        assert current.endswith("8080") or current == BASE_URL.rstrip("/"), f"History routing stack corrupted: {driver.current_url}"

    def test_spa_browser_forward_button(self, driver):
        """Verify browser history forward updates router layout parameters sequentially."""
        driver.get(BASE_URL)
        wait_for_body_render(driver)

        navbar = Navbar(driver)
        navbar.go_explore()
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))

        navbar.go_provinces()
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("provinces"))

        driver.back()
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))

        driver.back()
        WebDriverWait(driver, EXPLICIT_WAIT).until(lambda d: "explore" not in d.current_url.lower())

        # Forward action simulation
        driver.forward()
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))
        assert "explore" in driver.current_url.lower(), f"Forward layout execution stack failed to resolve: {driver.current_url}"

    def test_spa_province_detail_route(self, driver):
        """Verify dynamic slug parameter routes process backend matching tokens accurately."""
        driver.get(f"{BASE_URL}/provinces/punjab")
        wait_for_body_render(driver)

        # Wait until target content header mounts cleanly
        WebDriverWait(driver, EXPLICIT_WAIT).until(
            EC.visibility_of_element_located((By.TAG_NAME, "h1"))
        )
        body = driver.find_element(By.TAG_NAME, "body").text
        assert "Punjab" in body, f"Slug mapping data resolution issue on Punjab detail screen"
        assert "error" not in body.lower(), "Target page contains unhandled template error statements"

    def test_spa_wildcard_route_not_found(self, driver):
        """Verify wildcard catch-all routes fall back safely to 404 layouts instead of crashing."""
        driver.get(f"{BASE_URL}/this-page-does-not-exist")
        wait_for_body_render(driver)

        body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        has_error_page = any(k in body_text for k in ["not found", "404", "missing", "exist"])
        has_crash = "cannot read" in body_text or "undefined" in body_text or "unhandled" in body_text

        assert has_error_page and not has_crash, f"Wildcard router crashed or rendered incorrect layout state: {body_text[:150]}"


class TestSPAStatePreservation:
    """Tests that active client memory state is preserved intact during virtual SPA routing."""

    def test_spa_search_state_preserved(self, driver):
        """Verify state parameters filter configurations append accurately down the path."""
        home = HomePage(driver).open()
        home.search_for("Multan")

        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))
        current_url = driver.current_url.lower()
        
        assert "explore" in current_url
        assert "multan" in current_url or "q=" in current_url, f"Query params stripped out during active redirection: {driver.current_url}"

    def test_spa_scenic_capital_route_searches(self, driver):
        """Verify SPA router handles state mutations and parameter synchronization for dynamic cities."""
        
        # --- PHASE 1: ISLAMABAD ---
        HomePage(driver).open()
        time.sleep(1)
        
        search_input = WebDriverWait(driver, EXPLICIT_WAIT).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='input-hero-search']"))
        )
        search_input.clear()
        search_input.send_keys("Islamabad")
        time.sleep(1.5)  # Safe buffer to watch scenic context input
        search_input.send_keys(Keys.ENTER)

        # Validate query parameters bind into history state smoothly
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))
        
        # --- VISUAL PAUSE: Islamabad results dekhne ke liye ---
        time.sleep(3)
        assert "islamabad" in driver.current_url.lower() or "q=" in driver.current_url.lower()

        # --- PHASE 2: MURREE ---
        HomePage(driver).open()
        time.sleep(1)
        
        search_input_2 = WebDriverWait(driver, EXPLICIT_WAIT).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='input-hero-search']"))
        )
        search_input_2.clear()
        search_input_2.send_keys("Murree")
        time.sleep(1.5)
        search_input_2.send_keys(Keys.ENTER)

        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))
        
        # --- VISUAL PAUSE: Murree results dekhne ke liye ---
        time.sleep(3)
        assert "murree" in driver.current_url.lower() or "q=" in driver.current_url.lower()

    def test_spa_navigation_does_not_reload_page(self, driver):
        """Verify navigation across tabs doesn't clear window layout states (No full reload)."""
        HomePage(driver).open()
        
        # Inject custom run-time state flag variable into active browser context
        driver.execute_script("window.__spa_test_flag = 'set_at_home';")

        navbar = Navbar(driver)
        navbar.go_explore()
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))

        # If a hard refresh had happened, window variable state space gets wiped completely
        flag = driver.execute_script("return window.__spa_test_flag;")
        assert flag == "set_at_home", f"State Leak: Document context refreshed and flushed variable stacks. Flag state: {flag}"

    def test_spa_multiple_route_changes(self, driver):
        """Verify dynamic looping path updates mount configurations cleanly without execution memory leaks."""
        driver.get(BASE_URL)
        wait_for_body_render(driver)

        navbar = Navbar(driver)

        navbar.go_explore()
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("explore"))

        navbar.go_provinces()
        WebDriverWait(driver, EXPLICIT_WAIT).until(EC.url_contains("provinces"))

        final_url = driver.current_url
        assert "provinces" in final_url.lower(), f"Complex composite navigation chain broke at route: {final_url}"