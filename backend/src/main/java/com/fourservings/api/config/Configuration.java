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

package com.fourservings.api.config;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// No guice injections here, this is called prior to guice setup

/** Gather named constants to used as configuration variables from the 
 * following sources, in order of increasing priority:
 * <li> /config.properties
 * <li> /config-local.properties
 * <li> {file} /etc/fourservings.properties
 * <li> environmental variables
 */
public class Configuration {
    private static final Logger LOGGER = LoggerFactory.getLogger(Configuration.class);

    private static Configuration singleton;
    static {
        singleton = new Configuration();
    }

    public static Integer getInt(String name) {
        String val = get(name);
        return StringUtils.isBlank(val) ? null : Integer.parseInt(val);
    }
    public static String get(String name) {
        return singleton.entries.get(name);
    }
    public static Collection<Pair<String, String>> getAll() {
        return singleton.entries.entrySet().stream()
            .map(entry -> ImmutablePair.of(entry.getKey(), entry.getValue()))
            .collect(Collectors.toList());
    }

    private final Map<String, String> entries;

    private Configuration() {
        Map<String, Pair<String, String>> combined = new TreeMap<>();

        try {
            loadProperties("/config.properties", combined);
        } catch (IOException e) {
            LOGGER.warn("Unable to load config.properties", e);
        }
        try {
            loadProperties("/config-local.properties", combined);
        } catch (IOException e) {
            LOGGER.debug("Unable to load config-local.properties: {}", e.getMessage());
        }

        try {
            File configFile = new File("/etc/fourservings.properties");
            if (configFile.exists()) {
                try (InputStream in = new FileInputStream(configFile)) {
                    Properties config = new Properties();
                    config.load(in);
                    config.forEach((key, value) -> {
                        combined.put(key.toString(), ImmutablePair.of(value.toString(), "/etc/fourservings.properties"));
                    });
                }
            }
        } catch (IOException e) {
            LOGGER.warn("Unable to load /etc/fourservings.properties", e);
        }

        System.getenv().entrySet().forEach(entry -> {
            combined.put(entry.getKey(), ImmutablePair.of(entry.getValue(), "Env"));
        });

        LOGGER.debug("Setting up configuration bindings:\n\t{}", 
            combined.entrySet().stream()
                .map(entry -> entry.getKey() + "=" + entry.getValue().getLeft() + " (" + entry.getValue().getRight() + ")")
                .collect(Collectors.joining("\n\t"))
                );

        this.entries = new HashMap<>();
        combined.entrySet().forEach(entry -> {
            this.entries.put(entry.getKey(), entry.getValue().getLeft());
        });
    }

    private void loadProperties(String location, Map<String, Pair<String, String>> into) throws IOException {
        Properties defaultConfig = new Properties();
        try (InputStream in = getClass().getResourceAsStream(location)) {
            if (in == null) throw new IOException("Resource not found: " + location);

            defaultConfig.load(in);

            defaultConfig.forEach((key, value) -> {
                into.put(key.toString(), ImmutablePair.of(value.toString(), location));
            });
        }
    }
}
