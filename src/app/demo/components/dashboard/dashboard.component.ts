import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { MobileSpeedCameraService } from '../../service/mobile-camera-speed.service';

@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
    items!: MenuItem[];
    chartData: any;
    chartOptions: any;
    subscription!: Subscription;

    constructor(public layoutService: LayoutService, public mobileSpeedCameraService: MobileSpeedCameraService) {
        this.subscription = this.layoutService.configUpdate$.subscribe(() => {
            this.initChart();
        });
    }

    async ngOnInit(): Promise<void> {
        await this.initChart();

        this.items = [
            { label: 'Add New', icon: 'pi pi-fw pi-plus' },
            { label: 'Remove', icon: 'pi pi-fw pi-minus' }
        ];
    }

    async initChart(): Promise<void> {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        const data = await this.mobileSpeedCameraService.getDataByQueryString('$select=date_extract_y(date) || "-" || date_extract_m(date) as date,max(highest_speed) as h_s,max(average_speed) as avg_s&$where=highest_speed!=0&$group=date&$order=date');

        this.chartData = {
            labels: data.map(d => d.date),
            datasets: [
                {
                    label: 'Highest Speed',
                    data: data.map(d => d.h_s),
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--bluegray-700'),
                    borderColor: documentStyle.getPropertyValue('--bluegray-700'),
                    tension: .4
                },
                {
                    label: 'Average Speed',
                    data: data.map(d => d.avg_s),
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--green-600'),
                    borderColor: documentStyle.getPropertyValue('--green-600'),
                    tension: .4
                }
            ]
        };

        this.chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
