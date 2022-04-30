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

import React, { useState, createContext, useContext, useEffect } from "react";
import { get, post, put } from "@hooks/backend.js";

export const UserContext = createContext({ user: null, actions: null });

const useUserContext = () => useContext(UserContext);
export default useUserContext;

export const useUserState = () => {
    const [user, setUser] = useState("LOADING");

    useEffect(() => {
        get("/account/")
            .then(setUser)
            .catch(() => setUser(null)); // not logged in
    }, []);

    const actions = {
        register: (data) => {
            return post("/account/", data).then(setUser);
        },
        resetPassword: (email) => {
            return put("/account/_resetpassword");
        },
        update: (data) => {
            return put("/account/", data).then(setUser);
        },
        login: (email, password) => {
            return get("/account/_login", { email, password }).then(setUser);
        },
        logout: () => {
            setUser(null);
            return get("/account/_logout");
        },
    };

    return {
        user: user === "LOADING" ? null : user,
        loading: user === "LOADING",
        actions,
    };
};
