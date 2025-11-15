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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Plus, Trash2, Wrench, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const tiposManutencao = [
  { value: "oleo", label: "Troca de Óleo", icon: "🛢️" },
  { value: "pneus", label: "Troca de Pneus", icon: "🛞" },
  { value: "filtros", label: "Troca de Filtros", icon: "🔧" },
  { value: "revisao", label: "Revisão Geral", icon: "✅" },
  { value: "outro", label: "Outro", icon: "🔨" }
];

export default function ManutencaoTab() {
  const [veiculos, setVeiculos] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [manutencaoForm, setManutencaoForm] = useState({
    veiculo_id: "",
    tipo: "",
    descricao: "",
    km_atual: 0,
    km_proxima_troca: 0,
    data_realizada: new Date().toISOString().split('T')[0],
    custo: 0,
    pecas_trocadas: "",
    observacoes: ""
  });

  useEffect(() => {
    fetchVeiculos();
  }, []);

  useEffect(() => {
    if (veiculoSelecionado) {
      fetchManutencoes();
    }
  }, [veiculoSelecionado]);

  const fetchVeiculos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/veiculos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVeiculos(response.data);
      if (response.data.length > 0) {
        setVeiculoSelecionado(response.data[0].id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar veículos");
    }
  };

  const fetchManutencoes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/manutencoes?veiculo_id=${veiculoSelecionado}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setManutencoes(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar manutenções");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/manutencoes`, manutencaoForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Manutenção registrada com sucesso!");
      setOpenDialog(false);
      resetForm();
      fetchManutencoes();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Erro ao registrar manutenção");
    }
  };

  const handleDelete = async (manutencaoId) => {
    if (!window.confirm("Tem certeza que deseja deletar esta manutenção?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/manutencoes/${manutencaoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Manutenção deletada");
      fetchManutencoes();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao deletar manutenção");
    }
  };

  const resetForm = () => {
    setManutencaoForm({
      veiculo_id: veiculoSelecionado,
      tipo: "",
      descricao: "",
      km_atual: 0,
      km_proxima_troca: 0,
      data_realizada: new Date().toISOString().split('T')[0],
      custo: 0,
      pecas_trocadas: "",
      observacoes: ""
    });
  };

  const getStatusBadge = (manutencao) => {
    if (!manutencao.km_proxima_troca) return null;
    
    const kmFaltante = manutencao.km_faltante || 0;
    
    if (kmFaltante < 0) {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Atrasada ({Math.abs(kmFaltante).toFixed(0)} km)
        </span>
      );
    } else if (kmFaltante < 1000) {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Próxima ({kmFaltante.toFixed(0)} km)
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          OK ({kmFaltante.toFixed(0)} km)
        </span>
      );
    }
  };

  const veiculoAtual = veiculos.find(v => v.id === veiculoSelecionado);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Controle de Manutenção
            </CardTitle>
            <CardDescription>Registre e acompanhe as manutenções dos veículos</CardDescription>
          </div>
          <Dialog open={openDialog} onOpenChange={(open) => {
            setOpenDialog(open);
            if (open) {
              setManutencaoForm({ ...manutencaoForm, veiculo_id: veiculoSelecionado });
            } else {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" data-testid="add-manutencao-button">
                <Plus className="w-4 h-4" />
                Nova Manutenção
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Manutenção</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Manutenção</Label>
                    <Select value={manutencaoForm.tipo} onValueChange={(val) => setManutencaoForm({ ...manutencaoForm, tipo: val })}>
                      <SelectTrigger data-testid="select-tipo-manutencao">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        {tiposManutencao.map(tipo => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.icon} {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Realizada</Label>
                    <Input
                      type="date"
                      value={manutencaoForm.data_realizada}
                      onChange={(e) => setManutencaoForm({ ...manutencaoForm, data_realizada: e.target.value })}
                      data-testid="input-data-manutencao"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={manutencaoForm.descricao}
                    onChange={(e) => setManutencaoForm({ ...manutencaoForm, descricao: e.target.value })}
                    required
                    data-testid="input-descricao-manutencao"
                    placeholder="Ex: Troca de óleo 10W40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>KM Atual do Veículo</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={manutencaoForm.km_atual}
                      onChange={(e) => setManutencaoForm({ ...manutencaoForm, km_atual: parseFloat(e.target.value) })}
                      required
                      data-testid="input-km-atual-manutencao"
                      placeholder="Ex: 50000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>KM da Próxima Troca (Opcional)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={manutencaoForm.km_proxima_troca}
                      onChange={(e) => setManutencaoForm({ ...manutencaoForm, km_proxima_troca: parseFloat(e.target.value) })}
                      data-testid="input-km-proxima-troca"
                      placeholder="Ex: 55000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Custo (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={manutencaoForm.custo}
                    onChange={(e) => setManutencaoForm({ ...manutencaoForm, custo: parseFloat(e.target.value) })}
                    required
                    data-testid="input-custo-manutencao"
                    placeholder="Ex: 85.50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Peças Trocadas</Label>
                  <Textarea
                    value={manutencaoForm.pecas_trocadas}
                    onChange={(e) => setManutencaoForm({ ...manutencaoForm, pecas_trocadas: e.target.value })}
                    data-testid="input-pecas-trocadas"
                    placeholder="Ex: Óleo 10W40 5L, Filtro de óleo, Filtro de ar"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={manutencaoForm.observacoes}
                    onChange={(e) => setManutencaoForm({ ...manutencaoForm, observacoes: e.target.value })}
                    data-testid="input-observacoes-manutencao"
                    placeholder="Informações adicionais sobre a manutenção"
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" data-testid="save-manutencao-button">
                    Registrar Manutenção
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label>Selecione o Veículo</Label>
            <Select value={veiculoSelecionado} onValueChange={setVeiculoSelecionado}>
              <SelectTrigger className="max-w-md" data-testid="select-veiculo-manutencao">
                <SelectValue placeholder="Selecione um veículo..." />
              </SelectTrigger>
              <SelectContent>
                {veiculos.map(v => (
                  <SelectItem key={v.id} value={v.id}>
                    <strong>{v.placa}</strong> - {v.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {veiculoAtual && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertDescription>
                <div className="flex justify-between items-center">
                  <div>
                    <strong>Veículo:</strong> {veiculoAtual.placa} - {veiculoAtual.modelo}
                  </div>
                  <div>
                    <strong>Consumo:</strong> {veiculoAtual.consumo_km_por_litro?.toFixed(1) || '0.0'} km/L
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {manutencoes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma manutenção registrada para este veículo</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>KM Atual</TableHead>
                  <TableHead>Próxima Troca</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manutencoes.map((manutencao) => {
                  const tipoInfo = tiposManutencao.find(t => t.value === manutencao.tipo);
                  return (
                    <TableRow key={manutencao.id}>
                      <TableCell>{new Date(manutencao.data_realizada).toLocaleDateString('pt-PT')}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          {tipoInfo?.icon} {tipoInfo?.label}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{manutencao.descricao}</TableCell>
                      <TableCell>{manutencao.km_atual.toFixed(0)} km</TableCell>
                      <TableCell>{manutencao.km_proxima_troca ? `${manutencao.km_proxima_troca.toFixed(0)} km` : '-'}</TableCell>
                      <TableCell>{getStatusBadge(manutencao)}</TableCell>
                      <TableCell className="font-semibold text-red-600">€{manutencao.custo.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(manutencao.id)} data-testid={`delete-manutencao-${manutencao.id}`}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
