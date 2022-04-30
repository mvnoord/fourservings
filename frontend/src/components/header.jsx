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

import React from "react";
import { Link } from "react-router-dom";

import useUser from "@hooks/useUser.js";

const Header = () => {
    const { user, actions } = useUser();

    const onLogout = () => {
        actions.logout();
    }

    return (
        <header className="bg-stone-300 shadow-stone-500/40 shadow-lg flex flex-row justify-between items-center p-3">
            <Link to="/" className="hover:text-stone-600">
                <h3 className="font-brand flex-none text-4xl font-bold">
                    Four Servings
                </h3>
            </Link>
            {user && (
                <div className="flex flex-col text-center">
                    <div className="font-light text-lg">Welcome{user.name && (<>, {user.name}</>)}!</div>
                    <div className="text-sm divide-x divide-emerald-900">
                        <button onClick={onLogout} className="px-1 text-emerald-800 hover:text-emerald-600">
                            Logout
                        </button>
                        <Link
                            className="px-1 text-emerald-800 hover:text-emerald-600"
                            to="/profile"
                        >
                            Edit Your Info
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
