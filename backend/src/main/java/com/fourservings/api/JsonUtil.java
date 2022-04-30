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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonNumber;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonString;
import javax.json.JsonValue;

import org.bson.Document;
import org.bson.types.ObjectId;

public class JsonUtil {
    public static Document toDocument(JsonObject json) {
        if (json == null) return null;

        Document doc = new Document();
        json.forEach((key, value) -> {
            doc.append(key, toBsonValue(value));
        });
        return doc;
    }

    private static Object toBsonValue(JsonValue value) {
        if (value == null)  return null;

        switch (value.getValueType()) {
            case NULL: return null;
            case FALSE: return false;
            case TRUE: return true;
            case NUMBER: 
                Number number = ((JsonNumber) value).numberValue();
                if (number instanceof BigDecimal) {
                    return ((BigDecimal) number).doubleValue();
                } else {
                    return number;
                }
            case STRING: return toBsonValue(((JsonString) value).getString());
            case ARRAY: {
                return ((JsonArray) value).stream()
                    .map(JsonUtil::toBsonValue)
                    .collect(Collectors.toList());
            }
            case OBJECT: return toDocument((JsonObject) value);
            default:
                throw new IllegalArgumentException("Unsupported JsonValue type: " + value.getValueType());
        }
    }

    private static Object toBsonValue(String value) {
        if (ObjectId.isValid(value)) {
            return new ObjectId(value);
        }

        if (value.length() >= 20 && value.length() <= 30) {
            try {
                return Date.from(Instant.from(DateTimeFormatter.ISO_INSTANT.parse(value)));
            } catch (Exception e) {
                // not an iso timestamp
            }
        }

        return value;
    }

    public static JsonObject toJson(Document doc) {
        if (doc == null) return null;

        JsonObjectBuilder builder = Json.createObjectBuilder();
        doc.entrySet().forEach(entry -> {
            builder.add(entry.getKey(), toJsonValue(entry.getValue()));
        });

        return builder.build();
    }

    private static JsonValue toJsonValue(Object value) {
        if (value == null) {
            return JsonValue.NULL;

        } else if (value instanceof Document) {
            return toJson((Document) value);

        } else if (value instanceof Collection) {
            JsonArrayBuilder array = Json.createArrayBuilder();

            ((Collection<?>) value).stream()
                .map(JsonUtil::toJsonValue)
                .forEach(array::add);

            return array.build();

        } else if (value instanceof Boolean) {
            return ((Boolean) value).equals(Boolean.TRUE) ? JsonValue.TRUE : JsonValue.FALSE;

        } else if (value instanceof Long) {
            return Json.createValue((Long) value);
        } else if (value instanceof Integer) {
            return Json.createValue((Integer) value);
        } else if (value instanceof Double) {
            return Json.createValue((Double) value);

        } else if (value instanceof String) {
            return Json.createValue((String) value);

        } else if (value instanceof Date) {
            return Json.createValue(
                DateTimeFormatter.ISO_INSTANT.format(Instant.ofEpochMilli(((Date) value).getTime()))
            );

        } else if (value instanceof ObjectId) {
            return Json.createValue(((ObjectId) value).toHexString());

        } else {
            throw new IllegalArgumentException("Unsupported document value type: " + value.getClass().getName());
        }
    }
}
