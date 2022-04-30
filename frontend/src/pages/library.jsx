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
import {
    Link,
    useParams,
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import { useRecipes } from "@hooks/useRecipe.js";
import useGroup, { useGroups } from "@hooks/useGroup.js";

import NavMenu, { Item as NavMenuItem } from "@components/navMenu.jsx";
import Menu, { Item as MenuItem } from "@components/menu.jsx";
import Modal from "@components/modal.jsx";
import ConfirmModal from "@components/confirmModal.jsx";
import AddRecipeNavMenu from "@components/addRecipeNavMenu.jsx";

import IconSearch from "@components/icons/search.jsx";
import IconDotsHorizontal from "@components/icons/dotsHorizontal.jsx";
import IconPencil from "@components/icons/pencil.jsx";
import IconTrash from "@components/icons/trash.jsx";
import IconCollection from "@components/icons/collection.jsx";
import IconExternalLink from "@components/icons/externalLink.jsx";
import IconChevronLeft from "@components/icons/chevronLeft.jsx";
import IconChevronRight from "@components/icons/chevronRight.jsx";
import IconChevronDoubleLeft from "@components/icons/chevronDoubleLeft.jsx";

import PrettyLink from "@components/prettyLink.jsx";
import Image from "@components/image.jsx";

const ITEMS_PER_PAGE = 60;
const LibraryPage = ({}) => {
    const { groupId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const navigate = useNavigate();

    const [modal, setModal] = useState();
    const [search, setSearch] = useState();

    const page = parseInt(searchParams.get("p")) || 0;
    const setPage = (p) => setSearchParams({ p });

    const {
        recipes,
        actions: { update: updateRecipe },
    } = useRecipes({
        search,
        group: search ? null : groupId,
        start: page * ITEMS_PER_PAGE,
        count: ITEMS_PER_PAGE,
    });

    const [refreshGroups, setRefreshGroups] = useState();
    const { groups } = useGroups(refreshGroups);
    const {
        group,
        actions: { update: updateGroup, delete: deleteGroup },
    } = useGroup(groupId);

    document.title = `Four Servings ${group?.name || "Library"}`;

    return (
        <>
            {modal === "EDIT_GROUP" && (
                <EditGroupModal
                    group={group}
                    onClose={() => setModal(null)}
                    onUpdate={(updated) => {
                        updateGroup(updated).then(() => {
                            setRefreshGroups(new Date());
                            setModal(null);
                        });
                    }}
                />
            )}
            {modal === "DELETE_GROUP" && (
                <DeleteGroupModal
                    group={group}
                    onClose={() => setModal(null)}
                    onDelete={() => {
                        deleteGroup().then(() => {
                            setRefreshGroups(new Date());
                            setModal(null);
                            navigate("/library");
                        });
                    }}
                />
            )}

            <div className="flex flex-row">
                <nav className="flex-none m-4 flex-col flex items-stretch">
                    <AddRecipeNavMenu />

                    <NavMenu
                        label="Recipe Libary"
                        to="/library"
                        className="mb-4"
                    >
                        {groups?.map((g) => {
                            if (g._id === group?._id) g = group;
                            return (
                                <NavMenuItem key={g._id} to={`/library/${g._id}`}>
                                    {g.name}
                                </NavMenuItem>
                            );
                        })}
                        <NavMenuItem>
                            <div className="relative rounded-lg w-full">
                                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none z-10">
                                    <IconSearch
                                        className="absolute text-slate-400 h-5 w-5"
                                        strokeWidth="2"
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="block w-full pl-8 py-1 px-2 font-light border outline-emerald-600 border-stone-200 rounded-md"
                                    onBlur={(e) =>
                                        setSearch(e.target.value.trim())
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter"
                                            ? setSearch(e.target.value.trim())
                                            : null
                                    }
                                />
                            </div>
                        </NavMenuItem>
                    </NavMenu>
                </nav>

                <div className="flex-grow m-4 ml-0">
                    {search && (
                        <h2 className="font-brand border-b border-b-emerald-700/20 font-semibold text-3xl mb-4">
                            <IconSearch
                                className="text-slate-500 h-6 inline-block mr-2"
                                strokeWidth="2"
                            />
                            {search}
                        </h2>
                    )}
                    {!search && group && (
                        <h2 className="font-brand border-b border-b-emerald-700/20 font-semibold text-3xl mb-4 relative z-[100]">
                            {group.name}
                            <div className="float-right relative">
                                <Menu
                                    button={
                                        <IconDotsHorizontal
                                            className="h-6 w-6 text-emerald-800 hover:text-emerald-600"
                                            strokeWidth="2"
                                        />
                                    }
                                >
                                    <MenuItem
                                        onClick={() => setModal("EDIT_GROUP")}
                                    >
                                        <span className="inline-block align-baseline mr-1">
                                            <IconPencil />
                                        </span>
                                        Edit Group Name
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => setModal("DELETE_GROUP")}
                                    >
                                        <span className="inline-block align-baseline mr-1">
                                            <IconTrash />
                                        </span>
                                        Delete Group
                                    </MenuItem>
                                </Menu>
                            </div>
                        </h2>
                    )}

                    <div className="flex flex-wrap justify-between gap-y-5 gap-x-5 z-0">
                        {recipes &&
                            recipes.results.map((recipe, i) => (
                                <RecipeCard
                                    style={{
                                        zIndex: recipes.results.length - i,
                                    }}
                                    className="grow"
                                    key={recipe._id}
                                    recipe={recipe}
                                    groups={groups}
                                    onUpdate={updateRecipe}
                                />
                            ))}
                    </div>

                    {recipes && recipes.total > ITEMS_PER_PAGE && (
                        <div className="flex mt-2 items-center">
                            <button
                                className={`${
                                    page <= 1 ? "hidden" : ""
                                } text-emerald-800 hover:text-emerald-600 py-1 px-2 mr-2`}
                                onClick={() => setPage(0)}
                            >
                                <IconChevronDoubleLeft
                                    className="w-5"
                                    strokeWidth="3"
                                />
                            </button>
                            <button
                                className={`${
                                    page <= 0 ? "hidden" : ""
                                } text-emerald-800 hover:text-emerald-600 py-1 px-2`}
                                onClick={() => setPage(page - 1)}
                            >
                                <IconChevronLeft
                                    className="w-5"
                                    strokeWidth="3"
                                />
                            </button>
                            <div className="grow text-center text-stone-800/40">
                                {recipes.total} recipe
                                {recipes.total !== 1 ? "s" : ""}
                            </div>
                            <button
                                className={`${
                                    (page + 1) * ITEMS_PER_PAGE >= recipes.total
                                        ? "hidden"
                                        : ""
                                } text-emerald-800 hover:text-emerald-600 py-1 px-2`}
                                onClick={() => setPage(page + 1)}
                            >
                                <IconChevronRight
                                    className="w-5"
                                    strokeWidth="3"
                                />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default LibraryPage;

const RecipeCard = ({ recipe, groups, className, style, onUpdate }) => {
    const img = recipe.images?.length > 0 ? recipe.images[0] : null;
    return (
        <div
            style={style}
            className={`group rounded-lg ring-stone-600 ring-0 border-t border-t-stone-100 bg-stone-50 relative drop-shadow-lg hover:bg-stone-200 ${className}`}
        >
            <Link
                className="absolute inset-0 z-10"
                to={`/recipe/${recipe._id}`}
            ></Link>
            <div className="inset-3 absolute">
                {img ? (
                    <Image
                        className="rounded-md w-full object-cover h-full"
                        src={img}
                    />
                ) : (
                    <div className="inset-0 absolute rounded-md bg-emerald-900/40"></div>
                )}
                <div className="inset-0 absolute rounded-md bg-gradient-to-b from-stone-50 via-stone-50/80 group-hover:via-stone-200/75 group-hover:from-stone-200"></div>
            </div>
            <div className="m-4 min-h-[150px] relative">
                <GroupMenu
                    groups={groups}
                    recipe={recipe}
                    onUpdate={onUpdate}
                />
                <div className="max-w-[200px] font-brand text-2xl font-semibold">
                    {recipe.title}
                </div>
                {recipe.link && (
                    <div className="flex place-content-end">
                        <a
                            className="z-20 inline-block text-light text-sm whitespace-nowrap bg-stone-100/20 backdrop-blur-sm text-emerald-800 hover:text-emerald-600"
                            href={recipe.link}
                            target="ext_recipe"
                        >
                            from <PrettyLink url={recipe.link} />
                            <IconExternalLink
                                className="h-3 w-3 inline align-baseline"
                                strokeWidth="2"
                            />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

const GroupMenu = ({ recipe, groups, onUpdate }) => {
    if (!groups?.length > 0) return null;

    // optimistically control the selected groups
    // if/when the recipe data changes, we'll reset to
    // those group values. but we shouldn't wait.
    const [selected, setSelected] = useState(recipe.groups || []);

    useEffect(() => {
        setSelected(recipe.groups || []);
    }, [...(recipe.groups || [])]);

    const isSelected = (group) => {
        return !!selected.find((g) => g._id === group._id);
    };

    const toggleSelect = (group) => {
        const i = selected.findIndex((g) => g._id == group._id);

        let newSelected;
        const updateRecipe = { ...recipe };
        if (i > -1) {
            newSelected = selected.filter((g) => g._id !== group._id);
        } else {
            newSelected = [...selected, group];
        }
        setSelected(newSelected);
        onUpdate({ ...recipe, groups: newSelected });
    };

    return (
        <div className="float-right">
            <Menu
                button={
                    <div className="p-2 -m-2 text-emerald-800 hover:text-emerald-600">
                        <IconCollection className="h-5 w-5 align-baseline" />
                    </div>
                }
            >
                {groups.map((group) => (
                    <MenuItem
                        key={group._id}
                        onClick={() => toggleSelect(group)}
                    >
                        <span className="inline-block w-4 text-center mr-1">
                            {isSelected(group) ? "✓" : ""}
                        </span>
                        <span>{group.name}</span>
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};

const EditGroupModal = ({ group, onClose, onUpdate }) => {
    const [name, setName] = useState(group?.name);
    useEffect(() => {
        setName(group?.name);
    }, [group?.name]);

    const save = () => {
        onUpdate({ ...group, name });
    };

    return (
        <Modal onClose={onClose}>
            <div className="max-w-xs mx-auto mb-2">
                <h3 className="font-brand inline-block border-b border-b-emerald-700/20 font-semibold text-xl mb-4">
                    Edit Group
                </h3>

                <label className="block mb-2 font-light">
                    Name
                    <input
                        className="w-full block px-2 py-1 rounded-md border-0 drop-shadow-sm outline-emerald-600 border-stone-800 invalid:bg-red-100 invalid:border-red-700 focus:invalid:outline-red-700 invalid:text-red-700"
                        type="text"
                        value={name || ""}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>

                <div className="mt-3">
                    <button
                        onClick={save}
                        className="rounded-lg bg-emerald-700 hover:bg-emerald-900 text-emerald-100 px-3 py-2 inline-block ring-0 ring-emerald-50 drop-shadow-md"
                    >
                        Save
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const DeleteGroupModal = ({ group, onDelete, onClose }) => {
    return (
        <ConfirmModal
            onClose={onClose}
            confirm={
                <div>
                    <IconTrash
                        className="inline-block w-4 align-baseline"
                        strokeWidth="2"
                    />
                    Delete
                </div>
            }
            onConfirm={onDelete}
            cancel="Cancel"
        >
            <p className="text-lg mt-4 mr-5 mb-2">
                Are you sure you want do delete the group "{group?.name}"?
            </p>
            <div className="text-stone-500 font-light text-sm">
                Recipes will remain in your library, but are removed from this
                group.
            </div>
        </ConfirmModal>
    );
};
