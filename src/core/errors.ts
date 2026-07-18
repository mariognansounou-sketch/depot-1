/**
 * Domain-level error hierarchy. API routes catch these and map them to the
 * right HTTP status instead of leaking stack traces / provider errors.
 */

export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly httpStatus = 400,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, public readonly issues?: unknown) {
    super(message, "VALIDATION_ERROR", 422);
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string) {
    super(`${entity} not found`, "NOT_FOUND", 404);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "Authentication required") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = "You do not have access to this resource") {
    super(message, "FORBIDDEN", 403);
  }
}

export class ExternalProviderError extends DomainError {
  constructor(provider: string, message: string) {
    super(`${provider}: ${message}`, "EXTERNAL_PROVIDER_ERROR", 502);
  }
}

export class RateLimitError extends DomainError {
  constructor(message = "Too many requests, please slow down") {
    super(message, "RATE_LIMITED", 429);
  }
}
