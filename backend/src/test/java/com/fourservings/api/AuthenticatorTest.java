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
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import org.bson.types.ObjectId;
import org.junit.Test;

public class AuthenticatorTest {
    @Test
    public void testAll() {
        Authenticator auth = new Authenticator(new Signature(null));

        ObjectId id = new ObjectId();

        long before = System.currentTimeMillis();
        String token = auth.generateSignedToken(id);
        long after = System.currentTimeMillis();

        String[] split = token.split("\\.");
        assertEquals("token[0] account id", id.toHexString(), split[0]);
        assertTrue("token[1] generate timestamp", 
            Long.valueOf(split[1]) <= after && Long.valueOf(split[1]) >= before);

        assertEquals("authenticated", id, auth.authenticate(token).orElse(null));
        assertNull("not authenticated", auth.authenticate(id.toHexString() + ".999999.ABDEF19190").orElse(null));
    }
}
