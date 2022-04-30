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

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import java.util.List;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;

import com.fourservings.api.db.AbstractMongoTest;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;

import org.apache.commons.lang3.tuple.Pair;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.Test;

public class RecipeManagerTest extends AbstractMongoTest {
    @Test
    public void testRecipeCRUD() {
        Repository repo = mock(Repository.class);

        MongoCollection<Document> col = db.getCollection(RecipeManager.COLLECTION_RECIPE);
        col.drop();
        
        ObjectId ownerId = new ObjectId();
        
        RecipeManager mgr = new RecipeManager(db, repo);
        Document recipe = mgr.create(ownerId, new Document("title", "Title"));
        assertNotNull("new recipe id", recipe.get("_id"));

        try {
            mgr.update(ownerId, new Document("foo", "bar"));
            fail("update w/o id");
        } catch (BadRequestException e) {
            // expected
        }

        recipe = mgr.update(ownerId, new Document("_id", recipe.get("_id")).append("title", "Title 2"));
        assertNotNull("updated recipe", recipe);
        try {
            mgr.update(new ObjectId(), new Document("_id", recipe.get("_id")).append("title", "Title 2"));
            fail("update w/ different owner");
        } catch (NotFoundException e) {
            // expected
        }

        try {
            mgr.get(ownerId, new ObjectId());
            fail("get nonexistent");
        } catch (NotFoundException e) {
            // expected
        }

        recipe = mgr.get(ownerId, recipe.getObjectId("_id"));
        assertEquals("got updated", "Title 2", recipe.getString("title"));
        try {
            mgr.get(new ObjectId(), recipe.getObjectId("_id"));
            fail("get other owner's");
        } catch (NotFoundException e) {
            // expected
        }

        mgr.remove(ownerId, new ObjectId()); // noop
        mgr.remove(new ObjectId(), recipe.getObjectId("_id")); // noop, not owned
        assertNotNull("didn't remove non-owned", mgr.get(ownerId, recipe.getObjectId("_id")));

        mgr.remove(ownerId, recipe.getObjectId("_id"));

        try {
            mgr.get(ownerId, recipe.getObjectId("_id"));
            fail("got removed recipe");
        } catch (NotFoundException e) {
            // expected
        }
    }

    @Test
    public void testPhotoRemoval() {
        Repository repo = mock(Repository.class);

        MongoCollection<Document> col = db.getCollection(RecipeManager.COLLECTION_RECIPE);
        col.drop();
        
        ObjectId ownerId = new ObjectId();
        
        RecipeManager mgr = new RecipeManager(db, repo);
        ObjectId id = mgr.create(ownerId, new Document("images", List.of(
            "/a123", "/b123", "https://fourservings.com/image.jpg"
        ))).get("_id", ObjectId.class);

        // remove image reference
        mgr.update(ownerId, new Document()
            .append("_id", id)
            .append("images", List.of(
                "/a123", "https://fourservings.com/image.jpg"
            )));
        verify(repo).delete(ownerId.toHexString() + "/b123");

        mgr.remove(ownerId, id);

        verify(repo).delete(ownerId.toHexString() + "/a123");
        verify(repo, times(2)).delete(any()); // repo called twice and only twice
    }

    @Test
    public void search() {
        MongoCollection<Document> col = db.getCollection(RecipeManager.COLLECTION_RECIPE);
        col.drop();

        ObjectId ownerId = new ObjectId();
        ObjectId group1 = new ObjectId();
        ObjectId group2 = new ObjectId();
        col.insertMany(List.of(
            new Document("ownerId", ownerId)
                .append("title", "Chicken Soup")
                .append("groups", List.of(
                    new Document("_id", group1), new Document("_id", group2)
                )),
            new Document("ownerId", ownerId)
                .append("ingredients", List.of("1 whole chicken"))
                .append("groups", List.of(new Document("_id", group1))),

            new Document("ownerId", ownerId)
                .append("directions", List.of("roast the chicken")),

            new Document("ownerId", ownerId)
                .append("title", "Tomato Soup"),

            new Document("ownerId", new ObjectId())
                .append("title", "Chicken Kiev")
        ));
        
        RecipeManager mgr = new RecipeManager(db, mock(Repository.class));

        Pair<List<Document>, Integer> results = mgr.search(ownerId, null, null, 0, 2);
        assertEquals("search all, total", Integer.valueOf(4), results.getRight());
        assertEquals("search all, results: 2", 2, results.getLeft().size());

        assertEquals("keyword search results", Integer.valueOf(3), mgr.search(ownerId, "chicken", null, 0, 100).getRight());

        assertEquals("group search", Integer.valueOf(2), mgr.search(ownerId, null, group1, 0, 100).getRight());
    }

    @Test
    public void testGroupCRUD() {
        MongoCollection<Document> recipeCol = db.getCollection(RecipeManager.COLLECTION_RECIPE);
        recipeCol.drop();

        MongoCollection<Document> col = db.getCollection(RecipeManager.COLLECTION_GROUP);
        col.drop();

        ObjectId ownerId = new ObjectId();
        col.insertMany(List.of(
            new Document("ownerId", ownerId).append("name", "Group 1"),
            new Document("ownerId", ownerId).append("name", "Group 2"),
            new Document("ownerId", new ObjectId()).append("name", "Other Owner's")
        ));

        RecipeManager mgr = new RecipeManager(db, mock(Repository.class));

        assertEquals("get all groups", 2, mgr.getGroups(ownerId).size());

        Document group = mgr.createGroup(ownerId, new Document("name", "Foo"));
        assertNotNull("created id", group.get("_id"));

        try {
            mgr.updateGroup(ownerId, new Document("name", "Bar"));
            fail("update, no id");
        } catch (BadRequestException e) {}
        try {
            mgr.updateGroup(new ObjectId(), new Document("_id", group.get("_id")).append("name", "Bar"));
            fail("update, not owned");
        } catch (NotFoundException e) {}
        try {
            mgr.updateGroup(ownerId, new Document("_id", new ObjectId()).append("name", "Bar"));
            fail("update, bad id");
        } catch (NotFoundException e) {}

        group = mgr.updateGroup(ownerId, new Document("_id", group.get("_id")).append("name", "Bar"));
        assertEquals("updated group", "Bar", group.get("name"));

        ObjectId recipeId = new ObjectId();
        recipeCol.insertOne(new Document("_id", recipeId).append("groups", List.of(
                new Document("_id", group.get("_id")), new Document("_id", new ObjectId())
            )));

        mgr.removeGroup(new ObjectId(), group.getObjectId("_id")); // noop
        assertNotNull("group not removed", col.find(Filters.eq("_id", group.get("_id"))).first());

        mgr.removeGroup(ownerId, group.getObjectId("_id"));
        assertNull("group removed", col.find(Filters.eq("_id", group.get("_id"))).first());
        
        // Group remove should cascade and remove recipe group references, too
        Document recipe = recipeCol.find(Filters.eq("_id", recipeId)).first();
        assertEquals("recipe group count post-remove", 1, recipe.getList("groups", Document.class).size());
    }
}
