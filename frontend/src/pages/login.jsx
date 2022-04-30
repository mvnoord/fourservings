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

import React, { useState } from "react";
import { Link } from "react-router-dom";

import useUser from "@hooks/useUser.js";

const LoginPage = ({}) => {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();

    const [error, setError] = useState();

    const { actions } = useUser();

    const login = () => {
        if (email && password) {
            setError(null);
            actions.login(email, password).catch(setError);
        }
    };
    return (
        <div className="max-w-xs mx-auto mt-4">
            <h3 className="font-brand border-b border-b-emerald-700/20 font-semibold text-xl mb-4">
                Login
            </h3>

            <label className="block mb-2 font-light">
                Email
                <input
                    autoComplete="email"
                    className="w-full block px-2 py-1 rounded-md border-0 drop-shadow-sm outline-emerald-600 border-stone-800 invalid:bg-red-100 invalid:border-red-700 focus:invalid:outline-red-700 invalid:text-red-700"
                    type="email"
                    value={email || ""}
                    onKeyDown={(e) => (e.key === "Enter" ? login() : null)}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </label>
            <label className="block mb-2 font-light">
                Password
                <input
                    autoComplete="current-password"
                    className="w-full block px-2 py-1 rounded-md border-0 drop-shadow-sm outline-emerald-600 border-stone-800"
                    type="password"
                    value={password || ""}
                    onKeyDown={(e) => (e.key === "Enter" ? login() : null)}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </label>

            <div className="mt-3 flex justify-between">
                <button
                    onClick={login}
                    className="rounded-lg bg-emerald-700 hover:bg-emerald-900 text-emerald-100 p-3 inline-block ring-0 ring-emerald-50 drop-shadow-md"
                >
                    Login
                </button>
                <Link
                    to="/register"
                    className="rounded-lg bg-emerald-100/80 hover:bg-emerald-200 text-emerald-700 p-3 inline-block ring-0 ring-emerald-600 drop-shadow-md"
                >
                    Create an Account
                </Link>
            </div>

            {error && (
                <p className="bg-red-200 max-w-sm mx-auto my-7 p-4 rounded-xl outline outline-0 outline-red-500 text-red-900 text-center">
                    Invalid email or password.
                </p>
            )}

            <p className="bg-white max-w-sm mx-auto my-7 p-4 rounded-xl outline outline-0 outline-stone-500 font-light">
                Forgot your password?
                <Link
                    className="ml-1 text-emerald-800 hover:text-emerald-600 font-semibold"
                    to="/reset"
                >
                    Click here to reset it.
                </Link>
            </p>
        </div>
    );
};

export default LoginPage;
