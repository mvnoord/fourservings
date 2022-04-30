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

package com.fourservings.api.db;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Map;

import com.fourservings.api.Repository.Item;
import com.mongodb.client.MongoCollection;

import org.apache.commons.io.IOUtils;
import org.bson.Document;
import org.junit.Test;

public class MongoRepositoryTest extends AbstractMongoTest {
    @Test    
    public void testSaveGetDelete() throws Exception {
        MongoCollection<Document> col = db.getCollection(MongoRepository.COLLECTION);
        col.drop();

        MongoRepository repo = new MongoRepository(() -> db);

        repo.upsert("hello/world.txt", 
            new ByteArrayInputStream("hello, world".getBytes("UTF-8")),
            Map.of(MongoRepository.METADATA_MIME_TYPE, "text/plain")
        );

        Item item = repo.get("hello/world.txt");
        assertNotNull("found item", item);
        assertEquals("key", "hello/world.txt", item.key());
        assertEquals("metadata content length", Map.of(
            MongoRepository.METADATA_CONTENT_LENGTH, "12", 
            MongoRepository.METADATA_MIME_TYPE, "text/plain"), item.metadata());
        
        try (InputStream in = item.openStream()) {
            String read = new String(IOUtils.toByteArray(in), "UTF-8");
            assertEquals("data", "hello, world", read);
        }

        repo.delete("hello/world.txt");

        assertNull("deleted", repo.get("hello/world.txt"));
    }
}
