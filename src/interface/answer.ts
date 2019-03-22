export class Answer {
    token: String = null;
    validation: ValidationResult = {
        email: null,
        username: null,
        password: null
    };
    code: successCode = 1;
}

export class ValidationResult {
    email: Boolean = null;
    username: Boolean = null;
    password: Boolean = null;
}

enum successCode {
    //GENERAL
    okay = 1,
    internalError = 2,

    //LOGIN
    wrongPassword = 101,

    //REGISTER
    emailExists = 201,

}
