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
export interface UserInfo {
    id: string;
    userName: string;
    dob: string; 
    address: string;
    sex: number; // 1: Male, 2: Female, etc.
    email: string;
    phoneNumber: string;
    name: string;
 }