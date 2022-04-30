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
import static org.junit.Assert.assertNotEquals;

import org.junit.Test;

public class SignatureTest {
    @Test
    public void testAll() {
        Signature signer = new Signature(null);
        assertEquals("temp key, same value", signer.sign("xyz"), signer.sign("xyz"));
        assertNotEquals("temp key, different value", signer.sign("xyz"), signer.sign("XYZ"));
        assertNotEquals("new temp key, same values", signer.sign("xyz"), new Signature(null).sign("xyz"));

        signer = new Signature("the key");
        assertEquals("private key, same value", signer.sign("xyz"), signer.sign("xyz"));
        assertNotEquals("private key, different value", signer.sign("xyz"), signer.sign("XYZ"));
        assertEquals("same key, same value", signer.sign("xyz"), new Signature("the key").sign("xyz"));
    }
}
