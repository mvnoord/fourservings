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

import com.fourservings.api.config.ConfigurationModule;
import com.fourservings.api.db.MongoDatabaseProvider;
import com.fourservings.api.db.MongoRepository;
import com.fourservings.api.endpoint.EndpointModule;
import com.fourservings.api.resteasy.JsonExceptionMapper;
import com.fourservings.api.resteasy.JsonMessageBodyReader;
import com.fourservings.api.resteasy.JsonMessageBodyWriter;
import com.google.inject.AbstractModule;
import com.mongodb.client.MongoDatabase;

import org.jboss.resteasy.plugins.guice.ext.RequestScopeModule;

public class AllModules extends AbstractModule {
    @Override
    protected void configure() {
        install(new ConfigurationModule());
        install(new EndpointModule());

        // Required for @RequestScoped to work
        install(new RequestScopeModule());

        // Resteasy JSON serialization
        bind(JsonMessageBodyReader.class);
        bind(JsonMessageBodyWriter.class);
        bind(JsonExceptionMapper.class);

        // Database bindings
        bind(MongoDatabase.class).toProvider(MongoDatabaseProvider.class);

        // Using mongodb as the file store
        bind(Repository.class).to(MongoRepository.class);
    }
}
