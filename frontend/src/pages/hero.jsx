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
import { Link } from "react-router-dom";
import Footer from "@components/footer.jsx";

const HeroPage = ({}) => {
    document.body.className = "bg-stone-100";
    return (
        <div className="bg-stone-100 text-stone-800 flex flex-col min-h-[100vh]">
            <div className="grow">
                <div className="bg-stone-300 shadow-stone-500/40 shadow-lg">
                    <h1 className="pt-16 px-4 text-8xl underline decoration-rose-600 decoration-4 underline-offset-8 text-center font-extrabold font-brand relative">
                        Four Servings
                    </h1>
                    <h2 className="pb-8 pt-4 px-4 text-2xl text-center text-emerald-800">
                        Home for your recipes.
                    </h2>
                </div>
                <div className="my-7 flex justify-center">
                    <Link
                        className="rounded-lg bg-emerald-700 hover:bg-emerald-900 text-emerald-100 p-3 inline-block ring-0 ring-emerald-50 drop-shadow-md"
                        to="/login"
                    >
                        Go to Your Recipes
                    </Link>
                </div>
                <div className="bg-white max-w-md mx-auto my-7 p-6 rounded-xl outline outline-0 outline-stone-500 font-light">
                    <p>
                        If you're like us, your recipes are all over the place.
                        You've got some saved as bookmarks on one site, an email
                        link to another, some favorites in a dog-eared recipe
                        book, and maybe even a couple of old family favorites
                        scribbled down on note cards.
                    </p>
                    <p className="mt-3">
                        With Four Servings, you can have them all in one place,
                        organized and at your fingertips.
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default HeroPage;
