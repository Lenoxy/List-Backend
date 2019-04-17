export interface UserLogin {
    email: string,
    password: string
}

export interface UserRegister {
    email: string,
    username: string,
    password: string,
    repeatPassword: string
}

export interface UserToken {
    token: string;
}
