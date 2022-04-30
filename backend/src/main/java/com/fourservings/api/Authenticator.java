// Copyright (C) 2022 Michael Van Noord
// 
// This file is part of Fourservings.
// 
// Fourservings is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// Fourservings is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with Fourservings.  If not, see <http://www.gnu.org/licenses/>.

package com.fourservings.api;

import java.util.Optional;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response.Status;

import org.apache.commons.lang3.StringUtils;
import org.bson.types.ObjectId;

@Singleton
public class Authenticator {
    private static final String COOKIE_AUTH = "auth";

    private final Signature signer;

    @Inject
    public Authenticator(Signature signer) {
        this.signer = signer;
    }

    /** Generate the authentication token which is in the form:
     * {account ID}.{timestamp in millis from epoch}.{signature}
     */
    public String generateSignedToken(ObjectId accountID) {
        String payload = accountID.toHexString() + "." + System.currentTimeMillis();
        return payload + "." + this.signer.sign(payload);
    }

    /** Verify the auth token and return the account ID.  If the token
     * is not valid, return an empty Optional.
     * 
     * Note: we're not currently timing tokens out
     */
    public Optional<ObjectId> authenticate(String signedToken) {
        if (StringUtils.isBlank(signedToken)) return Optional.empty();
        
        String[] split = signedToken.split("\\.", 3);
        if (split.length != 3) return Optional.empty();
        
        if (this.signer.sign(split[0] + "." + split[1]).equals(split[2])) {
            // No timeout, so no need to verify timestamp
            try {
                return Optional.of(new ObjectId(split[0]));
            } catch (Exception e) {
                return Optional.empty();
            }
        } else {
            return Optional.empty();
        }
    }

    /** Get the logged in user's account ID, or throw an Unauthorized exception
     * if they aren't logged in.
     * 
     * @param request
     * @return
     * @throws WebApplicationException
     */
    public ObjectId getUser(HttpServletRequest request) throws WebApplicationException {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : request.getCookies()) {
                if (COOKIE_AUTH.equals(cookie.getName())) {
                    return this.authenticate(cookie.getValue())
                        .orElseThrow(() -> new WebApplicationException(Status.UNAUTHORIZED));
                }
            }
        }
        String authHeader = request.getHeader("X-Auth");
        if (StringUtils.isNotBlank(authHeader)) {
            return this.authenticate(authHeader)
                .orElseThrow(() -> new WebApplicationException(Status.UNAUTHORIZED));
        }

        throw new WebApplicationException(Status.UNAUTHORIZED);
    }

    public void setAuthenticationCookie(ObjectId accountID, HttpServletResponse response) {
        String authToken = this.generateSignedToken(accountID);
        Cookie auth = new Cookie(COOKIE_AUTH, authToken);
        auth.setHttpOnly(true);
        auth.setMaxAge(Integer.MAX_VALUE);
        auth.setPath("/");
        response.addCookie(auth);
        response.addHeader("X-Auth", authToken);
    }

    public void clearAuthenticationCookie(HttpServletResponse response) {
        Cookie auth = new Cookie(COOKIE_AUTH, "");
        auth.setHttpOnly(true);
        auth.setMaxAge(0);
        auth.setPath("/");
        response.addCookie(auth);
    }
}
