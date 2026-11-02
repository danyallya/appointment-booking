-- Keep stored intervals valid and serialize collision protection at the database boundary.
ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_interval_positive"
  CHECK ("endsAt" > "startsAt"),
  ADD CONSTRAINT "Appointment_active_no_overlap"
  EXCLUDE USING gist (
    tsrange("startsAt", "endsAt", '[)') WITH &&
  )
  WHERE ("status" IN ('REQUESTED'::"AppointmentStatus", 'CONFIRMED'::"AppointmentStatus"));
