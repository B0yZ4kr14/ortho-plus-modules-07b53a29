interface TriagemFormProps {
  teleconsultaId: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function TriagemForm({ teleconsultaId, onSubmit, onCancel }: TriagemFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ teleconsulta_id: teleconsultaId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Triagem</h3>
        <p className="text-muted-foreground mb-4">Formulário em desenvolvimento</p>
      </div>
      <div className="flex gap-2 justify-end">
        <button 
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-border rounded-md hover:bg-accent"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Salvar Triagem
        </button>
      </div>
    </form>
  );
}
