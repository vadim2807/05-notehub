import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import SearchBox from '../SearchBox/SearchBox';
import Pagination from '../Pagination/Pagination';
import NoteList from '../NoteList/NoteList';
import NoteForm from '../NoteForm/NoteForm';
import Modal from '../Modal/Modal';
import css from './App.module.css';
import { fetchNotes, createNote as apiCreateNote, deleteNote as apiDeleteNote } from '../../services/noteService';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
    },
  },
});

function AppContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);
  const { data, isLoading, error } = useQuery({
    queryKey: ['notes', currentPage, debouncedSearchTerm],
    queryFn: () => fetchNotes({
      page: currentPage,
      perPage: 12,
      search: debouncedSearchTerm,
    }),
  });

  const createNoteMutation = useMutation({
    mutationFn: apiCreateNote,
    onSuccess: async () => {
      setShowCreateForm(false);
      setCurrentPage(1);
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      await queryClient.refetchQueries({ queryKey: ['notes'] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: apiDeleteNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notes'] });
      await queryClient.refetchQueries({ queryKey: ['notes'] });
    },
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const deleteNote = (noteId: string) => {
    deleteNoteMutation.mutate(noteId);
  };

  const notes = data?.notes || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox 
          value={searchTerm}
          onChange={setSearchTerm}
        />
        
        <div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
        
        <button 
          className={css.button}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create note +'}
        </button>
      </header>
      
      <div style={{ padding: '10px 0' }}>
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Loading notes...</p>
          </div>
        )}
        
        {error && (
          <div style={{
            textAlign: 'center',
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px'
          }}>
            Error loading notes: {(error as Error).message}
          </div>
        )}

        {showCreateForm && (
          <Modal onClose={() => setShowCreateForm(false)}>
            <NoteForm
              onSubmit={(noteData) => createNoteMutation.mutate(noteData)}
              onCancel={() => setShowCreateForm(false)}
              isLoading={createNoteMutation.isPending}
            />
          </Modal>
        )}

        <NoteList
          notes={notes}
          onDelete={deleteNote}
          isDeleting={deleteNoteMutation.isPending}
        />

        {notes.length === 0 && !isLoading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            color: '#6c757d',
            fontSize: '18px'
          }}>
            {searchTerm ? `No notes found for "${searchTerm}"` : 'No notes yet. Create your first note!'}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;