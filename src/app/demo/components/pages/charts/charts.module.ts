import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart'
import { ChartsComponent } from './charts.component';
import { ChartsRoutingModule } from './charts-routing.module';
import { DatePipe } from '@angular/common';

@NgModule({
    imports: [
        CommonModule,
        ChartsRoutingModule,
        ChartModule
    ],
    providers: [DatePipe],
    declarations: [ChartsComponent]
})
export class ChartsModule { }
