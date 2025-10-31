import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Truck, FileText } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function VeiculosTab() {
  const [veiculos, setVeiculos] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [openVeiculoDialog, setOpenVeiculoDialog] = useState(false);
  const [openRegistroDialog, setOpenRegistroDialog] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState(null);
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]);
  
  const [veiculoForm, setVeiculoForm] = useState({
    placa: "",
    modelo: "",
    turno: "",
    custo_litro_diesel: 1.50
  });

  const [registroForm, setRegistroForm] = useState({
    veiculo_id: "",
    motorista_id: "",
    km_inicial: 0,
    km_final: 0,
    litros_diesel: 0,
    custo_diesel: 0,
    data: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchVeiculos();
    fetchColaboradores();
    fetchRegistros();
  }, [dataFiltro]);

  const fetchVeiculos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/veiculos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVeiculos(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar veículos");
    }
  };

  const fetchColaboradores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/users/colaboradores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setColaboradores(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRegistros = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/registros-veiculos?data=${dataFiltro}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistros(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar registros");
    }
  };

  const handleCreateVeiculo = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/veiculos`, veiculoForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Veículo criado com sucesso!");
      setOpenVeiculoDialog(false);
      setVeiculoForm({ placa: "", modelo: "", turno: "", custo_litro_diesel: 1.50 });
      fetchVeiculos();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Erro ao criar veículo");
    }
  };

  const handleBuscarPrecoCombutivel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/mock/fuel-price/milan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setVeiculoForm({ 
        ...veiculoForm, 
        custo_litro_diesel: response.data.price_per_liter 
      });
      
      toast.success(`Preço atualizado: €${response.data.price_per_liter}/L em Milão`, {
        description: 'Dados simulados - Mock API'
      });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar preço do combustível");
    }
  };

  const handleBuscarConsumoVeiculo = async () => {
    if (!veiculoForm.modelo || veiculoForm.modelo.trim() === "") {
      toast.error("Digite o modelo do veículo primeiro");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API}/mock/vehicle-consumption/${encodeURIComponent(veiculoForm.modelo)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(
        `Consumo: ${response.data.km_per_liter} km/L`, 
        {
          description: `Cidade: ${response.data.consumption_l_per_100km.city}L/100km | Estrada: ${response.data.consumption_l_per_100km.highway}L/100km`
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar consumo do veículo");
    }
  };

  const handleDeleteVeiculo = async (veiculoId) => {
    if (!window.confirm("Tem certeza que deseja deletar este veículo?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/veiculos/${veiculoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Veículo deletado");
      fetchVeiculos();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao deletar veículo");
    }
  };

  const handleSubmitRegistro = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingRegistro) {
        await axios.put(`${API}/registros-veiculos/${editingRegistro.id}`, registroForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Registro atualizado!");
      } else {
        await axios.post(`${API}/registros-veiculos`, registroForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Registro criado com sucesso!");
      }
      setOpenRegistroDialog(false);
      resetRegistroForm();
      fetchRegistros();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Erro ao salvar registro");
    }
  };

  const handleEditRegistro = (registro) => {
    setEditingRegistro(registro);
    setRegistroForm({
      veiculo_id: registro.veiculo_id,
      motorista_id: registro.motorista_id,
      km_inicial: registro.km_inicial,
      km_final: registro.km_final || 0,
      litros_diesel: registro.litros_diesel || 0,
      custo_diesel: registro.custo_diesel || 0,
      data: registro.data
    });
    setOpenRegistroDialog(true);
  };

  const handleDeleteRegistro = async (registroId) => {
    if (!window.confirm("Tem certeza que deseja deletar este registro?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/registros-veiculos/${registroId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Registro deletado");
      fetchRegistros();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao deletar registro");
    }
  };

  const resetRegistroForm = () => {
    setEditingRegistro(null);
    setRegistroForm({
      veiculo_id: "",
      motorista_id: "",
      km_inicial: 0,
      km_final: 0,
      litros_diesel: 0,
      custo_diesel: 0,
      data: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Tabs defaultValue="registros">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="registros">Registros Diários</TabsTrigger>
        <TabsTrigger value="veiculos">Gerenciar Veículos</TabsTrigger>
      </TabsList>

      <TabsContent value="registros" className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Registros de Veículos</CardTitle>
              <CardDescription>Controle de km, diesel e custos</CardDescription>
            </div>
            <Dialog open={openRegistroDialog} onOpenChange={(open) => {
              setOpenRegistroDialog(open);
              if (!open) resetRegistroForm();
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2" data-testid="add-registro-button">
                  <Plus className="w-4 h-4" />
                  Novo Registro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingRegistro ? "Editar" : "Novo"} Registro</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitRegistro} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ve­ículo</Label>
                      <Select value={registroForm.veiculo_id} onValueChange={(val) => setRegistroForm({ ...registroForm, veiculo_id: val })}>
                        <SelectTrigger data-testid="select-veiculo">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          {veiculos.map(v => (
                            <SelectItem key={v.id} value={v.id}>{v.placa} - {v.modelo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Motorista</Label>
                      <Select value={registroForm.motorista_id} onValueChange={(val) => setRegistroForm({ ...registroForm, motorista_id: val })}>
                        <SelectTrigger data-testid="select-motorista">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          {colaboradores.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>KM Inicial</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={registroForm.km_inicial}
                        onChange={(e) => setRegistroForm({ ...registroForm, km_inicial: parseFloat(e.target.value) })}
                        data-testid="input-km-inicial"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>KM Final</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={registroForm.km_final}
                        onChange={(e) => setRegistroForm({ ...registroForm, km_final: parseFloat(e.target.value) })}
                        data-testid="input-km-final"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Litros Diesel</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={registroForm.litros_diesel}
                        onChange={(e) => setRegistroForm({ ...registroForm, litros_diesel: parseFloat(e.target.value) })}
                        data-testid="input-litros-diesel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Custo Diesel (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={registroForm.custo_diesel}
                        onChange={(e) => setRegistroForm({ ...registroForm, custo_diesel: parseFloat(e.target.value) })}
                        data-testid="input-custo-diesel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input
                        type="date"
                        value={registroForm.data}
                        onChange={(e) => setRegistroForm({ ...registroForm, data: e.target.value })}
                        data-testid="input-data-registro"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="submit" data-testid="save-registro-button">
                      {editingRegistro ? "Atualizar" : "Criar"} Registro
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label>Filtrar por Data</Label>
              <Input
                type="date"
                value={dataFiltro}
                onChange={(e) => setDataFiltro(e.target.value)}
                className="max-w-xs"
                data-testid="input-filtro-data"
              />
            </div>

            {registros.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Nenhum registro para esta data</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Motorista</TableHead>
                    <TableHead>KM Inicial</TableHead>
                    <TableHead>KM Final</TableHead>
                    <TableHead>KM Rodado</TableHead>
                    <TableHead>Diesel (L)</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>km/L</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registros.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">{reg.veiculo_placa}</TableCell>
                      <TableCell>{reg.motorista_nome}</TableCell>
                      <TableCell>{reg.km_inicial.toFixed(1)}</TableCell>
                      <TableCell>{reg.km_final?.toFixed(1) || '-'}</TableCell>
                      <TableCell className="font-semibold">{reg.km_rodado?.toFixed(1) || '-'}</TableCell>
                      <TableCell>{reg.litros_diesel.toFixed(2)}</TableCell>
                      <TableCell>€{reg.custo_diesel.toFixed(2)}</TableCell>
                      <TableCell>{reg.km_por_litro?.toFixed(2) || '-'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditRegistro(reg)} data-testid={`edit-registro-${reg.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteRegistro(reg.id)} data-testid={`delete-registro-${reg.id}`}>
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
      </TabsContent>

      <TabsContent value="veiculos">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Gerenciar Veículos</CardTitle>
              <CardDescription>Cadastre e gerencie a frota</CardDescription>
            </div>
            <Dialog open={openVeiculoDialog} onOpenChange={setOpenVeiculoDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2" data-testid="add-veiculo-button">
                  <Truck className="w-4 h-4" />
                  Adicionar Veículo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Veículo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateVeiculo} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Placa</Label>
                    <Input
                      value={veiculoForm.placa}
                      onChange={(e) => setVeiculoForm({ ...veiculoForm, placa: e.target.value })}
                      required
                      data-testid="input-placa"
                      placeholder="Ex: AB123CD"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Modelo</Label>
                    <div className="flex gap-2">
                      <Input
                        value={veiculoForm.modelo}
                        onChange={(e) => setVeiculoForm({ ...veiculoForm, modelo: e.target.value })}
                        required
                        data-testid="input-modelo"
                        placeholder="Ex: Fiat Ducato 2.3"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBuscarConsumoVeiculo}
                        disabled={!veiculoForm.modelo}
                        data-testid="btn-buscar-consumo"
                        className="whitespace-nowrap"
                      >
                        🔍 Buscar Consumo
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <a 
                        href="https://www.automobile.it/consumi" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Consultar consumo manualmente
                      </a>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Custo por Litro Diesel (€)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={veiculoForm.custo_litro_diesel}
                        onChange={(e) => setVeiculoForm({ ...veiculoForm, custo_litro_diesel: parseFloat(e.target.value) })}
                        required
                        data-testid="input-custo-litro"
                        placeholder="Ex: 1.50"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBuscarPrecoCombutivel}
                        data-testid="btn-buscar-preco"
                        className="whitespace-nowrap"
                      >
                        🔍 Buscar Preço
                      </Button>
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-blue-600">
                      <a 
                        href="https://www.prezzibenzina.it/prezzi/milano" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Preços de combustível em Milão
                      </a>
                      <a 
                        href="https://carburanti.mise.gov.it/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Preços oficiais - Ministero (Itália)
                      </a>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Turno</Label>
                    <Select value={veiculoForm.turno} onValueChange={(val) => setVeiculoForm({ ...veiculoForm, turno: val })}>
                      <SelectTrigger data-testid="select-turno-veiculo">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        <SelectItem value="dia">Dia</SelectItem>
                        <SelectItem value="noite">Noite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="submit" data-testid="save-veiculo-button">Criar Veículo</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {veiculos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Nenhum veículo cadastrado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Custo/Litro</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {veiculos.map((veiculo) => (
                    <TableRow key={veiculo.id}>
                      <TableCell className="font-medium">{veiculo.placa}</TableCell>
                      <TableCell>{veiculo.modelo}</TableCell>
                      <TableCell>€{veiculo.custo_litro_diesel?.toFixed(2) || '1.50'}</TableCell>
                      <TableCell><span className="capitalize px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{veiculo.turno}</span></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteVeiculo(veiculo.id)} data-testid={`delete-veiculo-${veiculo.id}`}>
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
      </TabsContent>
    </Tabs>
  );
}
