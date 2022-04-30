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

import Modal from "@components/modal.jsx";

const ConfirmModal = ({
    children,
    confirm = "Yes",
    cancel,
    onConfirm,
    onClose,
}) => {
    return (
        <Modal onClose={onClose}>
            <div className="max-w-xs mx-auto mb-2">
                {children}

                <div className="mt-3 flex justify-between">
                    <button
                        onClick={onConfirm}
                        className="rounded-lg bg-emerald-700 hover:bg-emerald-900 text-emerald-100 px-3 py-2 inline-block ring-0 ring-emerald-50 drop-shadow-md"
                    >
                        {confirm}
                    </button>
                    {cancel && (
                        <button
                            onClick={onClose}
                            className="rounded-lg bg-emerald-100/80 hover:bg-emerald-200 text-emerald-700 px-3 py-2 inline-block ring-0 ring-emerald-600 drop-shadow-md"
                        >
                            {cancel}
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
