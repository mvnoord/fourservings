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

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;

import javax.annotation.Nullable;
import javax.inject.Inject;
import javax.inject.Singleton;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Sorts;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;

/** Handle data management for recipes and groups.
 */
@Singleton
public class RecipeManager {
    static final String COLLECTION_RECIPE = "recipe";
    static final String COLLECTION_GROUP = "group";

    private final MongoDatabase mongo;
    private final Repository files;

    @Inject
    public RecipeManager(MongoDatabase mongo, Repository files) {
        this.mongo = mongo;
        this.files = files;

        // Ensure we have the text index set up to support keyword searches

        MongoCollection<Document> recipes = this.mongo.getCollection(COLLECTION_RECIPE);
        boolean textIndex = false;
        for (Document index : recipes.listIndexes()) {
            if ("text".equals(index.get("title"))) {
                textIndex = true;
                break;
            }
        }
        if (!textIndex) {
            recipes.createIndex(new Document()
                .append("title", "text")
                .append("ingredients", "text")
                .append("directions", "text")
            );
        }
    }

    private static Bson filterById(ObjectId ownerId, ObjectId recipeId) {
        return Filters.and(Filters.eq("ownerId", ownerId), Filters.eq("_id", recipeId));
    }

    public Document get(ObjectId ownerId, ObjectId id) {
        Objects.requireNonNull(ownerId);
        if (id == null) throw new BadRequestException();

        Document recipe = this.mongo.getCollection(COLLECTION_RECIPE)
            .find(filterById(ownerId, id)).first();
        if (recipe == null) throw new NotFoundException("Recipe " + id + " not found");

        return recipe;
    }

    public Document create(ObjectId ownerId, Document data) {
        Objects.requireNonNull(ownerId);

        data
            .append("_id", new ObjectId())
            .append("ownerId", ownerId);
        this.mongo.getCollection(COLLECTION_RECIPE)
            .insertOne(data);
        return data;
    }

    public Document update(ObjectId ownerId, Document data) {
        Objects.requireNonNull(ownerId);

        ObjectId id = data.getObjectId("_id");
        if (id == null) throw new BadRequestException("_id required for update");

        MongoCollection<Document> col = this.mongo.getCollection(COLLECTION_RECIPE);
        Document existing = col
            .find(filterById(ownerId, id))
            .projection(new Document("images", 1))
            .first();
        if (existing == null) throw new NotFoundException();

        data.append("ownerId", ownerId);

        long matched = col
            .replaceOne(filterById(ownerId, id), data)
            .getMatchedCount();
        if (matched == 0) throw new NotFoundException();

        // Check to see if any images were dereferenced
        Collection<String> noLongerReferenced = new HashSet<>();
        noLongerReferenced.addAll(existing.getList("images", String.class, Collections.emptyList()));
        noLongerReferenced.removeAll(data.getList("images", String.class, Collections.emptyList()));

        if (!noLongerReferenced.isEmpty()) {
            noLongerReferenced.stream()
                .filter(url -> url.startsWith("/"))
                .map(uri -> ownerId.toHexString() + uri) // image keys are scoped by owner
                .forEach(this.files::delete);
                ;
        }

        return data;
    }

    public void remove(ObjectId ownerId, ObjectId id) {
        Objects.requireNonNull(ownerId);
        if (id == null) throw new BadRequestException();
        
        Document deleted = this.mongo.getCollection(COLLECTION_RECIPE)
            .findOneAndDelete(filterById(ownerId, id));
        if (deleted != null) {
            // Remove any referenced images stored internally
            List<String> images = deleted.getList("images", String.class, new ArrayList<>());
            images.stream()
                .filter(url -> url.startsWith("/"))
                .map(uri -> ownerId.toHexString() + uri) // image keys are scoped by owner
                .forEach(this.files::delete);
                ;
        }
    }

    /** Get a page of matching recipes.
     * @return a Pair with a left/key value of the page of results and the right/value
     *  of the total number of matching recipes.
     */
    public Pair<List<Document>, Integer> search(
            ObjectId ownerId, 
            @Nullable String keyword, @Nullable ObjectId groupId, 
            int start, int count) {

        Objects.requireNonNull(ownerId);
        if (count > 1000) throw new BadRequestException("count must be less than 1000");

        Collection<Bson> filters = new ArrayList<>();
        filters.add(Filters.eq("ownerId", ownerId));
        if (StringUtils.isNotBlank(keyword)) {
            filters.add(Filters.text(keyword));
        }
        if (groupId != null) {
            filters.add(Filters.eq("groups._id", groupId));
        }

        List<Document> results = new ArrayList<>();

        int total = Long.valueOf(
                this.mongo.getCollection(COLLECTION_RECIPE)
                    .countDocuments(Filters.and(filters))
            ).intValue();

        this.mongo.getCollection(COLLECTION_RECIPE)
            .find(Filters.and(filters))
                .sort(Sorts.descending("_id"))
                .skip(start).limit(count).batchSize(count)
                .into(results);

        return ImmutablePair.of(results, total);
    }

    public List<Document> getGroups(ObjectId ownerId) {
        Objects.requireNonNull(ownerId);

        List<Document> groups = new ArrayList<>();
        this.mongo.getCollection(COLLECTION_GROUP)
            .find(Filters.eq("ownerId", ownerId))
            .into(groups);
        return groups;
    }
    public Document updateGroup(ObjectId ownerId, Document data) {
        Objects.requireNonNull(ownerId);

        ObjectId id = data.getObjectId("_id");
        if (id == null) throw new BadRequestException("_id required for update");

        data.append("ownerId", ownerId);

        long matched = this.mongo.getCollection(COLLECTION_GROUP)
            .replaceOne(filterById(ownerId, id), data)
            .getMatchedCount();
        if (matched == 0) throw new NotFoundException();

        return data;
    }
    public Document createGroup(ObjectId ownerId, Document data) {
        Objects.requireNonNull(ownerId);

        data
            .append("_id", new ObjectId())
            .append("ownerId", ownerId);
        this.mongo.getCollection(COLLECTION_GROUP)
            .insertOne(data);
        return data;
    }
    public void removeGroup(ObjectId ownerId, ObjectId id) {
        Objects.requireNonNull(ownerId);
        if (id == null) throw new BadRequestException();
        
        // Remove recipe references
        this.mongo.getCollection(COLLECTION_RECIPE)
            .find(Filters.eq("groups._id", id))
            .forEach(recipe -> removeFromGroup(id, recipe));

        this.mongo.getCollection(COLLECTION_GROUP)
            .deleteOne(filterById(ownerId, id));
    }
  
    private void removeFromGroup(ObjectId groupId, Document recipe) {
        List<Document> groups = recipe.getList("groups", Document.class);
        groups.removeIf(group -> groupId.equals(group.getObjectId("_id")));
        recipe.append("groups", groups);

        this.mongo.getCollection(COLLECTION_RECIPE)
            .replaceOne(Filters.eq("_id", recipe.get("_id")), recipe);
    }
}
