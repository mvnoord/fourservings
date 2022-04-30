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

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Provider;
import javax.inject.Singleton;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Singleton
public class MongoDatabaseProvider implements Provider<MongoDatabase> {
    private static final Logger LOGGER = LoggerFactory.getLogger(MongoDatabaseProvider.class);

    private final MongoClient client;
    private final String database;

    @Inject
    public MongoDatabaseProvider(@Named("MONGODB_URI") String uri, @Named("MONGODB_DATABASE") String database) {
        LOGGER.info("Connecting to mongodb: {} {}", uri, database);
        this.client = MongoClients.create(uri);
        this.database = database;
    }

    @Override
    public MongoDatabase get() {
        return this.client.getDatabase(this.database);
    }

    public void close() {
        this.client.close();
    }
}
