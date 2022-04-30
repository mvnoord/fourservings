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

package com.fourservings.api.endpoint;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.inject.Inject;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.fourservings.api.Authenticator;
import com.fourservings.api.Repository;
import com.fourservings.api.Repository.Item;

import org.apache.commons.lang3.StringUtils;
import org.bson.types.ObjectId;
import org.jboss.resteasy.plugins.guice.RequestScoped;
import org.jboss.resteasy.plugins.providers.multipart.InputPart;
import org.jboss.resteasy.plugins.providers.multipart.MultipartFormDataInput;

@RequestScoped
@Path("/files")
public class FilesEndpoint {
    private final Repository files;
    private final Authenticator authenticator;

    @Inject
    private HttpServletRequest request;

    @Inject
    public FilesEndpoint(Authenticator authenticator, Repository files) {
        this.authenticator = authenticator;
        this.files = files;
    }

    @GET
    @Path("{key}")
    public Response get(@PathParam("key") String key) {
        if (StringUtils.isBlank(key)) throw new NotFoundException();

        ObjectId owner = this.authenticator.getUser(this.request);
        // scope the keys with the owner to prevent unauthorized access
        Item file = this.files.get(owner.toHexString() + "/" + key);
        if (file == null) throw new NotFoundException();

        return Response
                .ok(file.openStream(),
                    Optional.ofNullable(file.metadata().get(Repository.METADATA_MIME_TYPE))
                            .orElse(MediaType.APPLICATION_OCTET_STREAM))
                .header("Content-Length", file.metadata().get(Repository.METADATA_CONTENT_LENGTH))
                .header("Cache-Control", "public, max-age=31536000")
                // the data is immutable, so no point in adding etag header
                .build();
    }

    @POST
    @Path("/")
    @Consumes("multipart/form-data")
    @Produces(MediaType.APPLICATION_JSON)
    public JsonObject upload(MultipartFormDataInput payload) throws IOException {
        ObjectId owner = this.authenticator.getUser(this.request);
        
        JsonArrayBuilder uploadKeys = Json.createArrayBuilder();

        List<InputPart> dataParts = payload.getFormDataMap().get("file");
        for (InputPart dataPart : dataParts) {
            // Since we automatically tack on the ownerId to the key on GET, as far as
            // the frontend knows, the ownerId part of the key doesn't exist.
            String publicKey = new ObjectId().toHexString();
            uploadKeys.add(publicKey);

            String key = owner.toHexString() + "/" + publicKey;
            Map<String, String> metadata = new HashMap<>();
            metadata.put(Repository.METADATA_MIME_TYPE, dataPart.getMediaType().toString());

            try (InputStream in = dataPart.getBody(InputStream.class, null)) {
                this.files.upsert(key, in, metadata);
            }
        }
        payload.close();

        return Json.createObjectBuilder()
            .add("uploaded", uploadKeys.build())
            .build();
    }
}
