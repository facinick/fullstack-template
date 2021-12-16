import { AbstractError } from "./AbstractError";
import { ErrorsList } from "./Errors";

export class InternalServerError extends AbstractError {
    constructor(message?: string, data?: Record<any, unknown>) {
        super(500, ErrorsList.server_errors.INTERNAL_SERVER_ERROR, message || "Something went wrong on our side!", data);
    }
}