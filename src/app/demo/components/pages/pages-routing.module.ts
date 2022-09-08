import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'charts', loadChildren: () => import('./charts/charts.module').then(m => m.ChartsModule) },
        { path: 'table', loadChildren: () => import('./table/tabledemo.module').then(m => m.TableDemoModule) }
    ])],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
