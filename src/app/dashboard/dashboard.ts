import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Movimentacao, MovimentacaoService } from '../Service/movimentacao-service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private api = inject(MovimentacaoService);
  private cdr = inject(ChangeDetectorRef);

  movimentacoes: Movimentacao[] = [];
  saldo: number = 0;

  descricao: string = '';
  tipo: 'entrada' | 'saida' = 'entrada';
  categoria: string = '';
  valor: number | null = null;
  data: string = new Date().toISOString().split('T')[0];

  categoriaFiltro: string = '';

  ngOnInit(): void {
    this.atualizarTela();
  }

  atualizarTela(): void {
    this.listarMovimentacoes();
    this.carregarSaldo();
  }

  listarMovimentacoes(): void {
    this.api.listar(this.categoriaFiltro).subscribe((dados) => {
      this.movimentacoes = dados;
      this.cdr.detectChanges(); 
    });
  }

  carregarSaldo(): void {
    this.api.obterSaldo().subscribe((res) => {
      this.saldo = res.saldo;
      this.cdr.detectChanges();
    });
  }

  cadastrar(): void {
    if (!this.descricao || !this.categoria || !this.valor || !this.data) return;

    const nova: Movimentacao = {
      descricao: this.descricao,
      tipo: this.tipo,
      categoria: this.categoria,
      valor: Number(this.valor),
      data: this.data
    };

    this.api.cadastrar(nova).subscribe(() => {
      this.descricao = '';
      this.categoria = '';
      this.valor = null;
      this.categoriaFiltro = '';
      this.atualizarTela();
      this.cdr.detectChanges(); 
    });
  }

  excluir(id?: string): void {
    if (!id) return;
    this.api.excluir(id).subscribe(() => {
      this.atualizarTela();
    });
  }

  obterClasseCategoria(categoria: string): string {
    const mapa: Record<string, string> = {
      'Salário': 'cat-salario',
      'Alimentação': 'cat-alimentacao',
      'Transporte': 'cat-transporte',
      'Lazer': 'cat-lazer',
      'Contas': 'cat-contas'
    };
    return mapa[categoria] || '';
  }
}