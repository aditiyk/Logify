from database import SessionLocal, init_db, Shipment, Route, Disruption

def seed_db():
    init_db()
    db = SessionLocal()
    
    if db.query(Shipment).first():
        db.close()
        return

    s1 = Shipment(master_tracking_id="MT-001", origin="Mumbai", destination="Delhi", current_status="In Transit", current_location="Nhava Sheva Port", priority="High", goods_sensitivity="High", expected_delivery_days=6)
    s2 = Shipment(master_tracking_id="MT-002", origin="Chennai", destination="Bangalore", current_status="At Port", current_location="Chennai Port", priority="Standard", goods_sensitivity="Medium", expected_delivery_days=5)
    s3 = Shipment(master_tracking_id="MT-003", origin="Kolkata", destination="Hyderabad", current_status="In Transit", current_location="Kolkata Port", priority="Low", goods_sensitivity="Low", expected_delivery_days=10)
    
    db.add_all([s1, s2, s3])
    db.commit()

    r1a = Route(shipment_id=s1.id, name="Sea/Rail Express (Current)", cost=1500, time_days=5, is_active=True, transport_mode="Sea")
    r1b = Route(shipment_id=s1.id, name="Air Freight (Alternative)", cost=4500, time_days=1, is_active=False, transport_mode="Air")
    r1c = Route(shipment_id=s1.id, name="Road Transport (Alternative)", cost=2000, time_days=8, is_active=False, transport_mode="Road")

    r2a = Route(shipment_id=s2.id, name="Road Standard (Current)", cost=800, time_days=2, is_active=True, transport_mode="Road")
    r2b = Route(shipment_id=s2.id, name="Rail Freight (Alternative)", cost=600, time_days=4, is_active=False, transport_mode="Road")
    
    r3a = Route(shipment_id=s3.id, name="Coastal Shipping (Current)", cost=1200, time_days=7, is_active=True, transport_mode="Sea")

    db.add_all([r1a, r1b, r1c, r2a, r2b, r3a])

    d1 = Disruption(location="Nhava Sheva Port", description="Severe weather causing port congestion", delay_days=5, disruption_type="Weather", severity_multiplier=2.0)
    d2 = Disruption(location="Chennai Port", description="Customs strike", delay_days=3, disruption_type="Strike", severity_multiplier=1.5)

    db.add_all([d1, d2])
    db.commit()
    db.close()
    print("Database seeded with mock data.")

if __name__ == "__main__":
    seed_db()
