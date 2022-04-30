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

const _sanitize = (val) => {
    // simple sanitization. won't handle nested elements.
    return val?.replace(/\<[^>]+\>(.*?)\<\/[^>]+\>/gm, "$1");;
}
const sanitize = (recipe) => {
    const sanitized = {
        ...recipe,
        ingredients: recipe.ingredients?.map(_sanitize),
        directions: recipe.directions?.map(_sanitize)
    }
    return sanitized;
}

const useRecipe = (recipeId) => {
    const [recipe, setRecipe] = useState();

    useEffect(() => {
        setRecipe(null);
        if (recipeId) {
            get(`/recipes/${recipeId}`)
                .then(r => setRecipe(sanitize(r)))
                .catch(() => setRecipe("NOT_FOUND"));
        }
    }, [recipeId]);

    const actions = {
        add: (recipe) => {
            return post("/recipes/", recipe);
        },
        update: (recipe) => {
            if (recipe._id !== recipeId) throw "Wrong update id";
            return put(`/recipes/${recipeId}`, recipe).then((recipe) => {
                setRecipe(recipe);
                return recipe;
            });
        },
        delete: () => {
            return del(`/recipes/${recipeId}`).then(() => setRecipe(null));
        },
    };

    return {
        recipe: recipe === "NOT_FOUND" ? null : recipe,
        actions,
        notFound: recipe === "NOT_FOUND",
    };
};
export default useRecipe;

export const useRecipes = ({ search, group, start, count }) => {
    const [result, setResult] = useState();

    useEffect(() => {
        setResult(null);
        get("/recipes/", { search, group, start, count }).then(setResult);
    }, [search, group, start, count]);

    const actions = {
        update: (recipe) => {
            return put(`/recipes/${recipe._id}`, recipe);
        },
    };

    return { recipes: result, actions };
};
