"""Unit Tests - Test individual components and functions in isolation."""

import pytest
import requests
from config import API_URL, BASE_URL, PROVINCES, EXPECTED_CATEGORIES


class TestAPIHealth:
    """Unit tests for API health endpoint."""

    def test_api_health_endpoint(self):
        """Verify API health endpoint returns ok status."""
        response = requests.get(f"{API_URL}/api/healthz", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"

    def test_frontend_responds(self):
        """Verify frontend is accessible."""
        response = requests.get(BASE_URL, timeout=10)
        assert response.status_code == 200
        assert "Pakistan" in response.text


class TestProvincesData:
    """Unit tests for provinces API data structure."""

    def test_provinces_list_returns_data(self):
        """Verify provinces endpoint returns list of provinces."""
        response = requests.get(f"{API_URL}/api/provinces", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 6  # Pakistan has 6 provinces/territories

    def test_province_has_required_fields(self):
        """Verify each province has all required fields."""
        response = requests.get(f"{API_URL}/api/provinces", timeout=10)
        provinces = response.json()
        for province in provinces:
            assert "id" in province
            assert "name" in province
            assert "slug" in province
            assert "description" in province
            assert "imageUrl" in province
            assert "cityCount" in province
            assert province["slug"] in PROVINCES, f"Unexpected slug: {province['slug']}"

    def test_province_valid_image_urls(self):
        """Verify all province image URLs are valid."""
        response = requests.get(f"{API_URL}/api/provinces", timeout=10)
        provinces = response.json()
        for province in provinces:
            assert province["imageUrl"].startswith("http"), f"Invalid image URL for {province['name']}"


class TestLocationsData:
    """Unit tests for locations API data structure."""

    def test_featured_locations_return_data(self):
        """Verify featured locations endpoint works."""
        response = requests.get(f"{API_URL}/api/locations/featured", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_location_has_required_fields(self):
        """Verify each location has all required fields."""
        response = requests.get(f"{API_URL}/api/locations", timeout=10)
        locations = response.json()
        assert len(locations) > 0, "No locations returned"
        for location in locations:
            assert "id" in location
            assert "name" in location
            assert "city" in location
            assert "province" in location
            assert "category" in location
            assert "description" in location
            assert "imageUrl" in location
            assert "rating" in location

    def test_location_valid_categories(self):
        """Verify location categories match expected values."""
        response = requests.get(f"{API_URL}/api/locations", timeout=10)
        locations = response.json()
        for location in locations:
            assert location["category"] in EXPECTED_CATEGORIES, \
                f"Invalid category '{location['category']}' for {location['name']}"

    def test_locations_sorted_by_rating_desc(self):
        """Verify locations are sorted by rating descending (highest first).

        Note: Some APIs return results sorted, but ties or floating precision can
        occasionally cause near-equal ordering differences. We allow a small epsilon.
        """
        response = requests.get(f"{API_URL}/api/locations", timeout=10)
        locations = response.json()

        ratings = [loc["rating"] for loc in locations]
        sorted_ratings = sorted(ratings, reverse=True)

        # Use tolerance for float comparisons.
        eps = 1e-9
        assert len(ratings) == len(sorted_ratings)
        for a, b in zip(ratings, sorted_ratings):
            assert abs(a - b) <= eps, "Locations not sorted by rating descending"


    def test_location_filter_by_province(self):
        """Verify filtering locations by province works."""
        response = requests.get(f"{API_URL}/api/locations?province=Punjab", timeout=10)
        assert response.status_code == 200
        locations = response.json()
        for loc in locations:
            assert loc["province"].lower() == "punjab", \
                f"Location {loc['name']} not in Punjab"

    def test_location_filter_by_category(self):
        """Verify filtering locations by category works."""
        response = requests.get(f"{API_URL}/api/locations?category=monument", timeout=10)
        assert response.status_code == 200
        locations = response.json()
        for loc in locations:
            assert loc["category"] == "monument", \
                f"Location {loc['name']} is not a monument"

    def test_location_search_by_query(self):
        """Verify searching locations by query string works."""
        response = requests.get(f"{API_URL}/api/locations?q=Lahore", timeout=10)
        assert response.status_code == 200
        locations = response.json()
        assert len(locations) > 0
        for loc in locations:
            found = (
                "Lahore" in loc.get("name", "") or
                "Lahore" in loc.get("city", "") or
                "Lahore" in loc.get("province", "") or
                "Lahore" in loc.get("description", "")
            )
            assert found, f"Location {loc['name']} doesn't match query 'Lahore'"

    def test_single_location_by_id(self):
        """Verify fetching a single location by ID works."""
        response = requests.get(f"{API_URL}/api/locations", timeout=10)
        locations = response.json()
        if locations:
            loc_id = locations[0]["id"]
            response = requests.get(f"{API_URL}/api/locations/{loc_id}", timeout=10)
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == loc_id
            assert data["name"] == locations[0]["name"]


class TestCitiesData:
    """Unit tests for cities API."""

    def test_cities_by_province(self):
        """Verify cities can be fetched by province slug."""
        response = requests.get(f"{API_URL}/api/provinces/punjab/cities", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        for city in data:
            assert "id" in city
            assert "name" in city
            assert "province" in city
            assert "description" in city
            assert "imageUrl" in city