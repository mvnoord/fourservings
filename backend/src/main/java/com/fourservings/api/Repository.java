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

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

/** Interface to a simple binary data store. Could be backed by 
 * S3, a local filesystem, database, etc.
 */
public interface Repository {
    public static final String METADATA_MIME_TYPE = "Content-Type";
    public static final String METADATA_CONTENT_LENGTH = "Content-Length";

    public Item get(String key);
    public void upsert(String key, InputStream data, Map<String, String> metadata) throws IOException;
    public void delete(String key);

    public static interface Item {
        public String key();
        public Map<String, String> metadata();
        public InputStream openStream();
    }
}
