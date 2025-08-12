import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import Helper from '../models/helper.model';

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

  getHelperByID(id: string): Observable<Helper> {
    return this.http.get<Helper>(`http://localhost:3000/helper/${id}`)
  }

  deleteHelper(id: string) {
    return this.http.delete(`http://localhost:3000/helper/${id}`)
  }

  editHelper(id: string, data: any){
    return this.http.patch(`http://localhost:3000/helper/${id}`, data)
  }

  searchHelper(search: string){
    return this.http.get(`http://localhost:3000/helper/searchBy/${encodeURIComponent(search)}`)
  }

  filterHelper(filter: {service: string[], organisation: string[]}){
    return this.http.post(`http://localhost:3000/helper/filter`, filter)
  }

  getPdf(url: string){
    return this.http.get(url, {responseType: 'blob'}).pipe(
      map((blob: Blob)=>{
        const filename = url.split('/').pop() || 'download'
        return new File([blob], filename, {type: blob.type})
      })
    )
  }
}
