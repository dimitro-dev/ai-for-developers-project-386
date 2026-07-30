namespace MiniCal;
using Http;

/**
 * List all event types available for public booking.
 * Requires calendar owner to have completed onboarding.
 */
@route("/event-types")
@get
op getPublicEventTypes():
  | {
      @statusCode _: 200;
      @body body: EventType[];
    }
  | {
      @statusCode _: 400;
      @body body: CalendarNotConfigured;
    };

/**
 * Get available slots for a given event type.
 * Server computes a 14-day booking window in the owner's timezone.
 * Slots that are already booked or in the past are excluded.
 */
@route("/slots")
@get
op getPublicSlots(
  /** The event type id to get slots for. */
  @query
  @maxLength(100)
  eventTypeId: string,
):
  | {
      @statusCode _: 200;
      @body body: Slot[];
    }
  | {
      @statusCode _: 400;
      @body body: ValidationError;
    }
  | {
      @statusCode _: 400;
      @body body: CalendarNotConfigured;
    }
  | {
      @statusCode _: 404;
      @body body: EventTypeNotFound;
    };

/**
 * Create a new booking.
 * Server validates the slot, computes endAtUtc from event type duration,
 * and checks for conflicts.
 */
@route("/bookings")
@post
op createPublicBooking(@body body: CreateBookingRequest):
  | {
      @statusCode _: 201;
      @body body: Booking;
    }
  | {
      @statusCode _: 400;
      @body body: ValidationError;
    }
  | {
      @statusCode _: 400;
      @body body: CalendarNotConfigured;
    }
  | {
      @statusCode _: 404;
      @body body: EventTypeNotFound;
    }
  | {
      @statusCode _: 400;
      @body body: SlotOutsideWindow;
    }
  | {
      @statusCode _: 400;
      @body body: SlotNotAligned;
    }
  | {
      @statusCode _: 409;
      @body body: SlotUnavailable;
    }
  | {
      @statusCode _: 409;
      @body body: DuplicateBookingId;
    }
  | {
      @statusCode _: 400;
      @body body: GuestNameRequired;
    }
  | {
      @statusCode _: 400;
      @body body: GuestEmailRequired;
    };
