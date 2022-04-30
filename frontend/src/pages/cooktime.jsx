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
import { Link, Navigate, useParams } from "react-router-dom";

import useRecipe from "@hooks/useRecipe.js";

import DateFormatter from "@components/date.jsx";
import X from "@components/icons/x.jsx";

const CooktimePage = ({}) => {
    const { id } = useParams();
    const { recipe, notFound } = useRecipe(id);

    if (notFound) return <Navigate to="/library" />;
    if (!recipe) return null;

    document.body.className = "bg-stone-500";
    return (
        <div className="bg-stone-500 p-2">
            <div className="bg-stone-50 border-0 border-stone-600 rounded-xl p-5 drop-shadow-lg">
                <Link
                    to={`/recipe/${id}`}
                    className="absolute right-4 top-4 p-1 rounded-full ring-0 w-7 h-7 ring-emerald-600 text-emerald-700 hover:bg-emerald-200 bg-emerald-100/80 drop-shadow-md"
                >
                    <X className="h-5 w-5" strokeWidth="2" />
                </Link>

                <h2 className="font-brand border-b border-emerald-700/20 font-semibold text-xl mb-1 inline-block">
                    {recipe.title}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {recipe.ingredients?.length > 0 && (
                        <div>
                            <h3 className="font-brand text-xl mb-3 border-b border-emerald-700/20">
                                Ingredients
                            </h3>
                            <ul className="mb-4 font-light list-none">
                                {recipe.ingredients?.map((ingredient) => (
                                    <Completable key={ingredient}>
                                        <li className="mb-0.5">{ingredient}</li>
                                    </Completable>
                                ))}
                            </ul>
                        </div>
                    )}
                    {recipe.directions?.length > 0 && (
                        <div className="col-span-2">
                            <h3 className="font-brand text-xl mb-3 border-b border-emerald-700/20">
                                Directions
                            </h3>
                            <div className="font-light space-y-3 mb-4">
                                {recipe.directions?.map((direction) => (
                                    <Completable key={direction}>
                                        <p>{direction}</p>
                                    </Completable>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-emerald-700/20 border-t flex flex-col gap-6 sm:flex-row ">
                    {recipe.notes?.map((note, i) => (
                        <Completable key={i}>
                            <div className="after:clear-both after:content-[' '] after:table">
                                <p className="whitespace-pre-line">
                                    {note.note}
                                </p>
                                <div className="font-light text-xs float-right inline-block">
                                    <DateFormatter value={note.date} />
                                </div>
                            </div>
                        </Completable>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CooktimePage;

const Completable = ({ children }) => {
    const [complete, setComplete] = useState(false);

    return React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const className = child.props?.className || "";
            const onClick = child.props?.onClick;

            return React.cloneElement(child, {
                className: complete
                    ? `${className} text-stone-800/20`
                    : className,
                onClick: () => {
                    setComplete(!complete);
                    if (onClick) onClick();
                },
            });
        }
        return child;
    });
};
