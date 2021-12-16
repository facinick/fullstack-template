import { AbstractError } from "./AbstractError";
import { ErrorsList } from "./Errors";

export class UnAuthenticatedError extends AbstractError {
    constructor(message?: string, data?: Record<any, unknown>) {
        super(401, ErrorsList.auth_errors.UN_AUTHENTICATED, message || "You need to log in to access this data!", data);
    }
}
export class UnAuthorizedError extends AbstractError {
    constructor(message?: string, data?: Record<any, unknown>) {
        super(403, ErrorsList.auth_errors.UN_AUTHORIZED, message || "You don't have permission to view this data!", data);
    }
}

export class NotFoundError extends AbstractError {
    constructor(message?: string, data?: Record<any, unknown>) {
        super(404, ErrorsList.resource_errors.NOT_FOUND, message || "Requested resource not found!", data);
    }
}
export class ConflictError extends AbstractError {
    constructor(message?: string, data?: Record<any, unknown>) {
        super(409, ErrorsList.resource_errors.INVALID_OPERATION, message || "Operation cannot be done!", data);
    }
}