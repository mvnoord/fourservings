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

import java.io.ByteArrayInputStream;

import javax.json.Json;
import javax.json.JsonObject;
import javax.ws.rs.core.MediaType;

import org.junit.Test;

import junit.framework.TestCase;

public class JsonMessageBodyReaderTest extends TestCase {
    @Test
    public void testAll() throws Exception {
        JsonMessageBodyReader reader = new JsonMessageBodyReader();
        assertTrue("is readable", reader.isReadable(
                Json.createObjectBuilder().build().getClass(),
                null, null, MediaType.APPLICATION_JSON_TYPE));

        JsonObject read = reader.readFrom(JsonObject.class, null, null, null, null,
                new ByteArrayInputStream("{\"foo\":\"bar\"}".getBytes("UTF-8")));
        assertEquals("readFrom",
                Json.createObjectBuilder().add("foo", "bar").build(),
                read);
    }
}
