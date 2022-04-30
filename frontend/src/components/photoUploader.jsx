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

import React, { memo, useState } from "react";

import IconUpload from "@components/icons/upload.jsx";
import { postFormData } from "@hooks/backend.js";

const upload = (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);

    return postFormData("/files", formData, (pct) =>
        onProgress(pct * 100)
    ).then((resp) => resp.uploaded[0]);
};

const LocalImg = memo(({ className, file }) => {
    return <img className={className} src={URL.createObjectURL(file)} />;
});

const PhotoUploader = ({ className, disabled, onUpload }) => {
    const [selected, setSelected] = useState();

    const [uploading, setUploading] = useState();
    const [error, setError] = useState();

    const onFileSelect = (e) => {
        if (e.target.files?.length > 0) {
            if (e.target.files[0].size > 10 * 1024 * 1024) {
                setError("Image must be less than 10 MB");
                setSelected(null);
            } else {
                setSelected(e.target.files[0]);
                setError(null);
            }
        }
    };

    const doUpload = () => {
        setError(null);
        setUploading({ progress: 0 });
        upload(selected, (progress) => setUploading({ progress }))
            .then((uri) => {
                onUpload(uri);

                setSelected(null);
                setUploading(null);
            })
            .catch((e) => setError("Problem uploading file"));
    };

    const disabledAll = disabled || uploading;

    return (
        <div className={`relative ${className}`}>
            <label>
                <input
                    disabled={disabledAll}
                    accept="image/*"
                    className="inline-block text-[0] file:text-base file:mb-2 file:m-[2px] file:mr-2 file:rounded-md file:px-3 file:py-2 file:drop-shadow-md file:border-0 file:ring-0 file:ring-emerald-600 file:text-emerald-700 file:hover:bg-emerald-100 file:bg-emerald-50 file:font-normal font-light"
                    type="file"
                    onChange={onFileSelect}
                />
                {selected && (
                    <LocalImg
                        className="ml-2 -mt-2 inline-block w-16 rounded-full aspect-square object-cover"
                        file={selected}
                    />
                )}
            </label>

            {selected && (
                <button
                    disabled={disabledAll}
                    onClick={doUpload}
                    className="ml-2 rounded-lg rounded-l-none disabled:bg-emerald-700/60 bg-emerald-700 hover:bg-emerald-900 text-emerald-100 px-3 py-2 inline-block ring-0 ring-emerald-50 drop-shadow-md"
                >
                    <span className="inline-block align-baseline mr-1">
                        <IconUpload strokeWidth="2" />
                    </span>
                    Add
                </button>
            )}

            {uploading && (
                <div className="bg-emerald-700/40 rounded-full relative h-4 mt-2">
                    <div
                        style={{ width: `${uploading.progress}%` }}
                        className="bg-emerald-700 rounded-full inline-block absolute inset-y-0 left-0"
                    ></div>
                </div>
            )}
            {error && (
                <div className="bg-red-200 max-w-sm p-2 rounded-xl outline outline-0 outline-red-500 text-red-900 text-center">
                    {error}
                </div>
            )}
        </div>
    );
};
export default PhotoUploader;
