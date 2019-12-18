export class Token {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    // not from Spotifu
    expire_time: Date;
}
