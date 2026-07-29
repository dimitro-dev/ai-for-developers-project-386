namespace MiniCal;

/** Guest contact details stored as a snapshot within each Booking. */
model GuestDetails {
  /** Guest name (required). */
  name: string;

  /** Guest email (required). */
  email: string;

  /** Optional note from the guest. */
  note?: string;
}

/**
 * A computed available time slot for a given event type.
 * Slots are not persisted; they are computed on the fly by the server
 * based on owner settings, event type duration, and existing bookings.
 */
model Slot {
  /** Slot start instant in UTC. */
  startAtUtc: utcDateTime;

  /** Slot end instant in UTC (startAtUtc + eventType.durationMinutes). */
  endAtUtc: utcDateTime;

  /** The event type id this slot is computed for. */
  eventTypeId: string;
}

/** A confirmed booking that locks a time interval for a guest. */
model Booking {
  /** Unique booking identifier (UUID). */
  id: string;

  /** Reference to the event type. */
  eventTypeId: string;

  /** Booking start instant in UTC. */
  startAtUtc: utcDateTime;

  /** Booking end instant in UTC (computed by the server). */
  endAtUtc: utcDateTime;

  /** Guest name at time of booking. */
  guestName: string;

  /** Guest email at time of booking. */
  guestEmail: string;

  /** Optional note left by the guest. */
  guestNote?: string;

  /** Timestamp when the booking was created. */
  createdAtUtc: utcDateTime;
}

/** Request payload to create a new booking. */
model CreateBookingRequest {
  /** Reference to the event type to book. */
  eventTypeId: string;

  /** Desired booking start instant in UTC. Server computes endAtUtc. */
  startAtUtc: utcDateTime;

  /**
   * Optional idempotency key (UUID).
   * If provided and a booking with this id already exists,
   * the request fails with DUPLICATE_BOOKING_ID.
   */
  id?: Uuid;

  /** Guest contact details. */
  guest: GuestDetails;
}
