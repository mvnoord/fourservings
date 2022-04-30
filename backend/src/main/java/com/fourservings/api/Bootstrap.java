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

import com.fourservings.api.config.Configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Bootstrap {
    private static final Logger LOGGER = LoggerFactory.getLogger(Bootstrap.class);

    public static void main(String[] args) {
        LOGGER.info("Starting api...");

        WebServer server = new WebServer(
                Configuration.get("BIND_ADDRESS"),
                Configuration.getInt("PORT"),
                AllModules.class,
                Configuration.get("API_PATH"),
                Configuration.get("STATIC_CONTENT_DIR"));
        server.run();
    }
}
