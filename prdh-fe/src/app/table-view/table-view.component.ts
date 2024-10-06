import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '../shared/pipes/date.pipe';

@Component({
  selector: 'table-view',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, DatePipe
  ],
  templateUrl: './table-view.component.html',
  styleUrl: './table-view.component.scss'
})
export class TableViewComponent {
  @Input() tableData: any[] = [];
  @Input() totalElements!: number
  @Output() pageEventEmiter: EventEmitter<PageEvent> = new EventEmitter<PageEvent>()
  displayedColumns: string[] = ['collectedDate', 'caseQuantity', 'count'];
}
