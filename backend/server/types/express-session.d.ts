import 'express-session';

declare module 'express-session' {
    interface SessionData {
        passport?: {
            user?: {
                profile: any;
                accessToken: string;
                createdAt?: string;
                username: string;
                displayName: string;
            };
        };
    }
}

declare global {
    namespace Express {
        interface User {
            profile: any;
            accessToken: string;
            createdAt?: string;
            username: string;
            displayName: string;
        }
    }
}
