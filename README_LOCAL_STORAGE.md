# Paper & Bell - Local Storage Module

The project stores demo data in the current browser's Local Storage. It does not sync between devices or browsers.


## Module
`src/lib/storage.js`

Exports:
- `KEYS`: storage keys for users, login activity, presence, prices, and session.
- `local`: JSON read/write/remove wrapper around `window.localStorage`.
- `tab`: JSON read/write/remove wrapper around `window.sessionStorage`.
- `uid`: unique ID helper.

## Examples
```js
import { KEYS, local, tab, uid } from './lib/storage.js';

const users = local.get(KEYS.users, []);
local.set(KEYS.users, users);
local.remove(KEYS.users);
tab.set(KEYS.session, { userId: 'example' });
```

## Run
```bash
npm install
npm run dev
```

Local Storage is specific to the browser and website origin. Clearing browser data may erase it.
