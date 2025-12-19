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
    tipo_funcionario: "motorista",
    turno: "",
    
    // Informações Pessoais
    cpf: "",
    telefone: "",
    endereco: "",
    
    // Tipo de Contrato
    tipo_contrato: "contrato",
    
    // Forma de Faturamento
    forma_faturamento: "salario_fixo",
    valor_diaria: 0,
    valor_por_task: 0,
    
    // Campos antigos (compatibilidade)
    custo_swap: 0,
    custo_move: 0,
    custo_rebalancing: 0,
    salario: 0,
    bonus: 0,
    bonus_por_producao: 0,
    horas_extras: 0,
    
    // Dados Bancários
    banco: "",
    agencia: "",
    conta: "",
    tipo_conta: "",
    pix: ""
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
      tipo_funcionario: user.tipo_funcionario || "motorista",
      turno: user.turno,
      cpf: user.cpf || "",
      telefone: user.telefone || "",
      endereco: user.endereco || "",
      tipo_contrato: user.tipo_contrato || "contrato",
      forma_faturamento: user.forma_faturamento || "salario_fixo",
      valor_diaria: user.valor_diaria || 0,
      valor_por_task: user.valor_por_task || 0,
      custo_swap: user.custo_swap || 0,
      custo_move: user.custo_move || 0,
      custo_rebalancing: user.custo_rebalancing || 0,
      salario: user.salario || 0,
      bonus: user.bonus || 0,
      bonus_por_producao: user.bonus_por_producao || 0,
      horas_extras: user.horas_extras || 0,
      banco: user.banco || "",
      agencia: user.agencia || "",
      conta: user.conta || "",
      tipo_conta: user.tipo_conta || "",
      pix: user.pix || ""
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      tipo_funcionario: "motorista",
      turno: "",
      cpf: "",
      telefone: "",
      endereco: "",
      tipo_contrato: "contrato",
      forma_faturamento: "salario_fixo",
      valor_diaria: 0,
      valor_por_task: 0,
      custo_swap: 0,
      custo_move: 0,
      custo_rebalancing: 0,
      salario: 0,
      bonus: 0,
      bonus_por_producao: 0,
      horas_extras: 0,
      banco: "",
      agencia: "",
      conta: "",
      tipo_conta: "",
      pix: ""
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

              {/* Informações Pessoais */}
              <div className="border-t pt-4">
                <Label className="text-base font-semibold mb-3 block">📋 Informações Pessoais</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="+39 000 0000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Endereço</Label>
                    <Input
                      value={formData.endereco}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                      placeholder="Via Roma, 123"
                    />
                  </div>
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
                  <Label>Tipo de Funcionário</Label>
                  <Select 
                    value={formData.tipo_funcionario} 
                    onValueChange={(val) => setFormData({ ...formData, tipo_funcionario: val })}
                  >
                    <SelectTrigger data-testid="select-tipo-funcionario">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="motorista">👨‍✈️ Motorista</SelectItem>
                      <SelectItem value="mecanico">🔧 Mecânico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Turno</Label>
                  <Select value={formData.turno} onValueChange={(val) => setFormData({ ...formData, turno: val })}>
                    <SelectTrigger data-testid="select-turno">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="dia">Dia</SelectItem>
                      <SelectItem value="noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custos por Tarefa - Somente para Motoristas */}
              {formData.tipo_funcionario === "motorista" && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">💰 Custos por Tarefa (€) - Motorista</Label>
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
              )}

              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  💶 Informações Salariais (€) - {formData.tipo_funcionario === 'mecanico' ? 'Mecânico' : 'Motorista'}
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Salário Mensal {formData.tipo_funcionario === 'mecanico' && '(Fixo)'}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.salario}
                      onChange={(e) => setFormData({ ...formData, salario: parseFloat(e.target.value) })}
                      data-testid="input-salario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Bônus</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.bonus}
                      onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) })}
                      data-testid="input-bonus"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Horas Extras</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.horas_extras}
                      onChange={(e) => setFormData({ ...formData, horas_extras: parseFloat(e.target.value) })}
                      data-testid="input-horas-extras"
                    />
                  </div>
                </div>
              </div>

              {/* Campo específico para Mecânicos */}
              {formData.tipo_funcionario === "mecanico" && (
                <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <span>🔧</span> Configurações de Mecânico
                  </Label>
                  <div className="space-y-2">
                    <Label className="text-sm">Bonificação por Produção (€ por manutenção)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.bonus_por_producao}
                      onChange={(e) => setFormData({ ...formData, bonus_por_producao: parseFloat(e.target.value) })}
                      placeholder="Ex: 5.00"
                      data-testid="input-bonus-producao"
                    />
                    <p className="text-xs text-gray-500">
                      O mecânico receberá um valor adicional por cada manutenção realizada
                    </p>
                  </div>
                </div>
              )}

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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Swap</TableHead>
                  <TableHead>Move</TableHead>
                  <TableHead>Rebal.</TableHead>
                  <TableHead>Salário</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colaboradores.map((colab) => (
                  <TableRow key={colab.id}>
                    <TableCell className="font-medium">{colab.name}</TableCell>
                    <TableCell>{colab.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${colab.tipo_funcionario === 'mecanico' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                        {colab.tipo_funcionario === 'mecanico' ? '🔧 Mecânico' : '👨‍✈️ Motorista'}
                      </span>
                    </TableCell>
                    <TableCell><span className="capitalize px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{colab.turno}</span></TableCell>
                    <TableCell>{colab.tipo_funcionario === 'motorista' ? `€${colab.custo_swap.toFixed(2)}` : '-'}</TableCell>
                    <TableCell>{colab.tipo_funcionario === 'motorista' ? `€${colab.custo_move.toFixed(2)}` : '-'}</TableCell>
                    <TableCell>{colab.tipo_funcionario === 'motorista' ? `€${colab.custo_rebalancing.toFixed(2)}` : '-'}</TableCell>
                    <TableCell className="font-semibold">€{colab.salario.toFixed(2)}</TableCell>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
