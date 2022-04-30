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

const DateFormatter = ({value}) => {
    if (!(value instanceof Date)) {
        value = new Date(Date.parse(value));
    }
    if (!value) return "";

    const aYearAgo = new Date();
    aYearAgo.setFullYear(aYearAgo.getFullYear() - 1);

    if (value < aYearAgo) {
        return value.toLocaleDateString(undefined, {
            month: "short",
            year: "numeric",
        });
    } else {
        return value.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }
};

export default DateFormatter;