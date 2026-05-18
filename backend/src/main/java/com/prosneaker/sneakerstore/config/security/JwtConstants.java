package com.prosneaker.sneakerstore.config.security;

public final class JwtConstants {

    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
    public static final String TOKEN_TYPE = "Bearer";

    public static final String CLAIM_USER_ID = "userId";
    public static final String CLAIM_ROLE = "role";
    public static final String CLAIM_TOKEN_TYPE = "tokenType";

    public static final String ACCESS_TOKEN = "ACCESS";
    public static final String REFRESH_TOKEN = "REFRESH";

    private JwtConstants() {
    }
}
