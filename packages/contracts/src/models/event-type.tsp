namespace MiniCal;

/** An event type representing a kind of meeting that guests can book. */
model EventType {
  /** Unique, stable identifier chosen by the owner. */
  id: string;

  /** Display name of the event type. */
  name: string;

  /** Optional description of what this event type is for. */
  description?: string;

  /** Meeting duration in minutes. */
  durationMinutes: int32;
}

/** Request payload to create a new event type. */
model CreateEventTypeRequest {
  /** Unique, stable identifier chosen by the owner. */
  id: string;

  /** Display name of the event type. */
  name: string;

  /** Optional description of what this event type is for. */
  description?: string;

  /** Meeting duration in minutes. */
  durationMinutes: int32;
}
