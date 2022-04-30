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

import React, { useRef, useState } from "react";

import useUser from "@hooks/useUser.js";

const RegisterPage = ({}) => {
    const { actions } = useUser();

    const [error, setError] = useState();
    const [registering, setRegistering] = useState();

    const [wip, setWIP] = useState({});
    const [confirmPassword, setConfirmPassword] = useState();

    const emailInput = useRef();
    const passwordInput = useRef();

    const createAccount = () => {
        setError(null);
        if (!wip.email) {
            emailInput.current?.focus();
            setError("Email is required");
            return;
        }
        if (!emailInput.current?.validity?.valid) {
            emailInput.current?.focus();
            setError("Email is invalid");
            return;
        }
        if (!wip.password) {
            passwordInput.current?.focus();
            setError("Password is required");
            return;
        }
        if (wip.password?.length < 8) {
            passwordInput.current?.focus();
            setError("Password must be at least 8 characters long");
            return;
        }
        if (wip.password !== confirmPassword) {
            passwordInput.current?.focus();
            setError("The passwords do not match");
            return;
        }

        setRegistering(true);
        actions
            .register(wip)
            .catch((e) => setError(e))
            .finally(() => setRegistering(false));
    };

    return (
        <div className="max-w-xs mx-auto mt-4">
            <h3 className="font-brand border-b border-b-emerald-700/20 font-semibold text-xl mb-4">
                Create an Account
            </h3>

            <label className="block mb-2 font-light">
                Email
                <input
                    ref={emailInput}
                    autoComplete="email"
                    className="w-full block px-2 py-1 rounded-md border-0 drop-shadow-sm outline-emerald-600 border-stone-800 invalid:bg-red-100 invalid:border-red-700 focus:invalid:outline-red-700 invalid:text-red-700"
                    type="email"
                    value={wip.email || ""}
                    onChange={(e) =>
                        setWIP({ ...wip, email: e.target.value.trim() })
                    }
                />
            </label>
            <label className="block mb-2 font-light">
                Password
                <input
                    ref={passwordInput}
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full block px-2 py-1 rounded-md border-0 drop-shadow-sm outline-emerald-600 border-stone-800"
                    type="password"
                    value={wip.password || ""}
                    onChange={(e) =>
                        setWIP({ ...wip, password: e.target.value })
                    }
                    onBlur={(e) =>
                        setWIP({ ...wip, password: e.target.value.trim() })
                    }
                />
            </label>
            <label className="block mb-2 font-light">
                Confirm Password
                <input
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full block px-2 py-1 rounded-md border-0 drop-shadow-sm outline-emerald-600 border-stone-800"
                    type="password"
                    value={confirmPassword || ""}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={(e) => setConfirmPassword(e.target.value.trim())}
                />
            </label>

            <div className="mt-3 flex justify-between">
                <button
                    disabled={registering}
                    onClick={createAccount}
                    className="rounded-lg bg-emerald-700 disabled:bg-emerald-700/60 hover:bg-emerald-900 text-emerald-100 p-3 inline-block ring-0 ring-emerald-50 drop-shadow-md"
                >
                    Create an Account
                </button>
            </div>
            {error && (
                <p className="bg-red-200 max-w-sm mx-auto my-7 p-4 rounded-xl outline outline-0 outline-red-500 text-red-900 text-center">
                    {error}
                </p>
            )}
        </div>
    );
};

export default RegisterPage;
