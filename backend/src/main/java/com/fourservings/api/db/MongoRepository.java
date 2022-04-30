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

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import javax.inject.Inject;
import javax.inject.Provider;
import javax.inject.Singleton;

import com.fourservings.api.Repository;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.ReplaceOptions;

import org.apache.commons.io.IOUtils;
import org.bson.Document;
import org.bson.types.Binary;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** A binary file repository, backed by the primary mongo database.  As such
 * it's bound by mongo's 16MB binary document size cap so nothing bigger than
 * 16MB can be stored in here.
 */
@Singleton
public class MongoRepository implements Repository {
    private static final Logger LOGGER = LoggerFactory.getLogger(MongoRepository.class);

    protected static final String COLLECTION = "files";

    private final Provider<MongoDatabase> mongo;

    @Inject
    public MongoRepository(Provider<MongoDatabase> mongo) {
        this.mongo = mongo;
    }

    public Item get(String key) {
        Document data = mongo.get().getCollection(COLLECTION)
            .find(Filters.eq("_id", key))
            .first();
        
        return data == null ? null : new MongoItem(data);
    }

    public void upsert(String key, InputStream data, Map<String, String> metadata) throws IOException {
        LOGGER.info("Saving {} to mongodb", key);

        ByteArrayOutputStream bout = new ByteArrayOutputStream(4096);
        IOUtils.copy(data, bout);

        Document doc = new Document()
            .append("_id", key)
            .append("metadata", metadata)
            .append("data", bout.toByteArray());

        mongo.get().getCollection(COLLECTION)
            .replaceOne(Filters.eq("_id", key), doc, new ReplaceOptions().upsert(true));
    }

    public void delete(String key) {
        mongo.get().getCollection(COLLECTION).deleteOne(Filters.eq("_id", key));
    }

    private static class MongoItem implements Item {
        private final String key;
        private final Map<String, String> metadata;
        private final byte[] data;

        private MongoItem(Document doc) {
            this.key = doc.getString("_id");

            Binary data = doc.get("data", Binary.class);
            if (data != null) {
                this.data = data.getData();
            } else {
                this.data = new byte[0];
            }

            Map<String, String> metadata = new HashMap<>();
            for (Entry<String, ?> entry : doc.get("metadata", new Document()).entrySet()) {
                metadata.put(
                    entry.getKey(), 
                    entry.getValue() != null ? entry.getValue().toString() : ""
                );
            }
            metadata.put(Repository.METADATA_CONTENT_LENGTH, Integer.toString(this.data.length));
            this.metadata = Collections.unmodifiableMap(metadata);
        }

        public String key() { return this.key; }
        public Map<String, String> metadata() { return this.metadata; }

        public InputStream openStream() {
            return new ByteArrayInputStream(this.data);
        }
    }
}
