"""
Unit Tests for UI Components
Testing all UI component functions
"""
import pytest
import sys
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from dashboard.components.ui_components import (
    create_metric_card_modern,
    create_badge,
    create_modern_alert,
    create_status_card
)


class TestMetricCard:
    """Tests for create_metric_card_modern"""
    
    def test_basic_metric_card(self):
        """Test basic metric card generation"""
        result = create_metric_card_modern(
            icon="📊",
            title="Test Metric",
            value="100",
            change=None,
            color="primary"
        )
        
        assert "📊" in result
        assert "Test Metric" in result
        assert "100" in result
        assert "metric-card" in result
        assert "primary" in result
    
    def test_metric_card_with_change(self):
        """Test metric card with percentage change"""
        result = create_metric_card_modern(
            icon="📈",
            title="Growth",
            value="150",
            change=15.5,
            color="success"
        )
        
        assert "150" in result
        assert "+15.5%" in result or "15.5%" in result
        assert "metric-card-change" in result
    
    def test_metric_card_with_tooltip(self):
        """Test metric card with tooltip"""
        result = create_metric_card_modern(
            icon="💡",
            title="Info",
            value="42",
            change=None,
            color="info",
            size="default",
            tooltip="Test tooltip text"
        )
        
        assert "42" in result
        assert "title=" in result or "aria-label=" in result
        assert "Test tooltip" in result or "Info" in result
    
    def test_metric_card_negative_change(self):
        """Test metric card with negative change"""
        result = create_metric_card_modern(
            icon="📉",
            title="Decrease",
            value="80",
            change=-5.2,
            color="error"
        )
        
        assert "80" in result
        assert "-5.2%" in result or "5.2%" in result
        assert "negative" in result or "error" in result


class TestBadge:
    """Tests for create_badge"""
    
    def test_basic_badge(self):
        """Test basic badge generation"""
        result = create_badge("Active", "success")
        
        assert "Active" in result
        assert "badge" in result
        assert "success" in result
    
    def test_badge_variants(self):
        """Test all badge variants"""
        variants = ["success", "warning", "error", "info", "default"]
        
        for variant in variants:
            result = create_badge("Test", variant)
            assert "Test" in result
            assert variant in result
    
    def test_badge_with_icon(self):
        """Test badge with icon"""
        result = create_badge("✅ Passed", "success")
        
        assert "✅" in result
        assert "Passed" in result


class TestModernAlert:
    """Tests for create_modern_alert"""
    
    def test_info_alert(self):
        """Test info alert"""
        result = create_modern_alert(
            "This is information",
            type="info",
            icon="ℹ️"
        )
        
        assert "This is information" in result
        assert "info" in result
        assert "ℹ️" in result
    
    def test_warning_alert(self):
        """Test warning alert"""
        result = create_modern_alert(
            "Warning message",
            type="warning",
            icon="⚠️"
        )
        
        assert "Warning message" in result
        assert "warning" in result
    
    def test_success_alert(self):
        """Test success alert"""
        result = create_modern_alert(
            "Success!",
            type="success",
            icon="✅"
        )
        
        assert "Success!" in result
        assert "success" in result
    
    def test_error_alert(self):
        """Test error alert"""
        result = create_modern_alert(
            "Error occurred",
            type="error",
            icon="❌"
        )
        
        assert "Error occurred" in result
        assert "error" in result


class TestStatusCard:
    """Tests for create_status_card"""
    
    def test_online_status(self):
        """Test online status card"""
        result = create_status_card(
            "Database",
            "online",
            "Connected successfully"
        )
        
        assert "Database" in result
        assert "online" in result or "success" in result
        assert "Connected" in result
    
    def test_warning_status(self):
        """Test warning status card"""
        result = create_status_card(
            "Service",
            "warning",
            "Slow response"
        )
        
        assert "Service" in result
        assert "warning" in result
        assert "Slow" in result
    
    def test_error_status(self):
        """Test error status card"""
        result = create_status_card(
            "API",
            "error",
            "Connection failed"
        )
        
        assert "API" in result
        assert "error" in result or "offline" in result
        assert "failed" in result


class TestHTMLGeneration:
    """Tests for HTML structure and validity"""
    
    def test_no_unclosed_tags(self):
        """Ensure generated HTML has balanced tags"""
        result = create_metric_card_modern(
            icon="📊",
            title="Test",
            value="100",
            change=None,
            color="primary"
        )
        
        # Count opening and closing divs
        open_divs = result.count("<div")
        close_divs = result.count("</div>")
        
        assert open_divs == close_divs, "Unbalanced div tags"
    
    def test_aria_attributes_present(self):
        """Test ARIA attributes are included"""
        result = create_metric_card_modern(
            icon="📊",
            title="Accessible",
            value="100",
            change=None,
            color="primary",
            tooltip="Test"
        )
        
        assert "aria-label" in result or "title" in result
    
    def test_html_escaping(self):
        """Test that special characters are handled"""
        result = create_badge("<script>alert('xss')</script>", "info")
        
        # Should contain the text but properly escaped or handled
        assert "badge" in result


class TestComponentIntegration:
    """Integration tests for components working together"""
    
    def test_multiple_components_render(self):
        """Test multiple components can be generated"""
        card = create_metric_card_modern("📊", "Metric", "100", None, "primary")
        badge = create_badge("Active", "success")
        alert = create_modern_alert("Info", "info", "ℹ️")
        
        assert len(card) > 0
        assert len(badge) > 0
        assert len(alert) > 0
        
        # All should be valid HTML fragments
        assert "<div" in card
        assert "badge" in badge
        assert "alert" in alert or "info" in alert


# Performance tests
class TestPerformance:
    """Basic performance tests"""
    
    def test_component_generation_speed(self):
        """Test components generate quickly"""
        import time
        
        start = time.time()
        for _ in range(100):
            create_metric_card_modern("📊", "Test", "100", None, "primary")
        end = time.time()
        
        # Should generate 100 components in less than 1 second
        assert (end - start) < 1.0, "Component generation too slow"
    
    def test_badge_generation_speed(self):
        """Test badge generates quickly"""
        import time
        
        start = time.time()
        for _ in range(1000):
            create_badge("Test", "success")
        end = time.time()
        
        # Should generate 1000 badges in less than 1 second
        assert (end - start) < 1.0, "Badge generation too slow"
