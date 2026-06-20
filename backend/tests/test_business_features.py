from datetime import datetime, timedelta, timezone
from modules.business.models import Business, Offer

def test_business_offer_and_delivery_methods():
    future_date = datetime.now(timezone.utc) + timedelta(days=2)
    offer = Offer(title="10% OFF", discount="10%", expires_at=future_date)
    
    business = Business(
        name="Test",
        slug="test",
        category="Test",
        description="A"*10,
        owner="Owner",
        business_type="online",
        city="Santiago",
        delivery_methods=["store_pickup", "home_delivery"],
        delivery_scope="nationwide",
        active_offer=offer
    )
    
    assert business.active_offer.title == "10% OFF"
    assert "store_pickup" in business.delivery_methods
