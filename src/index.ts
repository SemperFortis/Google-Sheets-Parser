import axios from 'axios';
import {
    CredentialBody,
    ExternalAccountClientOptions,
} from 'google-auth-library';
import { google } from 'googleapis';
import { stringifyUrl } from 'query-string';

export default class GoogleSheetsParser {
    private spreadsheetId: string;
    private spreadsheetName: string;
    private credentials?: CredentialBody | ExternalAccountClientOptions;

    constructor(
        spreadsheetId: string,
        sheetName: string,
        credentials?: CredentialBody | ExternalAccountClientOptions,
    ) {
        this.spreadsheetId = spreadsheetId;
        this.spreadsheetName = sheetName;
        this.credentials = credentials;
    }

    async getSpreadsheetDataUsingFetch() {
        if (!this.spreadsheetId) return null;

        let query: Record<string, string> = {};

        if (this.credentials) {
            try {
                const auth = await google.auth.getClient({
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                    credentials: this.credentials,
                });

                try {
                    const { token } = await auth.getAccessToken();

                    if (!token) throw new Error('No OAuth token recieved.');

                    query.access_token = encodeURIComponent(token);
                } catch (err) {
                    throw err;
                }
            } catch (err) {
                throw err;
            }
        }

        if (this.spreadsheetName) {
            query.sheet = this.spreadsheetName;
        }

        const url = stringifyUrl({
            url: `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/gviz/tq`,
            query,
        });

        try {
            const { data } = await axios.get(url);

            return data;
        } catch {
            return null;
        }
    }

    filterUselessRows(rows: Array<{ v?: any; f?: any } | null>) {
        return rows.filter(row => row && row.v !== null && row.v !== undefined);
    }

    applyHeaderIntoRows(
        header: string[],
        rows: Array<{ c: Array<{ v?: any; f?: any } | null> }>,
    ) {
        return rows
            .map(({ c: row }) => this.filterUselessRows(row))
            .map(row =>
                row.reduce(
                    (p, c, i) => Object.assign(p, { [header[i]]: c?.v }),
                    {},
                ),
            );
    }

    getItems(spreadsheetResponse: string) {
        let rows: Array<{ v?: any; f?: any } | null> = [];

        try {
            const parsedJSON = JSON.parse(
                spreadsheetResponse
                    .split('\n')[1]
                    .replace(
                        /google.visualization.Query.setResponse\(|\);/g,
                        '',
                    ),
            );
            const hasSomeLabelPropertyInCols = parsedJSON.table.cols.some(
                ({ label }: { label: string }) => !!label,
            );

            if (hasSomeLabelPropertyInCols) {
                const header = parsedJSON.table.cols.map(
                    ({ label }: { label: string }) => label,
                );

                rows = this.applyHeaderIntoRows(header, parsedJSON.table.rows);
            } else {
                const [headerRow, ...originalRows] = parsedJSON.table.rows;
                const header = this.filterUselessRows(headerRow.c).map(
                    row => row?.v,
                );

                rows = this.applyHeaderIntoRows(header, originalRows);
            }
        } catch {}

        return rows;
    }

    async parse(spreadsheetId?: string, sheetName?: string) {
        if (spreadsheetId) this.spreadsheetId = spreadsheetId;
        if (sheetName) this.spreadsheetName = sheetName;

        if (!this.spreadsheetId) throw new Error('SpreadsheetId is required.');

        const spreadsheetResponse = await this.getSpreadsheetDataUsingFetch();

        if (spreadsheetResponse === null) return [];

        return this.getItems(spreadsheetResponse);
    }
}
