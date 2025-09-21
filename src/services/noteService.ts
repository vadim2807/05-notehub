import axios, { type AxiosResponse } from 'axios';
import { type Note, type NoteTag } from '../types/note';
import { API_TOKEN, API_BASE_URL } from '../config/config';
export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
  currentPage?: number;
  totalItems?: number;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  tag: NoteTag;
}

export interface CreateNoteResponse {
  data: Note;
}

export interface DeleteNoteResponse {
  data: Note;
}

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export const fetchNotes = async (params: FetchNotesParams = {}): Promise<FetchNotesResponse> => {
  const { page = 1, perPage = 12, search } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
  });
  
  if (search && search.trim()) {
    queryParams.append('search', search.trim());
  }
  
  const response: AxiosResponse<FetchNotesResponse> = await api.get(`/notes?${queryParams}`);
  return response.data;
};

export const createNote = async (noteData: CreateNoteRequest): Promise<Note> => {
  const response: AxiosResponse<CreateNoteResponse> = await api.post('/notes', noteData);
  return response.data.data;
};

export const deleteNote = async (noteId: string): Promise<Note> => {
  const response: AxiosResponse<DeleteNoteResponse> = await api.delete(`/notes/${noteId}`);
  return response.data.data;
};
