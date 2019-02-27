export class Answer {
    private success: boolean = null;
    private reason: string = null;
    private token: string = null;

    public getSuccess() {
        return this.success;
    }

    public setSuccess(success) {
        success = this.success;
    }

    public getReason() {
        return this.reason;
    }

    public setReason(reason) {
        reason = this.reason;
    }

    public getToken() {
        return this.token;
    }

    public setToken(token) {
        token = this.token;
    }

}