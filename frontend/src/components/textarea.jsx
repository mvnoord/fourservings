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

import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";

const eq = (a, b) => {
    if (a == b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

/** Paragraph-array preserving textarea.  Works like a regular textarea
 * but the value is an array of strings.  Each element of the array is a
 * paragraph.
 */
const Textarea = ({ className, value, onChange, onBlur }) => {
    if (!value) value = [""];

    // Automatically adjust the height the first time a value is sent in.
    const input = useRef();
    const [withValue, setWithValue] = useState();
    useEffect(() => {
        if (!withValue && input.current && value.join("\n")) {
            const height = input.current.scrollHeight;
            if (height > 500 && height < 2000) {
                input.current.style.height = `${input.current.scrollHeight}px`;
            }
            setWithValue(true);
        }
    }, [value.join("\n")])

    return (
        <textarea
            ref={input}
            className={className}
            value={value.join("\n")}
            onChange={(e) => {
                const newValue = e.target.value.split(/\n/);
                if (onChange && !eq(value, newValue)) {
                    onChange({
                        target: { value: newValue },
                    });
                }
            }}
            onBlur={(e) => {
                if (onBlur) {
                    let newValue = e.target.value.trim().split(/\n+/);
                    if (newValue.length === 1 && !newValue[0]) {
                        newValue = [];
                    }
                    onBlur({
                        target: { value: newValue },
                    });
                }
            }}
        ></textarea>
    );
};
Textarea.propTypes = {
    className: PropTypes.string,
    value: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
};
export default Textarea;
