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

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

import ChevronUp from "@components/icons/chevronUp.jsx";
import ChevronDown from "@components/icons/chevronDown.jsx";

const NavMenu = ({ label, to, className, collapsing, children }) => {
    if (collapsing) {
        return (
            <CollapsingMenu className={className} label={label}>
                {children}
            </CollapsingMenu>
        );
    } else {
        return (
            <FixedMenu className={className} label={label} to={to}>
                {children}
            </FixedMenu>
        );
    }
};

export default NavMenu;

const FixedMenu = ({ label, to, className, children }) => {
    const Label = ({ children, className, ...others }) => {
        return to ? (
            <Link
                to={to}
                className={`${className} hover:bg-emerald-700`}
                {...others}
            >
                {children}
            </Link>
        ) : (
            <div className={className} {...others}>
                {children}
            </div>
        );
    };

    return (
        <div className={`drop-shadow-md flex flex-col ${className}`}>
            <Label className="rounded-t-lg last:rounded-b-lg bg-emerald-700/90 text-emerald-50 p-3 border-emerald-600 border-0 text-left w-full">
                {label}
            </Label>
            {children && (
                <div className="flex flex-col border-0 rounded-md rounded-t-none border-stone-600 border-t-0 divide-y divide-stone-200">
                    {children}
                </div>
            )}
        </div>
    );
};

const CollapsingMenu = ({ label, className, children }) => {
    const [expanded, setExpanded] = useState(false);

    // close when clicked outside of menu
    const menuRef = useRef();
    useEffect(() => {
        const listener = evt => {
            if (menuRef.current && 
                !menuRef.current?.contains(evt.target)) {
                setExpanded(false);
            }
        };
        window.addEventListener("mousedown", listener)
        return () => window.removeEventListener("mousedown", listener);
    }, []);

    return (
        <div ref={menuRef} className={`drop-shadow-md flex flex-col z-10 ${className}`}>
            <button
                onClick={() => setExpanded(!expanded)}
                className="rounded-t-lg last:rounded-b-lg bg-emerald-700/90 hover:bg-emerald-700 text-emerald-50 p-3 border-0 border-emerald-600 text-left"
            >
                {label}
                <div className="float-right ml-2">
                    {expanded ? (
                        <ChevronDown className="h-6 w-6" strokeWidth="2" />
                    ) : (
                        <ChevronUp className="h-6 w-6" strokeWidth="2" />
                    )}
                </div>
            </button>
            {expanded && children && (
                <div className="relative">
                    <div className="absolute z-10 flex flex-col border-0 rounded-b-md border-stone-600 border-t-emerald-600 min-w-full divide-y divide-stone-200">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export const Item = ({ onClick, to, href, target, children }) => {
    if (onClick) {
        return (
            <button
                onClick={onClick}
                className="last:rounded-b-lg py-2 px-4 bg-stone-50 hover:bg-stone-200 text-left font-light whitespace-nowrap flex items-center"
            >
                {children}
            </button>
        );
    } else if (to) {
        return (
            <Link
                to={to}
                className="last:rounded-b-lg py-2 px-4 bg-stone-50 hover:bg-stone-200 text-left font-light whitespace-nowrap flex items-center"
            >
                {children}
            </Link>
        );
    } else if (href) {
        return (
            <a
                href={href}
                target={target}
                className="last:rounded-b-lg py-2 px-4 bg-stone-50 hover:bg-stone-200 text-left font-light whitespace-nowrap flex items-center"
            >
                {children}
            </a>
        );
    } else {
        return (
            <div className="last:rounded-b-lg py-2 px-4 bg-stone-50 flex items-center">
                {children}
            </div>
        );
    }
};
