import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService, ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { IMobileSpeedCameraServiceRequest, MobileSpeedCameraService } from 'src/app/demo/service/mobile-camera-speed.service';

@Component({
    templateUrl: './tabledemo.component.html',
    providers: [MessageService, ConfirmationService],
    styles: [`
        :host ::ng-deep  .p-frozen-column {
            font-weight: bold;
        }

        :host ::ng-deep .p-datatable-frozen-tbody {
            font-weight: bold;
        }

        :host ::ng-deep .p-progressbar {
            height:.5rem;
        }
    `]
})
export class TableDemoComponent implements OnInit {
    data: any[] = [];
    totalRecords: number = 0;
    loading: boolean = true;
    lazyLoad: boolean = true;
    @ViewChild('filter') filter!: ElementRef;

    constructor(private mobileSpeedCameraService: MobileSpeedCameraService) { }

    async ngOnInit(): Promise<void> {
        this.totalRecords = await this.mobileSpeedCameraService.getMaxRecords();
    }

    async getData(event: LazyLoadEvent) {
        this.loading = true;

        const request = Object.assign(event, {} as IMobileSpeedCameraServiceRequest);
        request.first = undefined;
        request.rows = undefined;

        this.totalRecords = await this.mobileSpeedCameraService.getTotalRecords(request);

        this.data = await this.mobileSpeedCameraService.getData(event as IMobileSpeedCameraServiceRequest);
        this.totalRecords = this.data.length;
        this.loading = false;
    }
    onGlobalFilter(table: Table, event: Event) {
        this.lazyLoad = false;
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
        this.lazyLoad = true;
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }
}
