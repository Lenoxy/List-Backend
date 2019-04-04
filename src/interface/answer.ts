export class Answer {
    token: string = null;
    validation: ValidationResult = {
        email: null,
        username: null,
        password: null,
        repeatPassword: null,
    };
    code: successCode = 1;
}

export class ValidationResult {
    email: boolean = null;
    username: boolean = null;
    password: boolean = null;
    repeatPassword: boolean = null;
}

enum successCode {
    //GENERAL
    okay = 1,
    internalError = 2,

    //LOGIN
    wrongPassword = 101,
    emailNotExisting = 102,

    //REGISTER
    emailExists = 201,
}
