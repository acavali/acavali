import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, UserPlus } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ColaboradoresTab() {
  const [colaboradores, setColaboradores] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    turno: "",
    custo_swap: 0,
    custo_move: 0,
    custo_rebalancing: 0
  });

  useEffect(() => {
    fetchColaboradores();
  }, []);

  const fetchColaboradores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/users/colaboradores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setColaboradores(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar colaboradores");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { ...formData, role: "colaborador" };

      if (editingUser) {
        await axios.put(`${API}/users/${editingUser.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Colaborador atualizado com sucesso!");
      } else {
        await axios.post(`${API}/auth/register`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Colaborador criado com sucesso!");
      }

      setOpenDialog(false);
      resetForm();
      fetchColaboradores();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Erro ao salvar colaborador");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Tem certeza que deseja deletar este colaborador?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Colaborador deletado");
      fetchColaboradores();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao deletar colaborador");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      turno: user.turno,
      custo_swap: user.custo_swap,
      custo_move: user.custo_move,
      custo_rebalancing: user.custo_rebalancing
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      turno: "",
      custo_swap: 0,
      custo_move: 0,
      custo_rebalancing: 0
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gerenciar Colaboradores</CardTitle>
          <CardDescription>Adicione e gerencie os colaboradores do sistema</CardDescription>
        </div>
        <Dialog open={openDialog} onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="add-colaborador-button">
              <UserPlus className="w-4 h-4" />
              Adicionar Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Editar" : "Novo"} Colaborador</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Senha {editingUser && "(deixe vazio para não alterar)"}</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    data-testid="input-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Turno</Label>
                  <Select value={formData.turno} onValueChange={(val) => setFormData({ ...formData, turno: val })}>
                    <SelectTrigger data-testid="select-turno">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dia">Dia</SelectItem>
                      <SelectItem value="noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Custos por Tarefa (€)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Swap</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.custo_swap}
                      onChange={(e) => setFormData({ ...formData, custo_swap: parseFloat(e.target.value) })}
                      data-testid="input-custo-swap"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Move</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.custo_move}
                      onChange={(e) => setFormData({ ...formData, custo_move: parseFloat(e.target.value) })}
                      data-testid="input-custo-move"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Rebalancing</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.custo_rebalancing}
                      onChange={(e) => setFormData({ ...formData, custo_rebalancing: parseFloat(e.target.value) })}
                      data-testid="input-custo-rebalancing"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" data-testid="save-colaborador-button">
                  {editingUser ? "Atualizar" : "Criar"} Colaborador
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {colaboradores.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Nenhum colaborador cadastrado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Swap</TableHead>
                <TableHead>Move</TableHead>
                <TableHead>Rebalancing</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colaboradores.map((colab) => (
                <TableRow key={colab.id}>
                  <TableCell className="font-medium">{colab.name}</TableCell>
                  <TableCell>{colab.email}</TableCell>
                  <TableCell><span className="capitalize px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{colab.turno}</span></TableCell>
                  <TableCell>€{colab.custo_swap.toFixed(2)}</TableCell>
                  <TableCell>€{colab.custo_move.toFixed(2)}</TableCell>
                  <TableCell>€{colab.custo_rebalancing.toFixed(2)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(colab)} data-testid={`edit-colaborador-${colab.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(colab.id)} data-testid={`delete-colaborador-${colab.id}`}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
