import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Movimentacao {
  _id?: string;
  descricao: string;
  tipo: 'entrada' | 'saida';
  categoria: string;
  valor: number;
  data: Date | string;
}

@Injectable({
    providedIn: 'root'
})
export class MovimentacaoService {
    private http = inject(HttpClient);
    private base = 'http://localhost:3000/movimentacoes';

    listar(categoria?: string): Observable<Movimentacao[]> {
        let params = new HttpParams();
        if (categoria) {
        params = params.set('categoria', categoria);
        }
        return this.http.get<Movimentacao[]>(this.base, { params });
    }

    obterSaldo(): Observable<{ entradas: number; saidas: number; saldo: number }> {
        return this.http.get<{ entradas: number; saidas: number; saldo: number }>(`${this.base}/saldo`);
    }

    cadastrar(movimentacao: Movimentacao): Observable<Movimentacao> {
        return this.http.post<Movimentacao>(this.base, movimentacao);
    }

    excluir(id: string): Observable<any> {
        return this.http.delete(`${this.base}/${id}`);
    }

}
