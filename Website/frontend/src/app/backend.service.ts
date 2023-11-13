import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { Place } from './models/place.model';
import { Search } from './models/search.model';

const backendIP = "localhost";  ///
const backendPort = "7210"; ///
const baseURL = "http://" + backendIP + ":" + backendPort + "/api/";

@Injectable({ providedIn: "root" })
export class backendService {

  constructor(private http: HttpClient) {}

  getPlaces(search: Search): Observable<{places: Place[]}> 
  {
    const parameters = {search: JSON.stringify(search)};
    return this.http.get<{places: Place[]}>(baseURL + "getPlaces", {params: parameters});
  }
}
