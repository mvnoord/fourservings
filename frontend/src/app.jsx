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
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import useUser, { useUserState, UserContext } from "@hooks/useUser.js";
import Header from "@components/header.jsx";
import Footer from "@components/footer.jsx";

import HeroPage from "@pages/hero.jsx";

import LoginPage from "@pages/login.jsx";
import RegisterPage from "@pages/register.jsx";
import ResetPage from "@pages/reset.jsx";
import ProfilePage from "@pages/profile.jsx";

import LibraryPage from "@pages/library.jsx";
import RecipePage from "@pages/recipe.jsx";
import CooktimePage from "@pages/cooktime.jsx";
import EditPage from "@pages/edit.jsx";

import NotFoundPage from "@pages/notFound.jsx";

const Layout = ({ children }) => {
    document.body.className = "bg-stone-200";
    return (
        <div className="bg-stone-200 text-stone-800 flex flex-col min-h-[100vh]">
            <Header />
            <div className="grow">{children}</div>
            <Footer />
        </div>
    );
};

const Authenticated = ({ children }) => {
    const { user, loading } = useUser();
    const location = useLocation();

    if (loading) return <Layout></Layout>;
    if (!user) return <Navigate to="/login" state={{postLogin: location}} />;
    
    return <Layout>{children}</Layout>;
};
const Anonymous = ({ children }) => {
    const { user } = useUser();
    const location = useLocation();
    if (user) return <Navigate to={location?.state?.postLogin || "/library"} />;
    return <Layout>{children}</Layout>;
};
const AnonymousMinimal = ({ children }) => {
    const { user } = useUser();
    if (user) return <Navigate to="/library" />;
    return children;
};

const App = ({}) => {
    const userState = useUserState();
    return (
        <UserContext.Provider value={userState}>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <Anonymous>
                                <LoginPage />
                            </Anonymous>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <Anonymous>
                                <RegisterPage />
                            </Anonymous>
                        }
                    />
                    <Route
                        path="/reset"
                        element={
                            <Anonymous>
                                <ResetPage />
                            </Anonymous>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <Authenticated>
                                <ProfilePage />
                            </Authenticated>
                        }
                    />

                    <Route
                        path="/library"
                        element={
                            <Authenticated>
                                <LibraryPage />
                            </Authenticated>
                        }
                    />
                    <Route
                        path="/library/:groupId"
                        element={
                            <Authenticated>
                                <LibraryPage />
                            </Authenticated>
                        }
                    />
                    <Route
                        path="/recipe/:id"
                        element={
                            <Authenticated>
                                <RecipePage />
                            </Authenticated>
                        }
                    />
                    <Route path="/cooktime/:id" element={<CooktimePage />} />
                    <Route
                        path="/edit/:id"
                        element={
                            <Authenticated>
                                <EditPage />
                            </Authenticated>
                        }
                    />
                    <Route
                        path="/edit"
                        element={
                            <Authenticated>
                                <EditPage />
                            </Authenticated>
                        }
                    />

                    <Route
                        path="/"
                        element={
                            <AnonymousMinimal>
                                <HeroPage />
                            </AnonymousMinimal>
                        }
                    />

                    <Route
                        path="*"
                        element={
                            <Layout>
                                <NotFoundPage />
                            </Layout>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </UserContext.Provider>
    );
};

export default App;
