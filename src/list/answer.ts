export class Answer {
    private success: boolean = null;
    private reason: any = null //TODO enum
    private token: string = null;


    public getSuccess(): boolean {
        return this.success;
    }

    public setSuccess(success): void {
        this.success = success;
    }

    public getReason(): any { //TODO
        return this.reason;
    }

    public setReason(reason): void {
        this.reason = reason;
    }

    public getToken(): string {
        return this.token;
    }

    public setToken(token): void {
        this.token = token;
    }
}