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

package com.fourservings.api.resteasy;

import java.io.PrintWriter;
import java.io.StringWriter;

import javax.json.Json;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Provider
public class JsonExceptionMapper implements ExceptionMapper<Throwable> {
    private static final Logger LOGGER = LoggerFactory.getLogger(JsonExceptionMapper.class);

    @Override
    public Response toResponse(Throwable th) {
        if (th instanceof WebApplicationException) {
            Response response = ((WebApplicationException) th).getResponse();

            Object entity = response.getEntity();
            if (entity == null) {
                entity = Json.createObjectBuilder()
                        .add("status", response.getStatus())
                        .add("error", th.getMessage())
                        .build();
            }

            return Response
                    .status(response.getStatus())
                    .entity(entity)
                    .build();
        } else {
            LOGGER.error("Unhandled exception in request", th);
            
            StringWriter stackTrace = new StringWriter();
            th.printStackTrace(new PrintWriter(stackTrace));

            return Response
                    .status(Status.INTERNAL_SERVER_ERROR)
                    .entity(Json.createObjectBuilder()
                            .add("status", Status.INTERNAL_SERVER_ERROR.getStatusCode())
                            .add("exception", th.getClass().getName())
                            .add("error", th.getMessage())
                            .add("stackTrace", stackTrace.toString())
                            .build())
                    .build();
        }
    }
}
