import { Strategy } from 'passport-jwt';
import { IUserRepository } from '../../domain/user/user-repository.interface';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userRepo;
    constructor(userRepo: IUserRepository);
    validate(payload: JwtPayload): Promise<{
        sub: string;
        email: string;
        role: import("../../domain/user/user.entity").UserRole;
    }>;
}
export {};
