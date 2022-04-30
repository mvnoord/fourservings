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

import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.util.List;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.inject.Inject;
import javax.inject.Singleton;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;

import com.google.inject.Provider;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;

import org.apache.commons.lang3.StringUtils;
import org.bson.Document;
import org.bson.types.Binary;
import org.bson.types.ObjectId;

/** Handle all the account registration, login, and update 
 * functionality.
 */
@Singleton
public class AccountManager {
    static final String COLLECTION_ACCOUNT = "account";

    private final Provider<MongoDatabase> mongo;

    @Inject
    public AccountManager(Provider<MongoDatabase> mongo) {
        this.mongo = mongo;
    }

    private byte[] hash(String password, byte[] salt) {
        try {
            KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 65536, 128);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
            return factory.generateSecret(spec).getEncoded();
        } catch (Exception e) {
            throw new RuntimeException("Unable to hash password", e);
        }
    }

    /** Create a new account.
     * @return <pre>
     * {
     *   "_id": ObjectId(),
     *   "name": "Name",
     *   "email": "e@mail.com"
     * }
     * </pre>
     */
    public Document register(String name, String email, String password) {
        if (StringUtils.isAnyBlank(email, password)) {
            throw new BadRequestException("email and password are required");
        }

        if (this.findAccount(email) != null) {
            throw new BadRequestException("Email is already in use, try another");
        }

        Document account = new Document()
                .append("_id", new ObjectId())
                .append("email", email.toLowerCase().trim())
                .append("name", name);
        appendPassword(account, password);

        MongoCollection<Document> accounts = this.mongo.get().getCollection(COLLECTION_ACCOUNT);
        accounts.insertOne(account);

        return scrubSecure(account);
    }

    private void appendPassword(Document account, String password) {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[8];
        random.nextBytes(salt);

        account
                .append("password", new Document()
                        .append("hash", hash(password.trim(), salt))
                        .append("salt", salt));
    }

    private Document findAccount(String email) {
        MongoCollection<Document> accounts = this.mongo.get().getCollection(COLLECTION_ACCOUNT);
        return accounts.find(Filters.eq("email", email.toLowerCase().trim())).first();
    }

    private Document scrubSecure(Document account) {
        account.remove("password");
        return account;
    }

    /**
     * Login with the given email/password combo.
     * 
     * @param email
     * @param password
     * @return The account when login is successful.
     * @throws NotFoundException when email doesn't exist or password doesn't
     *                             match
     */
    public Document login(String email, String password) throws NotFoundException {
        Document account = findAccount(email);
        if (account == null)
            throw new NotFoundException("Email or password is invalid");

        if (!isPasswordMatch(account, password)) {
            throw new NotFoundException("Email or password is invalid");
        }

        return scrubSecure(account);
    }

    private boolean isPasswordMatch(Document account, String password) {
        byte[] hashed = hash(
                password.trim(),
                account.getEmbedded(List.of("password", "salt"), Binary.class).getData());
        return account.getEmbedded(List.of("password", "hash"), Binary.class)
                .equals(new Binary(hashed));
    }

    /** Update the given account.  If the email or password changes, "oldPassword" is required and
     * validated against the account's password.
     */
    public Document update(ObjectId id, String name, String email, String password, String oldPassword) {
        MongoCollection<Document> accounts = this.mongo.get().getCollection(COLLECTION_ACCOUNT);

        Document account = accounts.find(Filters.eq("_id", id)).first();
        if (account == null)
            throw new NotFoundException();

        if (email != null)
            email = email.trim().toLowerCase();
        if (StringUtils.isNotBlank(email) && !email.equals(account.getString("email"))) {
            // email change, we need to verify password
            if (StringUtils.isBlank(oldPassword)) {
                throw new BadRequestException("Password is required to change email address");
            }
            if (!isPasswordMatch(account, oldPassword)) {
                throw new BadRequestException("Invalid password");
            }

            if (findAccount(email) != null) {
                throw new BadRequestException("Email address already exists");
            }

            account.append("email", email);
        }

        if (StringUtils.isNotBlank(password) &&
                (StringUtils.isBlank(oldPassword) || !password.trim().equals(oldPassword.trim()))) {
            // password change, we need to verify w/ old password
            if (StringUtils.isBlank(oldPassword)) {
                throw new BadRequestException("Previous password is required to change password");
            }
            if (!isPasswordMatch(account, oldPassword)) {
                throw new BadRequestException("Invalid password");
            }

            appendPassword(account, password);
        }

        account.append("name", name);

        accounts.replaceOne(Filters.eq("_id", id), account);

        return scrubSecure(account);
    }

    /** Get the account by id. Throw NotFountException if it could not
     * be found.
     */
    public Document getAccount(ObjectId accountId) throws NotFoundException {
        if (accountId == null) throw new NotFoundException();

        MongoCollection<Document> accounts = this.mongo.get().getCollection(COLLECTION_ACCOUNT);
        Document account = accounts.find(Filters.eq("_id", accountId)).first();
        if (account == null) throw new NotFoundException();

        return scrubSecure(account);
    }
}
