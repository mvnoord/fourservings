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

import React, { useState, useEffect } from "react";

import { get, post, put, del } from "@hooks/backend.js";

const useGroup = (groupId) => {
    const [group, setGroup] = useState();

    const { groups, actions: groupsActions } = useGroups();

    useEffect(() => {
        setGroup(groups?.find((g) => g._id === groupId));
    }, [groupId, groups]);

    const actions = {
        update: (group) => {
            if (group._id !== groupId) throw "Wrong group";
            return groupsActions.update(group);
        },
        delete: () => {
            return groupsActions.delete(groupId);
        },
    };

    return { group, actions };
};
export default useGroup;

export const useGroups = (refresh) => {
    const [groups, setGroups] = useState();

    useEffect(() => {
        get("/groups/")
            .then((resp) =>
                setGroups(resp.results.sort((a, b) => a.name.localeCompare(b.name)))
            )
            .catch((e) => console.error("Unable to get groups", e));
    }, [refresh]);

    const actions = {
        add: (group) => {
            return post("/groups/", group).then((newGroup) => {
                setGroups([...groups, newGroup]);
                return newGroup;
            });
        },
        update: (group) => {
            return put(`/groups/${group._id}`, group).then((updated) => {
                setGroups(
                    groups.map((g) => (g._id === updated._id ? updated : g))
                );
                return updated;
            });
        },
        delete: (id) => {
            return del(`/groups/${id}`).then(() => {
                setGroups(groups.filter((g) => g._id !== id));
            });
        },
    };

    return { groups, actions };
};
