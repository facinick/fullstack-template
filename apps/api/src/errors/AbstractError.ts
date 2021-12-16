export class AbstractError extends Error {
    code: number;
    message: string;
    title: string;
    data: Record<any, unknown> | undefined;

    constructor(code: number, title: string, message: string, data?: Record<any, unknown>) {
        super();
        this.code = code;
        this.title = title;
        this.message = message;
        this.data = data;
    }
}