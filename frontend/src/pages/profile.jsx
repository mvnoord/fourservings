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

import React, { useEffect, useRef, useState } from "react";

import useUser from "@hooks/useUser.js";

const ProfilePage = ({}) => {
    document.title = "Update Your Information";

    const { user, actions } = useUser();

    const [error, setError] = useState();
    const [success, setSuccess] = useState();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        setName(user.name);
        setEmail(user.email);
    }, [user.name, user.email]);

    const emailInput = useRef();
    const passwordInput = useRef();
    const newPasswordInput = useRef();

    const update = () => {
        setError(null);
        setSuccess(null);

        if (!emailInput.current?.validity?.valid) {
            setError("Email is invalid");
            emailInput.current?.focus();
            return;
        }
        if (email !== user.email && !oldPassword) {
            setError(
                "To change your email, you must enter your current password."
            );
            passwordInput.current?.focus();
            return;
        }
        if (password && !oldPassword) {
            setError(
                "To change your password, you must enter current password."
            );
            passwordInput.current?.focus();
            return;
        }
        if (password && password.length < 8) {
            setError("Password must be at least 8 characters long");
            newPasswordInput.current?.focus();
            return;
        }

        actions
            .update({ name, email, oldPassword, password })
            .then(() => setSuccess(true))
            .catch(setError);
    };

    return (
        <div className="max-w-xs mx-auto mt-4">
            <h3 className="font-brand border-b border-b-emerald-700/20 font-semibold text-xl mb-4">
                Update Your Information
            </h3>

            <label className="block mb-2 font-light">
                Name
                <input
                    autoComplete="name"
                    className="w-full block px-2 py-1 rounded-md border-0 drop-shadow-sm outline-emerald-600 border-stone-800 invalid:bg-red-100 invalid:border-red-700 focus:invalid:outline-red-700 invalid:text-red-700"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </label>
            <label className="block mb-2 font-light">
                Email
                <input
                    ref={emailInput}
                    autoComplete="email"
                    className="w-full block px-2 py-1 rounded-md border-0 drop-shadow-sm outline-emerald-600 border-stone-800 invalid:bg-red-100 invalid:border-red-700 focus:invalid:outline-red-700 invalid:text-red-700"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </label>
            <label className="block mb-2 font-light">
                Current Password
                <input
                    autoComplete="current-password"
                    className="w-full block px-2 py-1 rounded-md border-0 drop-shadow-sm outline-emerald-600 border-stone-800 invalid:bg-red-100 invalid:border-red-700 focus:invalid:outline-red-700 invalid:text-red-700"
                    type="password"
                    ref={passwordInput}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    onBlur={(e) => setOldPassword(e.target.value.trim())}
                />
            </label>
            <label className="block mb-2 font-light">
                New Password
                <input
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full block px-2 py-1 rounded-md border-0 drop-shadow-sm outline-emerald-600 border-stone-800 invalid:bg-red-100 invalid:border-red-700 focus:invalid:outline-red-700 invalid:text-red-700"
                    type="password"
                    ref={newPasswordInput}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={(e) => setPassword(e.target.value.trim())}
                />
            </label>

            <div className="mt-3 flex justify-between">
                <button
                    onClick={update}
                    className="rounded-lg bg-emerald-700 hover:bg-emerald-900 text-emerald-100 p-3 inline-block ring-0 ring-emerald-50 drop-shadow-md"
                >
                    Update
                </button>
            </div>

            {error && (
                <p className="bg-red-200 max-w-sm mx-auto my-7 p-4 rounded-xl outline outline-0 outline-red-500 text-red-900 text-center">
                    {error}
                </p>
            )}
            {success && (
                <p className="bg-white max-w-sm mx-auto my-7 p-4 rounded-xl outline outline-0 outline-stone-500 font-light">
                    Successfully updated your information!
                </p>
            )}
        </div>
    );
};

export default ProfilePage;
