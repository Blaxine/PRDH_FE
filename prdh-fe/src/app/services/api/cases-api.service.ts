import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CasesApiService {

  protected apiHost = "https://localhost:7010"
  protected apiCasesEndpoint = "/cases/Case/";
  private _httpService = inject(HttpClient)

  ListCases(): Observable<any> {
    return this._httpService.get(this.apiHost + this.apiCasesEndpoint + 'list').pipe(take(1),catchError(error=> of([])))
  }

  listCovidCases(request:any):Observable<any>{
    return this._httpService.post(this.apiHost+'/getCases',request).pipe(take(1),)
  }

  
}
