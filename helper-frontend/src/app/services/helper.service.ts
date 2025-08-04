import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(private http: HttpClient) { }

  addHelper(data: any): Observable<any>{
    return this.http.post('http://localhost:3000/helper/add-helper', data)
  }

  getHelper(): Observable<any> {
    return this.http.get('http://localhost:3000/helper')
  }

  getHelperByID(id: string) {
    return this.http.get(`http://localhost:3000/helper/${id}`)
  }

  deleteHelper(id: string) {
    return this.http.delete(`http://localhost:3000/helper/${id}`)
  }

  editHelper(id: string, data: any){
    return this.http.put(`http://localhost:3000/${id}`, data)
  }

}
