<!--
 Copyright (C) 2022 Michael Van Noord
 
 This file is part of Fourservings.
 
 Fourservings is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 Fourservings is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Fourservings.  If not, see <http://www.gnu.org/licenses/>.
-->

## Fourservings Backend

This Java JAX-RS site serves as the backend half of the Fourservings application.

The backend is a simple runnable Java process which bootstraps an embedded 
[Undertow](https://undertow.io) server.  It uses [Guice](https://github.com/google/guice)
to stitch together the code and JAX-RS via [Resteasy](https://resteasy.dev/) to provide
REST endpoints to the frontend.

Data is stored in MongoDB.

## Configuration

The default configuration is stored in [config.properties](src/main/resources/config.properties)
and is set for local development--assuming a local instance of MongoDB and a frontend running
on localhost:8080. It will bind to localhost:8081.

Overrides can be embedded in the jar by populating `src/main/resource/config-local.properties`, 
or specified externally in either a file named `/etc/fourservings.properties` or as environmental
variables.

## Deployment

The backend can be configured to serve up static content in case one wants to deploy the
entire Fourservings stack (minus the database) in a single process. For this configuration
set `STATIC_CONTENT_DIR` to the directory hosting the deployable frontend files and `API_PATH`
to the value used to prefix the backend REST calls, e.g. `/api`

A more scalable deployment might choose to host the static content separately and route
backend calls to a load-balanced series of java instances.

## Building

The build process is managed by maven. Note that the unit test suite requires a MongoDB
server running locally.  One can build, skipping the tests by passing `-DskipTests` to the
maven process.

Create and run a shaded, executable Java jar:
```bash
$ mvn install
$ java -jar target/fourservings-1.0-SNAPSHOT.jar
```