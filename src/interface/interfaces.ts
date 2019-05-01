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

export interface UserShowLists {
    token: string;
}

export interface UserAddList {
    name: string;
    token: string;
}
