import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  external_url: string | null;
  sort_order: number;
  is_active: boolean;
}

const emptyBook = { title: '', description: '', cover_url: '', external_url: '', sort_order: 0, is_active: true };

export default function AdminLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Partial<Book> & { id?: string }>(emptyBook);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from('library_books').select('*').order('sort_order');
    setBooks((data as Book[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditingBook({ ...emptyBook, sort_order: books.length + 1 }); setDialogOpen(true); };
  const openEdit = (book: Book) => { setEditingBook({ ...book }); setDialogOpen(true); };

  const save = async () => {
    if (!editingBook.title?.trim()) {
      toast({ title: 'Ошибка', description: 'Название обязательно', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      title: editingBook.title!,
      description: editingBook.description || null,
      cover_url: editingBook.cover_url || null,
      external_url: editingBook.external_url || null,
      sort_order: editingBook.sort_order ?? 0,
      is_active: editingBook.is_active ?? true,
    };

    let error;
    if (editingBook.id) {
      ({ error } = await supabase.from('library_books').update(payload).eq('id', editingBook.id));
    } else {
      ({ error } = await supabase.from('library_books').insert(payload));
    }
    setSaving(false);

    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } else {
      setDialogOpen(false);
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Удалить книгу?')) return;
    const { error } = await supabase.from('library_books').delete().eq('id', id);
    if (error) toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    else load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Библиотека</h2>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Добавить книгу</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Книги и материалы</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Обложка</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Порядок</TableHead>
                <TableHead>Активна</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Загрузка...</TableCell></TableRow>
              ) : books.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Нет книг</TableCell></TableRow>
              ) : books.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    {b.cover_url ? <img src={b.cover_url} alt="" className="h-12 w-9 object-cover rounded" /> : '—'}
                  </TableCell>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell>{b.sort_order}</TableCell>
                  <TableCell><Switch checked={b.is_active} onCheckedChange={async () => {
                    await supabase.from('library_books').update({ is_active: !b.is_active }).eq('id', b.id);
                    load();
                  }} /></TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBook.id ? 'Редактировать книгу' : 'Новая книга'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Название *</label>
              <Input value={editingBook.title || ''} onChange={(e) => setEditingBook(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Описание</label>
              <Textarea value={editingBook.description || ''} onChange={(e) => setEditingBook(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">URL обложки</label>
              <Input value={editingBook.cover_url || ''} onChange={(e) => setEditingBook(p => ({ ...p, cover_url: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Внешняя ссылка</label>
              <Input value={editingBook.external_url || ''} onChange={(e) => setEditingBook(p => ({ ...p, external_url: e.target.value }))} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Порядок сортировки</label>
                <Input type="number" value={editingBook.sort_order ?? 0} onChange={(e) => setEditingBook(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch checked={editingBook.is_active ?? true} onCheckedChange={(v) => setEditingBook(p => ({ ...p, is_active: v }))} />
                <span className="text-sm">Активна</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
