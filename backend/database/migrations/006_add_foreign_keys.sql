-- Add foreign key constraints after all tables are created

ALTER TABLE members
ADD CONSTRAINT fk_members_membership_type
FOREIGN KEY (membership_type_id) REFERENCES membership_types(id) ON DELETE SET NULL;

ALTER TABLE payments
ADD CONSTRAINT fk_payments_member
FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

ALTER TABLE payments
ADD CONSTRAINT fk_payments_membership_type
FOREIGN KEY (membership_type_id) REFERENCES membership_types(id) ON DELETE SET NULL;

ALTER TABLE event_registrations
ADD CONSTRAINT fk_event_registrations_event
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

ALTER TABLE event_registrations
ADD CONSTRAINT fk_event_registrations_member
FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

ALTER TABLE event_registrations
ADD CONSTRAINT fk_event_registrations_payment
FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;
