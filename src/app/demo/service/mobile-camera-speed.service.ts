import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NumberValueAccessor } from '@angular/forms';
import { groupBy, lastValueFrom, map, mergeMap, Observable, toArray } from 'rxjs';

export interface IMobileSpeedCameraServiceRequest {
    select?: string[];
    first?: number; // limit
    rows?: number; // offset
    sortField?: number;
    sortOrder?: number;
    filters?: any;
    group?: string;
    having?: string;
}


@Injectable()
export class MobileSpeedCameraService {
    private baseUrl: string = 'https://www.data.act.gov.au/resource/d56a-2nhi.json';

    constructor(private http: HttpClient, private datePipe: DatePipe) { }

    async getData(request: IMobileSpeedCameraServiceRequest): Promise<any[]> {
        let url = `${this.baseUrl}`;

        const queryString = this.buildQuery(request);
        if (queryString) {
            url = `${url}?${queryString}`;
        }

        console.log(url, "QUERY URL");
        const result = await lastValueFrom(this.http.get<any[]>(url)); 
        return result;
    }

    async getDataByUrl(url: string): Promise<any[]> {
        const result = await lastValueFrom(this.http.get<any[]>(url)); 
        return result;
    }

    async getDataByQueryString(queryString: string): Promise<any[]> {
        const url = `${this.baseUrl}?${queryString}`;
        const result = await lastValueFrom(this.http.get<any[]>(url)); 
        return result;
    }

    async getMaxRecords(): Promise<number> {
        const result = await lastValueFrom(this.http.get<any[]>(`${this.baseUrl}?$select=count(*)`));
        return result[0].count;
    }

    async getTotalRecords(request: IMobileSpeedCameraServiceRequest): Promise<number> {
        let url = `${this.baseUrl}`;

        const queryString = this.buildQuery(request); 
        if (queryString) {
            url = `${url}?$select=count(*)&${queryString}`;
        }

        const result = await lastValueFrom(this.http.get<any[]>(url));
        return result[0].count;
    }

    // async groupByPostedSpeed(data$: Observable<any[]>): Promise<{ key: string, items: any[] }[]> {
    //     const result$ = data$.pipe(
    //         mergeMap(arr => { return arr; }),
    //         groupBy((item: any) => item.posted_speed),
    //         mergeMap(group => group.pipe(
    //             toArray(),
    //             map(items => ({ key: group.key, items }))
    //         )),
    //         toArray()
    //     );

    //     return await lastValueFrom(result$);
    // }   

    private buildQuery(request: IMobileSpeedCameraServiceRequest): string {
        const query: string[] = [];

        // select
        if (request.select && request.select.length) {
            query.push(`$select=${request.select.join(',')}`);
        }

        // where
        this.buildDateQuery('date', request, query);
        this.buildNumericQuery('timeatsiteinhours', request, query);
        this.buildStringQuery('description_of_site', request, query);
        this.buildStringQuery('camera_location', request, query);
        this.buildStringQuery('street', request, query);
        this.buildNumericQuery('number_checked', request, query);
        this.buildNumericQuery('highest_speed', request, query);
        this.buildNumericQuery('average_speed', request, query);
        this.buildNumericQuery('posted_speed', request, query);

        // if there is a where clause, append 'where =' in the first item and build the where clause string
        if (query.length) {
            query[0] = `$where=${query[0]}`;

            // build the where clause string
            const whereClause = query.join(' and ');
            query.length = 0;
            query.push(whereClause);
        }

        // group
        if (request.group) {
            query.push(`$group=${request.group}`);
        }

        // TODO: $having
        // having 
        // if (request.group) {
        //     query.push(`$having=${request.group}`);
        // }

        // sort
        if (request.sortField) {
            let order = `$order=${request.sortField}`;

            if (request.sortOrder === -1) {
                order = `${order} desc`;
            }

            query.push(order);
        }

        // pagination
        if (request.first) {
            query.push(`$offset=${request.first}`);
        }

        if (request.rows) {
            query.push(`$limit=${request.rows}`);
        }

        return query.join('&');
    }

    private buildDateQuery(colName: string, request: any, query: string[]): void {
        const column = request.filters[colName];

        if (column && column.value) {
            const parsedDate = this.datePipe.transform(column.value, "yyyy-MM-dd");

            switch (column.matchMode) {
                case 'dateIs':
                    query.push(`${colName}='${parsedDate}'`);
                    break;

                case 'dateIsNot':
                    query.push(`${colName}!='${parsedDate}'`);
                    break;

                case 'dateBefore':
                    query.push(`${colName}<'${parsedDate}'`);
                    break;

                case 'dateAfter':
                    query.push(`${colName}>'${parsedDate}'`);
                    break;
            }
        }
    }

    private buildStringQuery(colName: string, request: any, query: string[]): void {
        const column = request.filters[colName];

        if (column && column.value) {
            switch (column.matchMode) {
                case 'startsWith':
                    query.push(`starts_with(${colName},'${column.value}')`);
                    break;

                case 'endsWith':
                    query.push(`${colName} like '%25${column.value}'`);
                    break;

                case 'contains':
                    query.push(`contains(${colName},'${column.value}')`);
                    break;

                case 'notContains':
                    query.push(`not contains(${colName},'${column.value}')`);
                    break;

                case 'equals':
                    query.push(`${colName}='${column.value}'`);
                    break;

                case 'notEquals':
                    query.push(`${colName}!='${column.value}'`);
                    break;
            }
        }
    }

    private buildNumericQuery(colName: string, request: any, query: string[]): void {
        const column = request.filters[colName];

        if (!column || !column.length) {
            return;
        }

        const tempQuery: string[] = [];

        for (const c of column) {
            if (!c.value) {
                continue;
            }

            switch (c.matchMode) {
                case 'equals':
                    tempQuery.push(`${colName}=${c.value}`);
                    break;

                case 'notEquals':
                    tempQuery.push(`${colName}!=${c.value}`);
                    break;

                case 'lt':
                    tempQuery.push(`${colName}<${c.value}`);
                    break;

                case 'lte':
                    tempQuery.push(`${colName}<=${c.value}`);
                    break;

                case 'gt':
                    tempQuery.push(`${colName}>${c.value}`);
                    break;

                case 'gte':
                    tempQuery.push(`${colName}>=${c.value}`);
                    break;
            }
        }

        const operator = column[0].operator === 'and' ? ' and ' : ' or ';
        const res = tempQuery.join(operator);

        if (tempQuery.length > 1) {
            query.push(`(${res})`);
        } else if (res) {
            query.push(res);
        }
    }
}
