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

import React, { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate, Navigate } from "react-router-dom";

import useRecipe from "@hooks/useRecipe.js";
import { useGroups } from "@hooks/useGroup.js";

import Modal from "@components/modal.jsx";
import ConfirmModal from "@components/confirmModal.jsx";
import NavMenu, { Item as NavMenuItem } from "@components/navMenu.jsx";
import AddRecipeNavMenu from "@components/addRecipeNavMenu.jsx";
import DateFormatter from "@components/date.jsx";
import Duration from "@components/duration.jsx";

import IconTrash from "@components/icons/trash.jsx";
import IconCollection from "@components/icons/collection.jsx";
import IconExternalLink from "@components/icons/externalLink.jsx";
import IconPencilAlt from "@components/icons/pencilAlt.jsx";
import IconDocumentDuplicate from "@components/icons/documentDuplicate.jsx";
import IconArrowsExpand from "@components/icons/arrowsExpand.jsx";
import PrettyLink from "@components/prettyLink.jsx";
import Image from "@components/image.jsx";

const RecipePage = ({}) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [modal, setModal] = useState();
    const { recipe, actions, notFound } = useRecipe(id);

    if (recipe?.title) document.title = recipe.title;

    const [newNote, setNewNote] = useState("");

    if (notFound) return <Navigate to="/library" />;
    if (!recipe) return null;

    const save = (changed) => {
        return actions.update(changed);
    };

    const copy = () => {
        actions
            .add({
                ...recipe,
                id: undefined,
                notes: undefined,
                groups: undefined,
            })
            .then((newRecipe) => navigate(`/edit/${newRecipe._id}`));
    };

    const deleteRecipe = () => {
        return actions.delete().then(() => navigate("/library"));
    };

    const addNote = () => {
        if (!newNote) return;
        setNewNote("");
        save({
            ...recipe,
            notes: [
                ...(recipe.notes || []),
                { date: new Date().toISOString(), note: newNote },
            ],
        });
    };

    const removeNote = (i) => {
        if (recipe.notes?.length < i) return;

        const notes = [...recipe.notes];
        notes.splice(i, 1);
        save({
            ...recipe,
            notes: notes,
        });
    }

    return (
        <>
            {modal?.type === "EDIT_GROUPS" && (
                <EditGroupsModal
                    recipe={recipe}
                    onClose={() => setModal(null)}
                    onSave={(selected) => {
                        save({ ...recipe, groups: selected }).then(() =>
                            setModal(null)
                        );
                    }}
                />
            )}
            {modal?.type === "PHOTOS" && (
                <PhotosModal
                    recipe={recipe}
                    scrollTo={modal.scrollTo}
                    onClose={() => setModal(null)}
                />
            )}
            {modal?.type === "DELETE_RECIPE" && (
                <DeleteRecipeModal
                    onClose={() => setModal(null)}
                    onDelete={deleteRecipe}
                />
            )}

            <div className="flex flex-row">
                <nav className="flex-none m-4 flex-col flex items-stretch">
                    <AddRecipeNavMenu />

                    <Link
                        to="/library"
                        className="mb-4 drop-shadow-md rounded-lg bg-emerald-700/90 hover:bg-emerald-700 text-emerald-50 p-3 border-emerald-600 border-0 text-left w-full"
                    >
                        Recipe Library
                    </Link>

                    <NavMenu label={recipe.title} className="mb-4">
                        <NavMenuItem
                            onClick={() => setModal({ type: "EDIT_GROUPS" })}
                        >
                            <span className="mr-2">
                                <IconCollection />
                            </span>
                            <span className="max-w-[10rem] text-ellipsis overflow-hidden">
                                <GroupNames recipe={recipe} />
                            </span>
                        </NavMenuItem>

                        <NavMenuItem
                            onClick={() => setModal({ type: "DELETE_RECIPE" })}
                        >
                            <span className="mr-2">
                                <IconTrash />
                            </span>
                            Delete
                        </NavMenuItem>

                        <NavMenuItem to={`/edit/${recipe._id}`}>
                            <span className="mr-2">
                                <IconPencilAlt />
                            </span>
                            Edit
                        </NavMenuItem>

                        <NavMenuItem onClick={copy}>
                            <span className="mr-2">
                                <IconDocumentDuplicate />
                            </span>
                            Copy
                        </NavMenuItem>
                        {recipe.link && (
                            <NavMenuItem href={recipe.link} target="ext_recipe">
                                <span className="mr-2">
                                    <IconExternalLink />
                                </span>
                                <PrettyLink url={recipe.link} />
                            </NavMenuItem>
                        )}

                        <NavMenuItem to={`/cooktime/${recipe._id}`}>
                            <span className="mr-2">
                                <IconArrowsExpand />
                            </span>
                            Cooktime View
                        </NavMenuItem>
                    </NavMenu>
                </nav>

                <div className="flex-grow m-4 ml-0">
                    <div className="bg-stone-50 px-4 pb-4 pt-3 rounded-lg mb-4">
                        <h2 className="font-brand border-b border-emerald-700/20 font-semibold text-2xl mb-3">
                            {recipe.title}
                        </h2>

                        <div className="mb-2 flex flex-col md:flex-row justify-between">
                            {recipe.yield && (
                                <div className="font-light mb-1">
                                    Servings: <span>{recipe.yield}</span>
                                </div>
                            )}
                            {recipe.prepTime && (
                                <div className="font-light mb-1">
                                    Prep Time:{" "}
                                    <span>
                                        <Duration value={recipe.prepTime} />
                                    </span>
                                </div>
                            )}
                            {recipe.cookTime && (
                                <div className="font-light mb-1">
                                    Cook Time:{" "}
                                    <span>
                                        <Duration value={recipe.cookTime} />
                                    </span>
                                </div>
                            )}
                        </div>

                        {recipe.ingredients?.length > 0 && (
                            <>
                                <h3 className="font-brand text-xl mb-3 border-b border-emerald-700/20">
                                    Ingredients
                                </h3>
                                <ul className="mb-4 font-light list-disc list-inside">
                                    {recipe.ingredients?.map((ingredient) => (
                                        <li key={ingredient}>{ingredient}</li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {recipe.directions?.length > 0 && (
                            <>
                                <h3 className="font-brand text-xl mb-3 border-b border-emerald-700/20">
                                    Directions
                                </h3>
                                <div className="font-light space-y-3 mb-4">
                                    {recipe.directions?.map((dir) => (
                                        <p key={dir}>{dir}</p>
                                    ))}
                                </div>
                            </>
                        )}

                        {recipe.images?.length > 0 && (
                            <div className="border-t border-emerald-700/20 pt-4 flex flex-wrap gap-4">
                                {recipe.images?.map((url) => (
                                    <button
                                        key={url}
                                        onClick={() =>
                                            setModal({
                                                type: "PHOTOS",
                                                scrollTo: url,
                                            })
                                        }
                                        className="grow drop-shadow-md"
                                    >
                                        <Image
                                            className="rounded-lg h-[12rem] object-cover w-full"
                                            src={url}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {recipe.notes?.map((note, i) => (
                        <div
                            key={i}
                            className="mb-4 rounded-lg bg-stone-50 p-4 relative after:clear-both after:content-[' '] after:table"
                        >
                            <button
                                title="Remove note"
                                onClick={() => removeNote(i)}
                                className="absolute right-3 top-3 p-1 rounded-md bg-emerald-100/30 hover:bg-emerald-200 hover:text-emerald-700 text-emerald-700/50 drop-shadow-md"
                            >
                                <IconTrash
                                    className="h-5 w-5"
                                    strokeWidth="2"
                                />
                            </button>

                            <p className="text-lg whitespace-pre-line">
                                {note.note}
                            </p>
                            <div className="font-light float-right inline-block">
                                <DateFormatter value={note.date} />
                            </div>
                        </div>
                    ))}

                    <div>
                        <textarea
                            className="w-full mb-3 px-2 py-1 rounded-md border-0 drop-shadow-sm outline-emerald-600 border-stone-800 bg-stone-50 text-lg"
                            rows="4"
                            placeholder="Write your notes here"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                        ></textarea>
                        <button
                            onClick={addNote}
                            className="float-right rounded-lg bg-emerald-700 hover:bg-emerald-900 text-emerald-100 p-3 inline-block ring-0 ring-emerald-50 drop-shadow-md"
                        >
                            Add Note
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RecipePage;

const EditGroupsModal = ({ recipe, onClose, onSave }) => {
    const { groups, actions } = useGroups();

    const [confirmDelete, setConfirmDelete] = useState();
    const [selected, setSelected] = useState(
        recipe.groups ? [...recipe.groups] : []
    );
    const [newName, setNewName] = useState("");

    // Ensure we remove any selected groups that have been deleted.
    useEffect(() => {
        if (groups) {
            setSelected(
                selected.filter((sel) => groups.find((g) => g._id === sel._id))
            );
        }
    }, [JSON.stringify(groups)]);

    const toggleSelect = (group) => {
        const i = selected.findIndex((g) => g._id == group._id);
        if (i > -1) {
            setSelected(selected.filter((g) => g._id !== group._id));
        } else {
            setSelected([...selected, group]);
        }
    };

    const add = () => {
        if (newName) {
            setNewName("");
            actions.add({ name: newName }).then((group) => toggleSelect(group));
        }
    };
    const deleteGroup = (group) => {
        actions.delete(group._id).then(() => setConfirmDelete(null));
    };

    return (
        <Modal onClose={onClose}>
            {confirmDelete && (
                <DeleteGroupModal
                    group={confirmDelete}
                    onClose={() => setConfirmDelete(null)}
                    onDelete={() => deleteGroup(confirmDelete)}
                />
            )}
            <div className="max-w-xs mx-auto">
                <h3 className="font-brand inline-block border-b border-b-emerald-700/20 font-semibold text-xl mb-4">
                    Edit Groups
                </h3>

                <div className="mb-2 w-full divide-stone-200 divide-y flex flex-col">
                    {groups?.map((group) => (
                        <div
                            key={group._id}
                            onClick={() => toggleSelect(group)}
                            className="flex rounded-lg mb-px"
                        >
                            <button className="grow rounded-lg rounded-r-none py-1 px-2 bg-stone-50 hover:bg-stone-200 text-left font-light drop-shadow-md">
                                <span className="inline-block w-4 text-center mr-1">
                                    {selected.find((g) => g._id === group._id)
                                        ? "✓"
                                        : ""}
                                </span>
                                <span>{group.name}</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDelete(group);
                                }}
                                className="rounded-lg rounded-l-none bg-emerald-700 hover:bg-emerald-900 text-emerald-100 py-1 px-2 inline-block border-0 border-emerald-50 drop-shadow-md"
                            >
                                <IconTrash strokeWidth="2" />
                            </button>
                        </div>
                    ))}
                </div>

                <label className="block mb-2 font-light">
                    Add Group
                    <div className="flex flex-row">
                        <input
                            className="grow px-2 py-1 rounded-md rounded-r-none border-0 drop-shadow-sm outline-emerald-600 border-stone-800"
                            type="text"
                            placeholder="Group Name"
                            value={newName}
                            onKeyDown={(e) =>
                                e.key === "Enter" ? add() : null
                            }
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <button
                            disabled={!newName}
                            onClick={add}
                            className="rounded-lg rounded-l-none bg-emerald-700 hover:bg-emerald-900 text-emerald-100 py-1 px-2 inline-block border-0 border-emerald-50 drop-shadow-md"
                        >
                            +
                        </button>
                    </div>
                </label>

                <div className="mt-3">
                    <button
                        onClick={() => onSave(selected)}
                        className="rounded-lg bg-emerald-700 hover:bg-emerald-900 text-emerald-100 px-3 py-2 inline-block ring-0 ring-emerald-50 drop-shadow-md"
                    >
                        Save
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const GroupNames = ({ recipe }) => {
    const { groups } = useGroups();

    return (
        recipe.groups
            ?.map((recipeGroup) => {
                let theGroup = groups?.find((g) => g._id === recipeGroup._id);
                if (!theGroup) theGroup = recipeGroup;
                return theGroup.name;
            })
            ?.join(", ") || ""
    );
};

const DeleteGroupModal = ({ group, onClose, onDelete }) => {
    return (
        <ConfirmModal
            onClose={onClose}
            onConfirm={onDelete}
            confirm={
                <div>
                    <IconTrash
                        className="inline-block w-4 align-baseline"
                        strokeWidth="2"
                    />
                    Delete
                </div>
            }
            cancel="Cancel"
        >
            <p className="text-lg mt-4 mr-5 mb-2">
                Are you sure you want do delete the group "{group.name}"?
            </p>
            <div className="text-stone-500 font-light text-sm">
                Any associated recipes will remain in your library, but are
                removed from this group.
            </div>
        </ConfirmModal>
    );
};

const PhotosModal = ({ recipe, onClose, scrollTo }) => {
    const imgRef = useRef();
    useEffect(() => {
        imgRef.current?.scrollIntoView();
    }, [imgRef.current]);

    return (
        <Modal size="full" onClose={onClose}>
            <div className="h-full align-center flex gap-4 justify-start overflow-x-scroll snap-x snap-mandatory">
                {recipe.images?.map((url) => (
                    <Image
                        ref={scrollTo === url ? imgRef : null}
                        key={url}
                        className="rounded-md snap-center snap-always grow object-contain"
                        src={url}
                    />
                ))}
            </div>
        </Modal>
    );
};

const DeleteRecipeModal = ({ onClose, onDelete }) => {
    return (
        <ConfirmModal
            onClose={onClose}
            onConfirm={onDelete}
            confirm={
                <div>
                    <IconTrash
                        className="inline-block w-4 align-baseline"
                        strokeWidth="2"
                    />
                    Delete
                </div>
            }
            cancel="Cancel"
        >
            <p className="text-lg mt-4 mr-5 mb-2">
                Are you sure you want to permanently delete this recipe?
            </p>
        </ConfirmModal>
    );
};
