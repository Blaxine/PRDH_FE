import { AfterContentInit, Component, effect, inject, OnChanges, OnInit, signal, SimpleChanges, ViewEncapsulation, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from './header/header.component';
import { CasesApiService } from './services/api/cases-api.service';
import { FilterCovidCases } from './shared/models/filter-covid-cases.model';
import { TableViewComponent } from './table-view/table-view.component';
import { PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SharedModule } from './shared/shared/shared.module';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { catchError, of, take, tap } from 'rxjs';
import { TEST_TYPES } from './shared/constants/tests-type.const';
import { MatSelectModule } from '@angular/material/select';
import { ORDER_TYPES } from './shared/constants/order-type.const';
import { CASES_EXAMPLE } from './shared/constants/cases-example.const';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
	selector: 'app-root',
	standalone: true,
	providers: [provideNativeDateAdapter()],
	//material modules are imported completly instead of parts for sake of organization
	imports: [
		SharedModule,
		RouterOutlet,
		AppHeaderComponent,
		TableViewComponent,
		MatFormFieldModule,
		MatInputModule,
		FormsModule,
		MatIconModule,
		ReactiveFormsModule,
		MatDatepickerModule,
		MatSelectModule,
		MatSlideToggleModule
	],

	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
	encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, AfterContentInit {

	datesFormGroup!: UntypedFormGroup;
	title = 'prdh-fe';
	searchFormControler: UntypedFormControl = new UntypedFormControl('');

	testTypes = TEST_TYPES;
	orderTypes = ORDER_TYPES;

	casesApi = inject(CasesApiService);
	formBuilder = inject(FormBuilder);

	formChangeTrigger: WritableSignal<any> = signal<any>([]);

	isApiLoading: boolean = false;

	minCreatedDate!: Date;
	maxCreatedDate!: Date;
	minSampleCollectedDate!: Date;
	maxSampleCollectedDate!: Date;

	caseResults: any[] = [];
	displayData: any;
	totalElements: number = 0;

	demoCases = CASES_EXAMPLE;
	showDemo: boolean = false;

	constructor() {
		effect(() => {
			const form = this.formChangeTrigger();
			if (form) {
				this.minCreatedDate = form.createdAtStartDate
				this.maxCreatedDate = form.createdAtEndDate
			}
		})
	}

	ngOnInit(): void {
		this.buildForm();
	}

	ngAfterContentInit(): void {
		!this.showDemo ? this.fetchData() : this.showDemoCases();
	}

	fetchData(): void {
		const formValues = this.datesFormGroup.value;
		let request: FilterCovidCases = {
			"orderTestCategory": formValues.orderType,
			"orderTestType": formValues.testType,
			...(formValues?.sampleCollectedStartDate) && { sampleCollectedStartDate: this.dateToIsoDate(formValues.sampleCollectedStartDate) },
			...(formValues?.sampleCollectedEndDate) && { sampleCollectedEndDate: this.dateToIsoDate(formValues.sampleCollectedEndDate) },
			...(formValues?.createdAtStartDate) && { createdAtStartDate: this.dateToIsoDate(formValues.createdAtStartDate) },
			...(formValues?.createdAtEndDate) && { createdAtEndDate: this.dateToIsoDate(formValues.createdAtEndDate) }
		}

		this.casesApi.listCovidCases(request
		).pipe(
			take(1),
			tap((response) => {
				if (response?.results) {
					this.caseResults = response.results;
					this.totalElements = response.results.length;
				}
			}),
			catchError((err) => of(err)))
			.subscribe();

	}

	setDisplay(event?: PageEvent): void {

		const pageSize = event?.pageSize || 5;
		const pageIndex = event?.pageIndex || 0;
		const startIndex = pageIndex * pageSize;

		const endIndex = startIndex + pageSize;

		this.displayData = [...this.caseResults.slice(startIndex, endIndex)];
	}

	onDemoShowClicked(showDemo: boolean): void {
		showDemo ? this.showDemoCases() : this.fetchData();
	}

	private showDemoCases(): void {
		this.caseResults = [];
		this.displayData = [];
		this.caseResults = [...this.demoCases];
		this.totalElements = this.caseResults.length;
		this.setDisplay();
	}

	private dateToIsoDate(date: Date): string {
		if (!date) return '';
		return date.toISOString()
	}

	private buildForm(): void {
		let date: Date = new Date;
		let monthBefore: Date = new Date;
		let monthBeforeParsed = new Date(monthBefore.setDate(monthBefore.getDate() - 30));

		this.datesFormGroup = this.formBuilder.group({
			sampleCollectedStartDate: [monthBeforeParsed],
			sampleCollectedEndDate: [date],
			createdAtStartDate: [monthBeforeParsed],
			createdAtEndDate: [date],
			testType: [this.testTypes[0].value],
			orderType: [this.orderTypes[0].value]
		});

		this.maxCreatedDate = date;
		this.minCreatedDate = monthBeforeParsed;

		this.maxSampleCollectedDate = date;
		this.minSampleCollectedDate = monthBeforeParsed;

		this.datesFormGroup.valueChanges.subscribe(() => {
			this.formChangeTrigger.set(this.datesFormGroup.value);
		})
	}

}
