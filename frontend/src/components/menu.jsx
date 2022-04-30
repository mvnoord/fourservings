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

import React, { useState, useEffect, useRef } from "react";

const Menu = ({ button, children }) => {
    const [show, setShow] = useState(false);

    // close when clicked outside of menu
    const menuRef = useRef();
    useEffect(() => {
        const listener = evt => {
            if (menuRef.current && 
                !menuRef.current?.contains(evt.target)) {
                setShow(false);
            }
        };
        window.addEventListener("mousedown", listener)
        return () => window.removeEventListener("mousedown", listener);
    }, []);

    return (
        <div ref={menuRef} className="relative">
            <button onClick={() => setShow(!show)} className="relative z-30">
                {button}
            </button>
            {show && (
                <div className="absolute mt-2 border-stone-600 border-0 rounded-md right-0 z-30 whitespace-nowrap bg-stone-50 drop-shadow-md text-base divide-stone-200 divide-y flex flex-col">
                    {children}
                </div>
            )}
        </div>
    );
};

export default Menu;

export const Item = ({ children, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="py-2 px-4 first:rounded-t-md last:rounted-b-md hover:bg-stone-200 text-left font-light whitespace-nowrap"
        >
            {children}
        </button>
    );
};
