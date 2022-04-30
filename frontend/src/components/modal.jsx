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

import React, { useEffect, useRef } from "react";

import X from "@components/icons/x.jsx";

const Modal = ({ children, size, onClose }) => {
    // no scrolling
    useEffect(() => {
        const doc = document.documentElement;
        let overflow = doc.style.overflow;
        let paddingRight = doc.style.paddingRight;

        let scrollbarWidth =
            window.innerWidth - doc.clientWidth;

        doc.style.overflow = "hidden";
        doc.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
            doc.style.overflow = overflow;
            doc.style.paddingRight = paddingRight;
        };
    }, []);

    // close when clicked outside of modal
    const modalRef = useRef();
    useEffect(() => {
        const listener = evt => {
            if (modalRef.current &&
                !modalRef.current.contains(evt.target)) {
                onClose();
            }
        };
        window.addEventListener("mousedown", listener)
        return () => window.removeEventListener("mousedown", listener);
    }, []);

    return (
        <div
            className="bg-black/50 backdrop-blur-sm py-3 fixed inset-0 z-[999]"
        >
            <div 
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                className={`${size === "full" ? "mx-4 h-full" : "max-w-sm mx-auto"} p-4 ring-0 ring-stone-800 drop-shadow-lg rounded-xl bg-stone-200 relative`}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 p-1 rounded-full ring-0 w-7 h-7 ring-emerald-600 text-emerald-700 hover:bg-emerald-200 bg-emerald-100/80 drop-shadow-md"
                >
                    <X className="h-5 w-5" strokeWidth="2" />
                </button>

                {children}
            </div>
        </div>
    );
};

export default Modal;
