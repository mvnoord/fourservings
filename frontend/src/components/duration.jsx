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

import React, { useEffect, useState } from "react";

const Duration = ({ value }) => {
    try {
        return toString(parse(value));
    } catch (e) {
        return value;
    }
};
export default Duration;

export const DurationInput = ({ className, value, onChange, onBlur }) => {
    const [inputValue, setInputValue] = useState();

    const resetInputValue = () => {
        try {
            setInputValue(toString(parse(value)));
        } catch (e) {
            // unparseable value
        }
    };
    useEffect(() => {
        resetInputValue();
    }, [value]);

    const blur = (e) => {
        /*
        try {
            console.log(inputValue, parse(inputValue), toISO(parse(inputValue)));
        } catch (e) {
            console.log(e);
        }
        */

        let iso = value;
        try {
            iso = toISO(parse(inputValue));
        } catch (e) {
            // unparseable user input
        }
        if (iso !== value && onChange) {
            onChange({
                target: { value: iso },
            });
        } else {
            resetInputValue();
        }
        onBlur({
            target: { value: iso },
        });
    };

    return (
        <input
            className={className}
            value={inputValue||""}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={blur}
            type="text"
        />
    );
};

export function toString(duration) {
    if (!duration) return "";

    let str = "";
    function append(val, unit) {
        if (val > 0) {
            if (str.length > 0) str += " ";
            str += `${val} ${unit}${val !== 1 ? "s" : ""}`;
        }
    }
    append(duration.years, "yr");
    append(duration.months, "mon");
    append(duration.days, "day");
    append(duration.hours, "hr");
    append(duration.minutes, "min");
    append(duration.seconds, "sec");
    return str;
}

function toISO(duration) {
    if (!duration) return null;

    let iso = "P";
    if (duration.years > 0) iso += `${duration.years}Y`;
    if (duration.months > 0) iso += `${duration.months}M`;
    if (duration.days > 0) iso += `${duration.days}D`;

    let time = "";
    // always output hrs and mins if there is any time component
    if (duration.hours > 0 || duration.minutes > 0 || duration.seconds > 0) {
        time += `${duration.hours}H`;
        time += `${duration.minutes}M`;
        if (duration.seconds > 0) time += `${duration.seconds}S`;
    }

    if (time) {
        iso += "T" + time;
    }
    return iso.length > 1 ? iso : null;
}

function parse(value) {
    if (!value) return {};
    value = value.trim();

    const iso = value?.match(
        /P(?:([0-9]+)Y)?(?:([0-9]+)M)?(?:([0-9]+)D)?T(?:([0-9]+)H)?(?:([0-9]+)M)?(?:([0-9]+)S)?/
    );
    if (iso) {
        return {
            years: parseInt(iso[1]) || 0,
            months: parseInt(iso[2]) || 0,
            days: parseInt(iso[3]) || 0,
            hours: parseInt(iso[4]) || 0,
            minutes: parseInt(iso[5]) || 0,
            seconds: parseInt(iso[6]) || 0,
        };
    }
    const colon = value?.split(":");
    if (colon && colon.length < 4 && colon.length > 1) {
        if (colon.length === 3) {
            return {
                hours: parseInt(colon[0]) || 0,
                minutes: parseInt(colon[1]) || 0,
                seconds: parseInt(colon[2]) || 0,
            };
        } else if (colon.length === 2) {
            return {
                hours: parseInt(colon[0]) || 0,
                minutes: parseInt(colon[1]) || 0,
                seconds: 0,
            };
        }
    }

    const readable = value?.match(
        /(?:([0-9]+) ?h[^0-9 ]*)? ?(?:([0-9]+) ?m[^0-9 ]*)? ?(?:([0-9]+) ?s[^0-9 ]*)?/
    );
    if (readable) {
        if (readable[0]) {
            // ensure *something* matched
            return {
                hours: parseInt(readable[1]) || 0,
                minutes: parseInt(readable[2]) || 0,
                seconds: parseInt(readable[3]) || 0,
            };
        }
    }

    throw `Unable to parse "${value}"`;
}
