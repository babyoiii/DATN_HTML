export interface SignUp {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    address: string;
    dob: Date;
    sex: number;
}
export interface SignIn {
    userName: string;
    password: string;
}