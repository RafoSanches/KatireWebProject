import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Produto, Usuario, Proposta, Avaliacao, Favorito, Mensagem, Notificacao
} from '../models/produto.model';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private api = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  buscarCep(cep: string): Observable<{
    cep: string;
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro?: boolean;
  }> {
    return this.http.get<{
      cep: string;
      logradouro: string;
      bairro: string;
      localidade: string;
      uf: string;
      erro?: boolean;
    }>(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
  }

  // Produtos
  getProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.api}/produtos?ativo=true`);
  }

  getProduto(id: string): Observable<Produto> {
    return this.http.get<Produto>(`${this.api}/produtos/${id}`);
  }

  getProdutosPorUsuario(usuarioId: string): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.api}/produtos?usuarioId=${usuarioId}`);
  }

  criarProduto(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(`${this.api}/produtos`, produto);
  }

  editarProduto(id: string, produto: Partial<Produto>): Observable<Produto> {
    return this.http.patch<Produto>(`${this.api}/produtos/${id}`, produto);
  }

  excluirProduto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/produtos/${id}`);
  }

  buscarProdutos(filtros: {
    busca?: string;
    categoria?: string;
    condicao?: string;
    cidade?: string;
  }): Observable<Produto[]> {
    let params = new HttpParams().set('ativo', 'true');
    if (filtros.busca) params = params.set('q', filtros.busca);
    if (filtros.categoria) params = params.set('categoria', filtros.categoria);
    if (filtros.condicao) params = params.set('condicao', filtros.condicao);
    if (filtros.cidade) params = params.set('cidade', filtros.cidade);
    return this.http.get<Produto[]>(`${this.api}/produtos`, { params });
  }

  // Usuários
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.api}/usuarios`);
  }

  getUsuario(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.api}/usuarios/${id}`);
  }

  criarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.api}/usuarios`, usuario);
  }

  atualizarUsuario(id: string, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.api}/usuarios/${id}`, usuario);
  }

  loginPorEmail(email: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.api}/usuarios?email=${email}`);
  }

  // Propostas
  getPropostas(): Observable<Proposta[]> {
    return this.http.get<Proposta[]>(`${this.api}/propostas`);
  }

  getPropostasRecebidas(usuarioId: string): Observable<Proposta[]> {
    return this.http.get<Proposta[]>(`${this.api}/propostas?destinatarioId=${usuarioId}`);
  }

  getPropostasEnviadas(usuarioId: string): Observable<Proposta[]> {
    return this.http.get<Proposta[]>(`${this.api}/propostas?remetenteId=${usuarioId}`);
  }

  criarProposta(proposta: Proposta): Observable<Proposta> {
    return this.http.post<Proposta>(`${this.api}/propostas`, proposta);
  }

  atualizarProposta(id: string, dados: Partial<Proposta>): Observable<Proposta> {
    return this.http.patch<Proposta>(`${this.api}/propostas/${id}`, dados);
  }

  getProposta(id: string): Observable<Proposta> {
    return this.http.get<Proposta>(`${this.api}/propostas/${id}`);
  }

  // Avaliações
  getAvaliacoesPorAvaliado(avaliadoId: string): Observable<Avaliacao[]> {
    return this.http.get<Avaliacao[]>(`${this.api}/avaliacoes?avaliadoId=${avaliadoId}`);
  }

  getAvaliacaoPorProposta(propostaId: string, autorId: string): Observable<Avaliacao[]> {
    return this.http.get<Avaliacao[]>(`${this.api}/avaliacoes?propostaId=${propostaId}&autorId=${autorId}`);
  }

  criarAvaliacao(avaliacao: Avaliacao): Observable<Avaliacao> {
    return this.http.post<Avaliacao>(`${this.api}/avaliacoes`, avaliacao);
  }

  recalcularMediaAvaliacao(avaliadoId: string): Observable<Usuario> {
    return new Observable(obs => {
      this.getAvaliacoesPorAvaliado(avaliadoId).subscribe(avs => {
        const media = avs.length ? avs.reduce((s, a) => s + a.nota, 0) / avs.length : 0;
        this.atualizarUsuario(avaliadoId, { avaliacoes: +media.toFixed(1) }).subscribe(u => {
          obs.next(u); obs.complete();
        });
      });
    });
  }

  // Favoritos
  getFavoritos(usuarioId: string): Observable<Favorito[]> {
    return this.http.get<Favorito[]>(`${this.api}/favoritos?usuarioId=${usuarioId}`);
  }

  getFavorito(usuarioId: string, produtoId: string): Observable<Favorito[]> {
    return this.http.get<Favorito[]>(`${this.api}/favoritos?usuarioId=${usuarioId}&produtoId=${produtoId}`);
  }

  criarFavorito(favorito: Favorito): Observable<Favorito> {
    return this.http.post<Favorito>(`${this.api}/favoritos`, favorito);
  }

  removerFavorito(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/favoritos/${id}`);
  }

  // Chat
  getMensagens(propostaId: string): Observable<Mensagem[]> {
    return this.http.get<Mensagem[]>(`${this.api}/mensagens?propostaId=${propostaId}&_sort=criadaEm&_order=asc`);
  }

  enviarMensagem(mensagem: Mensagem): Observable<Mensagem> {
    return this.http.post<Mensagem>(`${this.api}/mensagens`, mensagem);
  }

  // Notificacoes
  getNotificacoes(usuarioId: string): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(`${this.api}/notificacoes?usuarioId=${usuarioId}&_sort=criadaEm&_order=desc`);
  }

  criarNotificacao(notificacao: Notificacao): Observable<Notificacao> {
    return this.http.post<Notificacao>(`${this.api}/notificacoes`, notificacao);
  }

  marcarNotificacaoLida(id: string): Observable<Notificacao> {
    return this.http.patch<Notificacao>(`${this.api}/notificacoes/${id}`, { lida: true });
  }
}
