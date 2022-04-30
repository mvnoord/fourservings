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

import static org.junit.Assert.assertEquals;

import java.util.Date;
import java.util.List;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.Test;

public class JsonUtilTest {
    @Test
    public void testAll() {
        Document doc = new Document()
            .append("oid", new ObjectId())
            .append("date", new Date(1010101))
            .append("string", "X")
            .append("int", 123)
            .append("long", 9999999999L)
            .append("double", 45.6)
            .append("document", new Document("foo", "bar"))
            .append("array", List.of("1", 2));

        Document roundTrip = JsonUtil.toDocument(JsonUtil.toJson(doc));
        assertEquals("round trip", doc, roundTrip);
    }
}
