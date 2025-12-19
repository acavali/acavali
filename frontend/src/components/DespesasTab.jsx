import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Receipt } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const categorias = [
  { value: "material", label: "Material" },
  { value: "aluguel", label: "Aluguel" },
  { value: "manutencao", label: "Manutenção" },
  { value: "outro", label: "Outro" }
];

export default function DespesasTab() {
  const [despesas, setDespesas] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]);
  const [pagamentosFuncionarios, setPagamentosFuncionarios] = useState([]);
  const [despesaForm, setDespesaForm] = useState({
    descricao: "",
    valor: 0,
    categoria: "",
    pago_por: "",
    observacoes: "",
    data: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDespesas();
    fetchPagamentosFuncionarios();
  }, [dataFiltro]);

  const fetchDespesas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/despesas?data=${dataFiltro}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDespesas(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar despesas");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/despesas`, despesaForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Despesa registrada com sucesso!");
      setOpenDialog(false);
      resetForm();
      fetchDespesas();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Erro ao registrar despesa");
    }
  };

  const handleDelete = async (despesaId) => {
    if (!window.confirm("Tem certeza que deseja deletar esta despesa?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/despesas/${despesaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Despesa deletada");
      fetchDespesas();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao deletar despesa");
    }
  };

  const resetForm = () => {
    setDespesaForm({
      descricao: "",
      valor: 0,
      categoria: "",
      pago_por: "",
      observacoes: "",
      data: new Date().toISOString().split('T')[0]
    });
  };

  const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Registro de Despesas
          </CardTitle>
          <CardDescription>Controle de gastos operacionais</CardDescription>
        </div>
        <Dialog open={openDialog} onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="add-despesa-button">
              <Plus className="w-4 h-4" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Despesa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Descrição</Label>
                  <Input
                    value={despesaForm.descricao}
                    onChange={(e) => setDespesaForm({ ...despesaForm, descricao: e.target.value })}
                    required
                    data-testid="input-descricao"
                    placeholder="Ex: Compra de material, aluguel, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Valor (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={despesaForm.valor}
                    onChange={(e) => setDespesaForm({ ...despesaForm, valor: parseFloat(e.target.value) })}
                    required
                    data-testid="input-valor"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={despesaForm.categoria} onValueChange={(val) => setDespesaForm({ ...despesaForm, categoria: val })}>
                    <SelectTrigger data-testid="select-categoria">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      {categorias.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Pago Por</Label>
                  <Input
                    value={despesaForm.pago_por}
                    onChange={(e) => setDespesaForm({ ...despesaForm, pago_por: e.target.value })}
                    data-testid="input-pago-por"
                    placeholder="Nome de quem pagou"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={despesaForm.data}
                    onChange={(e) => setDespesaForm({ ...despesaForm, data: e.target.value })}
                    data-testid="input-data-despesa"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={despesaForm.observacoes}
                    onChange={(e) => setDespesaForm({ ...despesaForm, observacoes: e.target.value })}
                    data-testid="input-observacoes"
                    placeholder="Informações adicionais"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" data-testid="save-despesa-button">
                  Registrar Despesa
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div>
              <Label>Filtrar por Data</Label>
              <Input
                type="date"
                value={dataFiltro}
                onChange={(e) => setDataFiltro(e.target.value)}
                className="max-w-xs"
                data-testid="input-filtro-data-despesa"
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total do Dia</p>
            <p className="text-2xl font-bold text-red-600" data-testid="total-despesas">€{totalDespesas.toFixed(2)}</p>
          </div>
        </div>

        {despesas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Nenhuma despesa registrada para esta data</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pago Por</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {despesas.map((despesa) => (
                <TableRow key={despesa.id}>
                  <TableCell className="font-medium">{despesa.descricao}</TableCell>
                  <TableCell>
                    <span className="capitalize px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      {categorias.find(c => c.value === despesa.categoria)?.label || despesa.categoria}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-red-600">€{despesa.valor.toFixed(2)}</TableCell>
                  <TableCell>{despesa.pago_por || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">{despesa.observacoes || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(despesa.id)} data-testid={`delete-despesa-${despesa.id}`}>
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
