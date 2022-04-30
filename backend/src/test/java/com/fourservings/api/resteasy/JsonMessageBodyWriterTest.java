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

import java.io.ByteArrayOutputStream;

import javax.json.Json;
import javax.ws.rs.core.MediaType;

import org.junit.Test;

import junit.framework.TestCase;

public class JsonMessageBodyWriterTest extends TestCase {
    @Test
    public void testAll() throws Exception {
        JsonMessageBodyWriter writer = new JsonMessageBodyWriter();
        assertTrue("is writable", writer.isWriteable(
                Json.createObjectBuilder().build().getClass(), null, null,
                MediaType.APPLICATION_JSON_TYPE));

        ByteArrayOutputStream bout = new ByteArrayOutputStream();
        writer.writeTo(
                Json.createObjectBuilder().add("foo", "bar").build(),
                null, null, null, null, null, bout);

        assertEquals("writeTo", "{\"foo\":\"bar\"}", bout.toString());
    }
}
