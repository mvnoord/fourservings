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

package com.fourservings.api.endpoint;

import javax.inject.Inject;
import javax.json.JsonObject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;

import com.fourservings.api.AccountManager;
import com.fourservings.api.Authenticator;
import com.fourservings.api.JsonUtil;

import org.apache.commons.lang3.StringUtils;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.jboss.resteasy.plugins.guice.RequestScoped;

@RequestScoped
@Path("/account")
@Produces("application/json")
public class AuthenticationEndpoint {
    private final AccountManager accounts;
    private final Authenticator authenticator;

    @Inject
    private HttpServletRequest request;

    @Inject
    private HttpServletResponse response;

    @Inject
    public AuthenticationEndpoint(AccountManager accounts, Authenticator auth) {
        this.accounts = accounts;
        this.authenticator = auth;
    }

    @POST
    @Path("/")
    public JsonObject register(JsonObject payload) {
        String name = payload.getString("name", null);
        String email = payload.getString("email", null);
        String password = payload.getString("password", null);

        if (email != null) email = email.trim();
        if (password != null) password = password.trim();
        if (StringUtils.isAnyBlank(email, password)) {
            throw new BadRequestException("Email and password are required");
        }

        Document account = this.accounts.register(name, email, password);
        this.authenticator.setAuthenticationCookie(account.getObjectId("_id"), response);
        return toExternal(account);
    }

    @GET
    @Path("/_login")
    public JsonObject login(
            @QueryParam("email") String email,
            @QueryParam("password") String password) {

        if (email != null) email = email.trim();
        if (password != null) password = password.trim();
        if (StringUtils.isAnyBlank(email, password)) {
            throw new BadRequestException("Email and password are required");
        }
        
        Document account = this.accounts.login(email, password);
        this.authenticator.setAuthenticationCookie(account.getObjectId("_id"), response);
        return toExternal(account);
    }

    @GET
    @Path("/_logout")
    public void logout() {
        this.authenticator.clearAuthenticationCookie(response);
    }

    @GET
    @Path("/")
    public JsonObject getLoggedInAccount() {
        Document account = this.accounts.getAccount(this.authenticator.getUser(request));
        return toExternal(account);
    }

    @PUT
    @Path("/")
    public JsonObject update(JsonObject payload) {
        String name = payload.getString("name", null);
        String email = payload.getString("email", null);
        String password = payload.getString("password", null);
        String oldPassword = payload.getString("oldPassword", null);

        ObjectId accountId = this.authenticator.getUser(request);
        Document account = this.accounts.update(accountId, name, email, password, oldPassword);
        return toExternal(account);
    }

    private static JsonObject toExternal(Document account) {
        account.remove("_id");
        return JsonUtil.toJson(account);
    }

    @PUT
    @Path("/_resetpassword")
    public void resetPassword() {
        // TODO: created signed reset token and send to user
    }
}
