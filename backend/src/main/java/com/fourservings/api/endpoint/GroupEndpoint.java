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
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;

import com.fourservings.api.Authenticator;
import com.fourservings.api.JsonUtil;
import com.fourservings.api.RecipeManager;

import org.apache.commons.lang3.StringUtils;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.jboss.resteasy.plugins.guice.RequestScoped;

@RequestScoped
@Path("/groups")
@Produces("application/json")
public class GroupEndpoint {
    private final Authenticator authenticator;
    private final RecipeManager recipes;

    @Inject
    private HttpServletRequest request;

    @Inject
    public GroupEndpoint(Authenticator authenticator, RecipeManager recipes) {
        this.authenticator = authenticator;
        this.recipes = recipes;
    }

    private static JsonObject toExternal(Document group) {
        group.remove("ownerId");
        return JsonUtil.toJson(group);
    }

    @GET
    @Path("/")
    public JsonObject getAll() {
        JsonArrayBuilder resultsBuilder = Json.createArrayBuilder();
        this.recipes.getGroups(this.authenticator.getUser(this.request))
            .stream()
            .map(GroupEndpoint::toExternal)
            .forEach(resultsBuilder::add);

        JsonArray results = resultsBuilder.build();
        return Json.createObjectBuilder()
            .add("total", results.size())
            .add("results", results)
            .build();
    }

    @POST
    @Path("/")
    public JsonObject add(JsonObject payload) {
        ObjectId userId = this.authenticator.getUser(request);
        String name = payload.getString("name");
        if (StringUtils.isBlank(name)) throw new BadRequestException("name is required");

        return toExternal(
            this.recipes.createGroup(
                userId, 
                new Document("name", name)
                )
            );
    }

    @PUT
    @Path("/{id}")
    public JsonObject update(@PathParam("id") String id, JsonObject payload) {
        ObjectId userId = this.authenticator.getUser(request);
        String name = payload.getString("name");
        if (StringUtils.isBlank(name)) throw new BadRequestException("name is required");
        if (!ObjectId.isValid(id)) throw new NotFoundException();

        return toExternal(
            this.recipes.updateGroup(
                userId, 
                new Document("_id", new ObjectId(id)).append("name", name)
                )
            );
    }

    @DELETE
    @Path("/{id}")
    public void delete(@PathParam("id") String id) {
        ObjectId userId = this.authenticator.getUser(request);
        if (!ObjectId.isValid(id)) return;

        this.recipes.removeGroup(userId, new ObjectId(id));
    }
}
