-- Enforce the basic service invariants used by the public catalog.
ALTER TABLE "Service"
  ADD CONSTRAINT "Service_durationMinutes_positive"
  CHECK ("durationMinutes" > 0),
  ADD CONSTRAINT "Service_priceCents_nonnegative"
  CHECK ("priceCents" >= 0);

CREATE INDEX "Service_active_name_idx" ON "Service"("active", "name");
