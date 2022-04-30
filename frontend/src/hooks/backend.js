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

export const BASE_URL = BACKEND_BASE_URL; // injected via webpack DefinePlugin

const responseHandler = (resp) => {
    if (resp.status === 204) return Promise.resolve("");
    if (resp.headers.get("content-type") === "application/json") {
        return resp.json().then((payload) => {
            if (!resp.ok) {
                throw payload.error ? payload.error : payload;
            } else {
                return payload;
            }
        });
    } else {
        return resp.text().then((payload) => {
            if (!resp.ok) {
                throw payload;
            } else {
                return payload;
            }
        });
    }
};

export const get = (uri, query) => {
    let url = `${BASE_URL}${uri}`;

    if (query) {
        const params = new URLSearchParams();
        Object.keys(query).forEach((key) => {
            const value = query[key];
            if (value instanceof Array) {
                value.forEach((val) => {
                    params.append(key, val);
                });
            } else if (value !== null && value !== undefined) {
                params.append(key, value);
            }
        });
        url = `${url}?${params}`;
    }

    return fetch(url, {
        credentials: "include",
    }).then(responseHandler);
};

export const post = (uri, data) => {
    return fetch(`${BASE_URL}${uri}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
    }).then(responseHandler);
};

export const postFormData = (uri, data, onProgress) => {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("POST",`${BASE_URL}${uri}`);
        
        request.addEventListener("progress", (e) => {
            onProgress(e.loaded / e.total);
        })
        request.addEventListener("load", (e) => {
            console.log(request);

            if (request.status === 204) {
                resolve("");
            } else {
                const response = JSON.parse(request.response);
                if (request.status === 200) {
                    resolve(response);
                } else {
                    reject(response);
                }
            }
        
        })
        request.withCredentials = true;
        request.send(data);
    });

    return fetch(`${BASE_URL}${uri}`, {
        method: "POST",
        body: data,
        credentials: "include",
    }).then(responseHandler);
};

export const put = (uri, data) => {
    return fetch(`${BASE_URL}${uri}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
    }).then(responseHandler);
};

export const del = (uri, query) => {
    let url = `${BASE_URL}${uri}`;

    if (query) {
        const params = new URLSearchParams();
        Object.keys(query).forEach((key) => {
            const value = query[key];
            if (value instanceof Array) {
                value.forEach((val) => {
                    params.append(key, val);
                });
            } else {
                params.append(key, value);
            }
        });
        url = `${url}?${params}`;
    }

    return fetch(url, {
        method: "DELETE",
        credentials: "include",
    }).then(responseHandler);
};
