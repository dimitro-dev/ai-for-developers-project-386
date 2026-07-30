namespace MiniCal;

/** Guest contact details stored as a snapshot within each Booking. */
model GuestDetails {
  /** Guest name (required). */
  @minLength(1)
  @maxLength(200)
  name: string;

  /** Guest email (required). */
  @minLength(1)
  @maxLength(320)
  @pattern("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
  email: string;

  /** Optional note from the guest. */
  @maxLength(5000)
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
  @maxLength(100)
  eventTypeId: string;
}

/** A confirmed booking that locks a time interval for a guest. */
model Booking {
  /** Unique booking identifier (UUID). */
  id: Uuid;

  /** Reference to the event type. */
  @maxLength(100)
  eventTypeId: string;

  /** Booking start instant in UTC. */
  startAtUtc: utcDateTime;

  /** Booking end instant in UTC (computed by the server). */
  endAtUtc: utcDateTime;

  /** Guest name at time of booking. */
  @minLength(1)
  @maxLength(200)
  guestName: string;

  /** Guest email at time of booking. */
  @minLength(1)
  @maxLength(320)
  guestEmail: string;

  /** Optional note left by the guest. */
  @maxLength(5000)
  guestNote?: string;

  /** Timestamp when the booking was created. */
  createdAtUtc: utcDateTime;
}

/** Request payload to create a new booking. */
model CreateBookingRequest {
  /** Reference to the event type to book. */
  @maxLength(100)
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
