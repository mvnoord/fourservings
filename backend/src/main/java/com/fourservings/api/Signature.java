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

import java.io.UnsupportedEncodingException;
import java.security.SecureRandom;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Singleton
public class Signature {
    public static final Logger LOGGER = LoggerFactory.getLogger(Signature.class);

    private final SecretKeySpec key;

    @Inject
    public Signature(@Named("PRIVATE_KEY") String key) {
        byte[] privateKey;

        if (StringUtils.isBlank(key)) {
            LOGGER.warn("*** PRIVATE_KEY is not set, using a temporary random value. " +
                 "This is secure, but all client sessions will be reset upon server restart. ***");

            SecureRandom random = new SecureRandom();
            privateKey = new byte[128];
            random.nextBytes(privateKey);

        } else {
            try {
                privateKey = key.getBytes("UTF-8");
            } catch (UnsupportedEncodingException e) {
                throw new RuntimeException(e);
            }
        }

        this.key = new SecretKeySpec(privateKey, "HmacSHA256");
    }   

    /** Cryptographically sign the given string value and return a
     * base64 (safe) encoded signature.
     */
    public String sign(String value) {
        if (value == null) throw new NullPointerException("value must not be null");

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(this.key);
    
            byte[] signature = mac.doFinal(value.getBytes("UTF-8"));
            return Base64.encodeBase64URLSafeString(signature);
        } catch (Exception e) {
            throw new RuntimeException("Unable to sign value", e);
        }
    }
}
