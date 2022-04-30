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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import useRecipe from "@hooks/useRecipe.js";

import NavMenu, { Item as NavMenuItem } from "@components/navMenu.jsx";
import IconLink from "@components/icons/link.jsx";
import IconPencilAlt from "@components/icons/pencilAlt.jsx";
import IconCamera from "@components/icons/camera.jsx";
import Modal from "@components/modal.jsx";
import PhotoUploader from "@components/photoUploader.jsx";

const AddRecipeNavMenu = ({}) => {
    const [modal, setModal] = useState();

    return (
        <>
            {modal === "ADD_LINK" && (
                <AddRecipeLinkModal onClose={() => setModal(null)} />
            )}
            {modal === "ADD_PHOTO" && (
                <AddRecipeLinkPhoto onClose={() => setModal(null)} />
            )}

            <NavMenu label="Add Recipe" className="mb-4" collapsing>
                <NavMenuItem onClick={() => setModal("ADD_LINK")}>
                    <span className="inline-block align-baseline mr-1">
                        <IconLink />
                    </span>
                    Add a recipe link
                </NavMenuItem>
                <NavMenuItem to="/edit">
                    <span className="inline-block align-baseline mr-1">
                        <IconPencilAlt />
                    </span>
                    Add a recipe from scratch
                </NavMenuItem>
                <NavMenuItem onClick={() => setModal("ADD_PHOTO")}>
                    <span className="inline-block align-baseline mr-1">
                        <IconCamera />
                    </span>
                    Add a recipe photo
                </NavMenuItem>
            </NavMenu>
        </>
    );
};

export default AddRecipeNavMenu;

const AddRecipeLinkModal = ({ onClose }) => {
    const { actions } = useRecipe();

    const [recipe, setRecipe] = useState({});
    const navigate = useNavigate();

    const add = () => {
        actions.add(recipe).then((newOne) => navigate(`/recipe/${newOne.id}`));
    };

    return (
        <Modal onClose={onClose}>
            <div className="max-w-xs mx-auto mb-2">
                <h3 className="font-brand inline-block border-b border-b-emerald-700/20 font-semibold text-xl mb-4">
                    Add a Recipe Link
                </h3>

                <label className="block mb-2 font-light">
                    Recipe Title
                    <input
                        className="w-full block px-2 py-1 rounded-md border-0 drop-shadow-sm outline-emerald-600 border-stone-800 invalid:bg-red-100 invalid:border-red-700 focus:invalid:outline-red-700 invalid:text-red-700"
                        type="text"
                        placeholder="Creamy Mac &amp; Cheese"
                        value={recipe.title || ""}
                        onChange={(e) =>
                            setRecipe({ ...recipe, title: e.target.value })
                        }
                    />
                </label>
                <label className="block mb-2 font-light">
                    Link
                    <input
                        className="w-full block px-2 py-1 rounded-md border-0 drop-shadow-sm outline-emerald-600 border-stone-800 invalid:bg-red-100 invalid:border-red-700 focus:invalid:outline-red-700 invalid:text-red-700"
                        type="text"
                        placeholder="https://..."
                        value={recipe.link || ""}
                        onChange={(e) =>
                            setRecipe({ ...recipe, link: e.target.value })
                        }
                    />
                </label>

                <div className="mt-3">
                    <button
                        onClick={add}
                        className="rounded-lg bg-emerald-700 hover:bg-emerald-900 text-emerald-100 px-3 py-2 inline-block ring-0 ring-emerald-50 drop-shadow-md"
                    >
                        Add
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const AddRecipeLinkPhoto = ({ onClose }) => {
    const { actions } = useRecipe();

    const [recipe, setRecipe] = useState({});
    const navigate = useNavigate();

    const handleUpload = (url) => {
        actions
            .add({ ...recipe, images: [url] })
            .then((newOne) => navigate(`/recipe/${newOne.id}`));
    };

    return (
        <Modal onClose={onClose}>
            <div className="max-w-xs mx-auto mb-2">
                <h3 className="font-brand inline-block border-b border-b-emerald-700/20 font-semibold text-xl mb-4">
                    Add a Recipe Photo
                </h3>

                <label className="block mb-2 font-light">
                    Recipe Title
                    <input
                        className="w-full block px-2 py-1 rounded-md border-0 drop-shadow-sm outline-emerald-600 border-stone-800 invalid:bg-red-100 invalid:border-red-700 focus:invalid:outline-red-700 invalid:text-red-700"
                        type="text"
                        placeholder="Creamy Mac &amp; Cheese"
                        value={recipe.title || ""}
                        onChange={(e) =>
                            setRecipe({ ...recipe, title: e.target.value })
                        }
                    />
                </label>
                <label className="block mb-2 font-light">
                    Photo
                    <PhotoUploader onUpload={handleUpload} />
                </label>
            </div>
        </Modal>
    );
};
