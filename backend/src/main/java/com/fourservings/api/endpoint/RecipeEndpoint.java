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

import java.util.List;

import javax.inject.Inject;
import javax.json.Json;
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
import javax.ws.rs.QueryParam;

import com.fourservings.api.Authenticator;
import com.fourservings.api.JsonUtil;
import com.fourservings.api.RecipeManager;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.jboss.resteasy.plugins.guice.RequestScoped;

@RequestScoped
@Path("/recipes")
@Produces("application/json")
public class RecipeEndpoint {
    private final Authenticator authenticator;
    private final RecipeManager recipes;

    @Inject
    private HttpServletRequest request;

    @Inject
    public RecipeEndpoint(Authenticator authenticator, RecipeManager recipes) {
        this.authenticator = authenticator;
        this.recipes = recipes;
    }

    private static JsonObject toExternal(Document group) {
        group.remove("ownerId");
        return JsonUtil.toJson(group);
    }

    @GET
    @Path("/")
    public JsonObject search(
        @QueryParam("search") String search, 
        @QueryParam("group") String groupId, 
        @QueryParam("start") Integer start, 
        @QueryParam("count") Integer count) {

        ObjectId userId = this.authenticator.getUser(request);
        if (StringUtils.isNotBlank(groupId) && !ObjectId.isValid(groupId)) {
            throw new BadRequestException("group is invalid");
        }

        if (start == null || start < 0) start = 0;
        if (count == null || count < 0) count = 10;
        Pair<List<Document>, Integer> results = 
            this.recipes.search(userId, 
                search, StringUtils.isNotBlank(groupId) ? new ObjectId(groupId) : null, 
                start, count);

        JsonArrayBuilder resultBuilder = Json.createArrayBuilder();
        results.getLeft().stream()
            .map(RecipeEndpoint::toExternal)
            .forEach(resultBuilder::add);

        return Json.createObjectBuilder()
            .add("total", results.getRight())
            .add("results", resultBuilder.build())
            .build();
    }

    @GET
    @Path("/{id}")
    public JsonObject get(@PathParam("id") String id) {
        ObjectId userId = this.authenticator.getUser(request);
        if (!ObjectId.isValid(id)) throw new NotFoundException();

        return toExternal(this.recipes.get(userId, new ObjectId(id))); 
    }

    @POST
    @Path("/")
    public JsonObject add(JsonObject payload) {
        ObjectId userId = this.authenticator.getUser(request);
        return toExternal(
                this.recipes.create(
                        userId, 
                        JsonUtil.toDocument(payload)
                    )
            );
    }

    @PUT
    @Path("/{id}")
    public JsonObject update(@PathParam("id") String id, JsonObject payload) {
        ObjectId userId = this.authenticator.getUser(request);
        if (!ObjectId.isValid(id)) throw new NotFoundException();
        return toExternal(
                this.recipes.update(
                        userId, 
                        JsonUtil.toDocument(payload)
                            .append("_id", new ObjectId(id))
                    )
            );
    }

    @DELETE
    @Path("/{id}")
    public void delete(@PathParam("id") String id) {
        ObjectId userId = this.authenticator.getUser(request);
        if (!ObjectId.isValid(id)) return;
        
        this.recipes.remove(userId, new ObjectId(id));
    }
}
