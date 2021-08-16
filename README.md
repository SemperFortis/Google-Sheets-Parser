# Google Sheets Parser

Parses Google sheets and returns data in a structured JavaScript array.

![npm](https://img.shields.io/npm/v/google-sheets-parser?style=for-the-badge) ![npm](https://img.shields.io/npm/dt/google-sheets-parser?style=for-the-badge) ![CircleCI](https://img.shields.io/circleci/build/github/SemperFortis/Google-Sheets-Parser?style=for-the-badge&token=7aa7515fbba4aabda1e612cef07537e667951d7f) ![Maintenance](https://img.shields.io/maintenance/yes/2021?style=for-the-badge)

## Installation

### Yarn

```bash
$ yarn add google-sheets-parser
```

### NPM

```bash
$ npm install google-sheets-parser
```

## Usage

### CommonJS require

```javascript
const GoogleSheetsParser = require('google-sheets-parser').default;

const parser = new GoogleSheetsParser(
    spreadsheetId,
    sheetName,
    oauthCredentials,
);

// This must be in an async function
const data = await parser.parse();

console.log(data);
```

### ES6 import

```javascript
import GoogleSheetsParser from 'google-sheets-parser';

const parser = new GoogleSheetsParser(
    spreadsheetId,
    sheetName,
    oauthCredentials,
);

// This must be in an async function
const data = await parser.parse();

console.log(data);
```
