export interface Produto {
  id?: string;
  titulo: string;
  descricao: string;
  categoria: string;
  condicao: string;
  fotos: string[];
  usuarioId: string;
  usuario: string;
  cidade: string;
  estado: string;
  interesse: string;
  criadoEm?: string;
  ativo?: boolean;
}

export interface Usuario {
  id?: string;
  nome: string;
  email: string;
  senha?: string;
  avatar?: string;
  cidade?: string;
  estado?: string;
  avaliacoes?: number;
  totalTrocas?: number;
}

export interface Proposta {
  id?: string;
  produtoOfertadoId: string;
  produtoDesejadoId: string;
  remetenteId: string;
  destinatarioId: string;
  remetente?: string;
  destinatario?: string;
  produtoOfertado?: string;
  produtoDesejado?: string;
  mensagem: string;
  status: 'pendente' | 'aceita' | 'recusada';
  criadaEm?: string;
}

export interface Avaliacao {
  id?: string;
  propostaId: string;
  autorId: string;
  autorNome?: string;
  autorAvatar?: string;
  avaliadoId: string;
  nota: number;           // 1 a 5
  comentario: string;
  criadaEm?: string;
}

export interface Favorito {
  id?: string;
  usuarioId: string;
  produtoId: string;
  criadoEm: string;
}

export interface Mensagem {
  id?: string;
  propostaId: string;
  autorId: string;
  autorNome: string;
  texto: string;
  criadaEm: string;
}

export interface Notificacao {
  id?: string;
  usuarioId: string;
  tipo: 'proposta' | 'status' | 'favorito' | 'mensagem';
  titulo: string;
  mensagem: string;
  link?: string;
  lida: boolean;
  criadaEm: string;
}

export const CATEGORIAS = [
  'Eletrônicos', 'Esportes', 'Livros', 'Música', 'Fotografia',
  'Móveis', 'Roupas', 'Brinquedos', 'Ferramentas', 'Outros'
];

export const CONDICOES = [
  'Novo', 'Usado - Ótimo estado', 'Usado - Bom estado', 'Usado - Estado regular'
];
