import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { MobileSpeedCameraService } from 'src/app/demo/service/mobile-camera-speed.service';

@Component({
    templateUrl: './charts.component.html'
})
export class ChartsComponent implements OnInit, OnDestroy {
    lineData: any;
    barData: any;
    pieData: any;
    polarData: any;
    radarData: any;
    lineOptions: any;
    barOptions: any;
    pieOptions: any;
    polarOptions: any;
    radarOptions: any;
    subscription!: Subscription;

    data1: any[] = [];
    data2: any[] = [];
    data3: any[] = [];

    private documentStyle: CSSStyleDeclaration;
    private textColor: string = '';
    private textColorSecondary: string = '';
    private surfaceBorder: string = '';

    constructor(
        public layoutService: LayoutService,
        public mobileSpeedCameraService: MobileSpeedCameraService) {

        this.subscription = this.layoutService.configUpdate$.subscribe(async () => await this.initCharts());
        this.documentStyle = getComputedStyle(document.documentElement);
    }

    async ngOnInit() {
        this.textColor = this.documentStyle.getPropertyValue('--text-color');
        this.textColorSecondary = this.documentStyle.getPropertyValue('--text-color-secondary');
        this.surfaceBorder = this.documentStyle.getPropertyValue('--surface-border');
        await this.initCharts();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }


    async initCharts(): Promise<void> {
        this.lineData = await this.getLineData();
        this.lineOptions = this.getLineOptions();
        this.barData = await this.getBarData();
        this.barOptions = this.getBarOptions();
        this.pieData = await this.getPieData();
        this.pieOptions = this.getPieOptions();
        this.polarData = await this.getPolarData();
        this.polarOptions = this.getPolarOptions();
        this.radarData = await this.getRadarData();
        this.radarOptions = this.getRadarOptions();
    }

    private async getLineData(): Promise<any> {
        this.data1 = await this.mobileSpeedCameraService.getDataByQueryString('$select=posted_speed,max(highest_speed) as m_hs,max(average_speed) as m_avg_s&$group=posted_speed&$order=posted_speed');

        return {
            labels: this.data1.map(d => d.posted_speed),
            datasets: [
                {
                    label: 'Highest Speed',
                    data: this.data1.map(d => d.m_hs),
                    fill: false,
                    backgroundColor: '#ff0000',
                    borderColor: '#ff0000',
                    tension: .4
                },
                {
                    label: 'Average Speed',
                    data: this.data1.map(d => d.m_avg_s),
                    fill: false,
                    backgroundColor: this.documentStyle.getPropertyValue('--green-600'),
                    borderColor: this.documentStyle.getPropertyValue('--green-600'),
                    tension: .4
                }
            ]
        };
    }

    private getLineOptions(): any {
        return {
            plugins: { legend: { labels: { color: this.textColor } } },
            scales: {
                x: {
                    ticks: { color: this.textColorSecondary },
                    grid: { color: [this.surfaceBorder], drawBorder: false }
                },
                y: {
                    ticks: { color: this.textColorSecondary },
                    grid: { color: [this.surfaceBorder], drawBorder: false }
                },
            }
        };
    }

    private async getBarData(): Promise<any> {
        this.data2 = await this.mobileSpeedCameraService.getDataByQueryString('$select=date_extract_y(date) as date,max(highest_speed) as h_s,max(average_speed) as avg_s&$where=highest_speed!=0&$group=date&$order=date');

        return {
            labels: this.data2.map(d => d.date),
            datasets: [
                {
                    label: 'Highest Speed',
                    backgroundColor: '#ff0000',
                    borderColor: '#ff0000',
                    data: this.data2.map(d => d.h_s),
                },
                {
                    label: 'Average Speed',
                    backgroundColor: '#0000ff',
                    borderColor: '#0000ff',
                    data: this.data2.map(d => d.avg_s),
                },
            ]
        };

    }

    private getBarOptions(): any {
        return {
            plugins: {
                legend: {
                    labels: {
                        color: this.textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: this.textColorSecondary,
                        font: {
                            weight: 500
                        }
                    },
                    grid: {
                        color:[this.surfaceBorder],
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: this.textColorSecondary
                    },
                    grid: {
                        color:[this.surfaceBorder],
                        drawBorder: false
                    }
                },
            }
        };
    }

    private async getPieData(): Promise<any> {
        this.data3 = await this.mobileSpeedCameraService.getDataByQueryString('$select=posted_speed,count(posted_speed) as count&$group=posted_speed&$order=posted_speed');
        const filteredData = this.data3.filter(d => d.posted_speed)

        return {
            labels: filteredData.map(d => d.posted_speed),
            datasets: [
                {
                    data: this.data3.map(d => d.count),
                    backgroundColor: [
                        this.documentStyle.getPropertyValue('--yellow-500'),
                        this.documentStyle.getPropertyValue('--blue-500'),
                        this.documentStyle.getPropertyValue('--pink-500'),
                        this.documentStyle.getPropertyValue('--green-500'),
                        this.documentStyle.getPropertyValue('--red-500'),
                        this.documentStyle.getPropertyValue('--gray-500'),
                        this.documentStyle.getPropertyValue('--violet-500')
                    ],
                    hoverBackgroundColor: [
                        this.documentStyle.getPropertyValue('--yellow-400'),
                        this.documentStyle.getPropertyValue('--blue-400'),
                        this.documentStyle.getPropertyValue('--pink-400'),
                        this.documentStyle.getPropertyValue('--green-400'),
                        this.documentStyle.getPropertyValue('--red-400'),
                        this.documentStyle.getPropertyValue('--gray-400'),
                        this.documentStyle.getPropertyValue('--violet-400')
                    ],
                    borderColor: [this.surfaceBorder]
                }]
        };
    }

    private getPieOptions(): any {
        return {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: this.textColor
                    }
                }
            }
        };
    }

    private async getPolarData(): Promise<any> {
        return {
            datasets: [{
                data: [11, 16, 7, 3],
                backgroundColor: [
                    this.documentStyle.getPropertyValue('--red-500'),
                    this.documentStyle.getPropertyValue('--blue-500'),
                    this.documentStyle.getPropertyValue('--yellow-500'),
                    this.documentStyle.getPropertyValue('--green-500')
                ],
                label: 'My dataset'
            }],
            labels: ['Red', 'Blue', 'Yellow', 'Green']
        };
    }

    private getPolarOptions(): any {
        return {
            plugins: { legend: { labels: { color: this.textColor } } },
            scales: { r: { grid: { color: this.surfaceBorder } } }
        };
    }

    private async getRadarData(): Promise<any> {
        const filteredData = this.data3.filter(d => d.posted_speed)

        return {
            labels: filteredData.map(d => d.posted_speed),
            datasets: [
                {
                    label: 'Highest Speed',
                    borderColor: this.documentStyle.getPropertyValue('--red-500'),
                    pointBackgroundColor: this.documentStyle.getPropertyValue('--red-500'),
                    pointBorderColor: this.documentStyle.getPropertyValue('--red-500'),
                    pointHoverBackgroundColor: this.textColor,
                    pointHoverBorderColor: this.documentStyle.getPropertyValue('--red-500'),
                    data: filteredData.map(d => d.h_s)
                },
                {
                    label: 'Average Speed',
                    borderColor: this.documentStyle.getPropertyValue('--bluegray-500'),
                    pointBackgroundColor: this.documentStyle.getPropertyValue('--bluegray-500'),
                    pointBorderColor: this.documentStyle.getPropertyValue('--bluegray-500'),
                    pointHoverBackgroundColor: this.textColor,
                    pointHoverBorderColor: this.documentStyle.getPropertyValue('--bluegray-500'),
                    data: this.data2.map(d => d.avg_s)
                }
            ]
        };
    }

    private getRadarOptions(): any {
        return {
            plugins: {
                legend: {
                    labels: {
                        color: this.textColor
                    }
                }
            },
            scales: {
                r: {
                    pointLabels: { color: this.textColor },
                    grid: {
                        color:[this.surfaceBorder],
                        drawBorder: false
                    }
                }
            }
        };
    }
}
