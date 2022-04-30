<!--
 Copyright (C) 2022 Michael Van Noord
 
 This file is part of Fourservings.
 
 Fourservings is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 Fourservings is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Fourservings.  If not, see <http://www.gnu.org/licenses/>.
-->

## Fourservings Frontend

This React site serves as the frontend half of the Fourservings application.

Aside from the React library, the frontend uses [Tailwind CSS](https://tailwindcss.com) as a design CSS framework and [webpack](https://webpack.js.org/) to orchestrate the build.

## Building

Startup a dev server and launch the frontend in development mode.
It assumes a backend running on `http://localhost:8081`.
```bash
$ npm run dev
```

Creating a distributable site, configured to run against a backend
at the same domain with a URI prefix of `/api/`.
```bash
$ npm run build
```

## Resources

* SVG Icons: https://heroicons.com/
* Tailwind CSS Documentation: https://tailwindcss.com/docs/