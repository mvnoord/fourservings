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
import { useParams, Navigate, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";

import useRecipe from "@hooks/useRecipe.js";

import IconMenu from "@components/icons/menu.jsx";
import IconReply from "@components/icons/reply.jsx";
import IconExternalLink from "@components/icons/externalLink.jsx";
import IconTrash from "@components/icons/trash.jsx";
import IconPlus from "@components/icons/plus.jsx";
import PhotoUploader from "@components/photoUploader.jsx";
import { DurationInput } from "@components/duration.jsx";
import Textarea from "@components/textarea.jsx";
import Image from "@components/image.jsx";

function eq(a, b) {
    if (a === b) return true;

    if (a instanceof Object) {
        if (!(b instanceof Object)) return false;

        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) return false;
        for (const key of aKeys) {
            if (!eq(a[key], b[key])) return false;
        }
        return true;
    } else if (a instanceof Array) {
        if (!(b instanceof Array)) return false;
        if (a.length !== b.length) return false;
        for (const i = 0; i < a.length; i++) {
            if (!eq(a[i], b[i])) return false;
        }
        return true;
    } else {
        return false;
    }
}

let notificationTimeout;

const EditPage = ({}) => {
    const { id } = useParams();
    const { recipe, actions, notFound } = useRecipe(id);
    const navigate = useNavigate();

    const [saving, setSaving] = useState();
    const [wip, setWIP] = useState({});

    // only set WIP when recipe is initially loaded, not when it is
    // updated or else it might revert in-progress, not-yet-saved edits
    useEffect(() => {
        setWIP(recipe ? { ...recipe } : {});
        setSaving(recipe);
    }, [recipe ? "1" : "0"]);

    const [saved, setSaved] = useState();
    const [adding, setAdding] = useState();

    useEffect(() => {
        return () => clearTimeout(notificationTimeout);
    }, []);

    if (notFound) {
        return <Navigate to="/library" />;
    }

    if (recipe?.title) document.title = `Edit ${recipe.title}`;

    const save = (toSave, undo) => {
        if (eq(toSave, saving)) return;

        if (notificationTimeout) clearTimeout(notificationTimeout);
        //setSaved(null);
        setSaving(toSave);

        const undoState = undo ? { ...undo } : null;
        if (id) {
            actions.update(toSave).then(() => {
                setSaved({ undo: undoState });

                if (notificationTimeout) clearTimeout(notificationTimeout);
                notificationTimeout = setTimeout(() => {
                    setSaved(null);
                }, 4000);
            });
        } else if (!adding) {
            // better to skip a save than double-add
            setAdding(true);
            actions.add(toSave).then((newOne) => {
                navigate(`/edit/${newOne._id}`);
                setAdding(false);
                setSaved(null);
            });
        }
    };

    const undo = (undoState) => {
        setWIP(undoState);
        save(undoState, null);
    };

    return (
        <>
            {saved && (
                <Notification id={id} undoState={saved.undo} onUndo={undo} />
            )}

            <div className="m-4">
                <h2 className="mt-2 ml-2 font-brand border-b border-emerald-700/20 font-semibold text-2xl mb-4">
                    <input
                        className="font-semibold px-2 py-1 -m-2 rounded-md border-0 drop-shadow-sm outline-emerald-600 border-stone-300 bg-white/50 w-full"
                        type="text"
                        value={wip.title || ""}
                        onChange={(e) =>
                            setWIP({ ...wip, title: e.target.value })
                        }
                        onBlur={() => save(wip, recipe)}
                    />
                </h2>

                <div className="mb-4">
                    <div className="relative rounded-lg w-full">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none z-10">
                            <IconExternalLink
                                className="absolute text-slate-400 h-5 w-5"
                                strokeWidth="1"
                            />
                        </div>
                        <input
                            type="url"
                            placeholder="https://..."
                            className="block w-full pl-8 py-1 px-2 font-light border outline-emerald-600 bg-white/50 rounded-md invalid:bg-red-100 invalid:border-red-700 focus:invalid:outline-red-700 invalid:text-red-700"
                            value={wip.link || ""}
                            onChange={(e) =>
                                setWIP({ ...wip, link: e.target.value })
                            }
                            onBlur={() => save(wip, recipe)}
                        />
                    </div>
                </div>

                <div className="font-light mb-5">
                    <div className="mb-1">
                        <span className="inline-block w-24 text-right mr-2">
                            Servings
                        </span>
                        <input
                            className="font-light px-2 py-1 rounded-md border-0 drop-shadow-sm outline-emerald-600 border-stone-300 bg-white/50 w-40"
                            value={wip.yield || ""}
                            type="number"
                            onChange={(e) =>
                                setWIP({ ...wip, yield: e.target.value })
                            }
                            onBlur={() => save(wip, recipe)}
                        />
                    </div>
                    <div className="mb-1">
                        <span className="inline-block w-24 text-right mr-2">
                            Prep Time
                        </span>
                        <DurationInput
                            className="font-light px-2 py-1 rounded-md  border-0 drop-shadow-sm outline-emerald-600 border-stone-300 bg-white/50 w-40"
                            value={wip.prepTime || ""}
                            onBlur={(e) => {
                                const newWIP = {
                                    ...wip,
                                    prepTime: e.target.value,
                                };
                                setWIP(newWIP);
                                save(newWIP, recipe);
                            }}
                        />
                    </div>
                    <div className="mb-1">
                        <span className="inline-block w-24 text-right mr-2">
                            Cook Time
                        </span>
                        <DurationInput
                            className="font-light px-2 py-1 rounded-md  border-0 drop-shadow-sm outline-emerald-600 border-stone-300 bg-white/50 w-40"
                            value={wip.cookTime}
                            onBlur={(e) => {
                                const newWIP = {
                                    ...wip,
                                    cookTime: e.target.value,
                                };
                                setWIP(newWIP);
                                save(newWIP, recipe);
                            }}
                        />
                    </div>
                </div>

                <h3 className="font-brand text-xl mx-2 mb-3 border-b border-emerald-700/20">
                    Ingredients
                </h3>
                <Ingredients
                    className="mb-4"
                    ingredients={wip.ingredients}
                    onChange={(updated) => {
                        const newWIP = {
                            ...wip,
                            ingredients: updated,
                        };
                        setWIP(newWIP);
                        save(newWIP, recipe);
                    }}
                />

                <h3 className="font-brand text-xl mb-3 border-b border-emerald-700/20">
                    Directions
                </h3>
                <div className="font-light space-y-3 mb-4">
                    <Textarea
                        className="w-full h-40 font-light px-2 py-1 rounded-md rounded-r-none border-0 drop-shadow-sm outline-emerald-600 border-stone-300 bg-white/50"
                        value={wip.directions}
                        onChange={(e) =>
                            setWIP({
                                ...wip,
                                directions: e.target.value,
                            })
                        }
                        onBlur={(e) => {
                            const newWIP = {
                                ...wip,
                                directions: e.target.value,
                            };
                            setWIP(newWIP);
                            save(newWIP, recipe);
                        }}
                    />
                </div>

                <h3 className="font-brand text-xl mb-3 border-b border-emerald-700/20">
                    Photos
                </h3>

                <div className="mb-4 flex flex-wrap gap-5">
                    {wip.images?.map((url, i) => (
                        <div key={i} className="relative">
                            <button
                                onClick={() => {
                                    const updated = [...wip.images];
                                    updated.splice(i, 1);
                                    const newWIP = {
                                        ...wip,
                                        images: updated,
                                    };
                                    setWIP(newWIP);
                                    save(newWIP, recipe);
                                }}
                                className="absolute right-3 top-3 p-1 rounded-md bg-emerald-100/60 hover:bg-emerald-200 text-emerald-700 drop-shadow-md"
                            >
                                <IconTrash
                                    className="h-5 w-5"
                                    strokeWidth="2"
                                />
                            </button>
                            <Image
                                className="rounded-lg grow h-[12rem] object-cover"
                                src={url}
                            />
                        </div>
                    ))}
                </div>

                <div className="block mb-2 font-light">
                    Add Photo
                    <PhotoUploader
                        onUpload={(uri) => {
                            const newWIP = {
                                ...wip,
                                images: [...(wip.images || []), `/${uri}`],
                            };
                            setWIP(newWIP);
                            save(newWIP, recipe);
                        }}
                    />
                </div>
            </div>
        </>
    );
};

export default EditPage;

const Notification = ({ id, undoState, onUndo }) => {
    return (
        <div className="z-40 flex items-center text-lg fixed right-10 top-5 bg-white/50 backdrop-blur-sm border-emerald-800 border-0 rounded-xl shadow-lg py-4 px-6 pointer-events-none">
            <div className="inline-block text-center">
                Recipe saved!
                {id && (
                    <Link
                        className="block text-base text-emerald-800 hover:text-emerald-600 pointer-events-auto"
                        to={`/recipe/${id}`}
                    >
                        Show Recipe
                    </Link>
                )}
            </div>
            {undoState && (
                <button
                    onClick={() => onUndo(undoState)}
                    className="ml-5 rounded-lg bg-emerald-100/80 hover:bg-emerald-200 text-emerald-700 p-3 inline-block ring-0 ring-emerald-600 drop-shadow-md pointer-events-auto"
                >
                    <span className="inline-block align-text-top">
                        <IconReply className="h-5 w-5" strokeWidth="2" />
                    </span>
                    Undo
                </button>
            )}
        </div>
    );
};

const Ingredients = ({ className, ingredients = [], onChange }) => {
    const [wip, setWIP] = useState();

    useEffect(() => {
        setWIP(
            // DnD works a lot more smoothly if we have an ID
            ingredients.map((value, i) => {
                return {
                    id: "" + i,
                    value,
                };
            })
        );
    }, [JSON.stringify(ingredients)]);

    const fireChange = (updated) => {
        onChange(updated.map((val) => val.value));
    };

    const [newIngredient, setNewIngredient] = useState("");
    const addIngredient = () => {
        if (newIngredient) {
            addIngredients([newIngredient]);
        }
    }
    const addIngredients = (ingredients) => {
        if (ingredients.length > 0) {
            const updated = [...wip];
    
            ingredients.forEach((ingredient) => {
                ingredient = ingredient.trim();
                if (ingredient) {
                    updated.push({ id: "" + updated.length, value: ingredient });
                }
            });
    
            setWIP(updated);
            setNewIngredient("");
    
            fireChange(updated);
        }
    };
    const removeIngredient = (idx) => {
        if (idx >= wip.length) return;
        const updated = [...wip];
        updated.splice(idx, 1);

        setWIP(updated);
        fireChange(updated);
    };
    const updateIngredient = (value, idx) => {
        if (idx >= wip.length) return;
        const updated = [...wip];
        updated[idx].value = value;

        setWIP(updated);
    };

    const reorder = (dropInfo) => {
        if (!dropInfo.destination) return;

        const from = dropInfo.source.index;
        const to = dropInfo.destination.index;
        if (from !== to) {
            const newWIP = [...wip];
            newWIP.splice(from, 1);
            newWIP.splice(to, 0, wip[from]);

            setWIP(newWIP);
            fireChange(newWIP);
        }
    };

    return (
        <DragDropContext onDragEnd={reorder}>
            <Droppable droppableId="ingredients">
                {(provided) => (
                    <ul
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`${className} font-light flex flex-col`}
                    >
                        {wip?.map((ingredient, i) => {
                            return (
                                <Draggable
                                    key={ingredient.id}
                                    draggableId={ingredient.id}
                                    index={i}
                                >
                                    {(provided, snapshot) => (
                                        <li
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            tabIndex="-1"
                                        >
                                            <div
                                                className={`${
                                                    snapshot.isDragging
                                                        ? "rounded-md drop-shadow-lg backdrop-blur-sm"
                                                        : ""
                                                } mb-1`}
                                            >
                                                <div
                                                    className={`${
                                                        snapshot.isDragging
                                                            ? "opacity-50 bg-white rounded-md"
                                                            : ""
                                                    } flex flex-row items-center"`}
                                                >
                                                    <div
                                                        tabIndex={-1}
                                                        className="cursor-grab p-2 text-emerald-800 hover:text-emerald-600"
                                                    >
                                                        <IconMenu strokeWidth="2" />
                                                    </div>
                                                    <input
                                                        className="grow font-light px-2 py-1 rounded-md rounded-r-none border-0 drop-shadow-sm outline-emerald-600 border-stone-300 bg-white/50"
                                                        value={ingredient.value}
                                                        onChange={(e) =>
                                                            updateIngredient(
                                                                e.target.value,
                                                                i
                                                            )
                                                        }
                                                        onBlur={() =>
                                                            fireChange(wip)
                                                        }
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            removeIngredient(i)
                                                        }
                                                        className="rounded-lg rounded-l-none bg-emerald-700 hover:bg-emerald-900 text-emerald-100 py-2 px-2 inline-block border-0 border-emerald-50 drop-shadow-md"
                                                    >
                                                        <IconTrash
                                                            className="h-4"
                                                            strokeWidth="2"
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    )}
                                </Draggable>
                            );
                        })}
                        {provided.placeholder}
                        <li className="flex flex-row items-center">
                            <div className="w-8"></div>
                            <input
                                className="grow font-light px-2 py-1 rounded-md rounded-r-none border-0 drop-shadow-sm outline-emerald-600 border-stone-300 bg-white/50"
                                placeholder="e.g. 1 tsp ground nutmeg"
                                value={newIngredient}
                                onPaste={(e) => {
                                    // In case someone is copying a list of ingredients
                                    // and pasting them in here, we should add each line
                                    // as a separate ingredient.
                                    const val = e.clipboardData.getData("Text");
                                    if (val && val.split(/\n+/).length > 1) {
                                        addIngredients(val.split(/\n+/));
                                        e.preventDefault()
                                    }
                                }}
                                onChange={(e) => {
                                    setNewIngredient(e.target.value);
                                }}
                                onKeyDown={(e) =>
                                    e.key === "Enter" ? addIngredient() : null
                                }
                            />
                            <button
                                onClick={addIngredient}
                                className="rounded-lg rounded-l-none bg-emerald-700 hover:bg-emerald-900 text-emerald-100 py-2 px-2 inline-block border-0 border-emerald-50 drop-shadow-md"
                            >
                                <IconPlus className="h-4" strokeWidth="3" />
                            </button>
                        </li>
                    </ul>
                )}
            </Droppable>
        </DragDropContext>
    );
};
