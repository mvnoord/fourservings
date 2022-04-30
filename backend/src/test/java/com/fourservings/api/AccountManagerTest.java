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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;

import java.util.List;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;

import com.fourservings.api.db.AbstractMongoTest;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;

import org.bson.Document;
import org.bson.types.Binary;
import org.bson.types.ObjectId;
import org.junit.Test;

public class AccountManagerTest extends AbstractMongoTest {

    @Test
    public void testRegisterLogin() {
        AccountManager mgr = new AccountManager(() -> db);

        MongoCollection<Document> col = db.getCollection(AccountManager.COLLECTION_ACCOUNT);
        col.drop();

        Document accountA = mgr.register("A", "a@bar.com", "password");
        Document accountB = mgr.register(null, "b@bar.com", "password");

        try {
            mgr.register(null, "a@bar.com", "password");
            fail("duplicate email");
        } catch (BadRequestException e) {
            // expected
        }

        assertFalse("no password info returned", accountA.containsKey("password"));
        
        Object id = accountA.get("_id");
        accountA = col.find(Filters.eq("_id", id)).first();
        accountB = col.find(Filters.eq("_id", accountB.get("_id"))).first();

        assertNotNull("password hash populated", accountA.getEmbedded(List.of("password", "hash"), Binary.class));
        assertNotNull("password salt populated", accountA.getEmbedded(List.of("password", "salt"), Binary.class));

        assertNotEquals("hash differs",
                accountA.getEmbedded(List.of("password", "hash"), Binary.class),
                accountB.getEmbedded(List.of("password", "hash"), Binary.class));
        assertNotEquals("salt differs",
                accountA.getEmbedded(List.of("password", "salt"), Binary.class),
                accountB.getEmbedded(List.of("password", "salt"), Binary.class));

        accountA = mgr.login("a@bar.com", "password");
        assertEquals("login success", new Document()
            .append("_id", id)
            .append("name", "A")
            .append("email", "a@bar.com"), accountA);

        try {
            mgr.login("a@bar.com", "not the password");
            fail("bad password, login should have failed");
        } catch (NotFoundException e) {
            // expected
        }
    }

    @Test
    public void testUpdate() {
        MongoCollection<Document> col = db.getCollection(AccountManager.COLLECTION_ACCOUNT);
        col.drop();

        col.insertOne(new Document("_id", new ObjectId())
            .append("email", "b@foo.com")
            .append("password", new Document()));

        AccountManager mgr = new AccountManager(() -> db);

        ObjectId id = mgr.register("A", "a@bar.com", "password").getObjectId("_id");

        try {
            mgr.update(new ObjectId(), null, "x@foo.com", null, null);
            fail("update of non-existent id");
        } catch (NotFoundException e) {
            // expected
        }

        // Name change (no password required)
        mgr.update(id, "A-change", null, null, null);
        assertEquals("name change", "A-change", col.find(Filters.eq("_id", id)).first().get("name"));

        // Email change (requires password re-auth)
        try {
            mgr.update(id, null, "b@foo.com", null, "password");
            fail("duplicate email");
        } catch (BadRequestException e) {
            // expected
        }

        try {
            mgr.update(id, null, "c@foo.com", null, "password-not");
            fail("invalid password");
        } catch (BadRequestException e) {
            // expected
        }

        mgr.update(id, null, "c@foo.com", null, "password");
        assertEquals("email change", "c@foo.com", col.find(Filters.eq("_id", id)).first().get("email"));

        // password change

        try {
            mgr.update(id, null, "c@foo.com", "password-new", "password-not");
            fail("invalid password");
        } catch (BadRequestException e) {
            // expected
        }
        mgr.update(id, null, "c@foo.com", "password-new", "password");
        assertNotNull("password change success", mgr.login("c@foo.com", "password-new"));
    }

    @Test
    public void testGetByID() {
        MongoCollection<Document> col = db.getCollection(AccountManager.COLLECTION_ACCOUNT);
        col.drop();

        ObjectId id = new ObjectId();
        col.insertOne(new Document("_id", id)
            .append("email", "b@foo.com")
            .append("password", new Document()));

        AccountManager mgr = new AccountManager(() -> db);

        try {
            mgr.getAccount(null);
            fail("null id");
        } catch (NotFoundException e) {
            // expected
        }

        try {
            mgr.getAccount(new ObjectId());
            fail("null id");
        } catch (NotFoundException e) {
            // expected
        }

        Document account = mgr.getAccount(id);
        assertEquals("found account", "b@foo.com", account.getString("email"));
    }
}
