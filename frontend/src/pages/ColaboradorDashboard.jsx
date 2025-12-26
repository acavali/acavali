import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { LogOut, Plus, Trash2, Battery, Move, RefreshCw, Truck, Clock, Wrench } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const taskIcons = {
  swap: <Battery className="w-5 h-5" />,
  move: <Move className="w-5 h-5" />,
  rebalancing: <RefreshCw className="w-5 h-5" />,
  deploy: <RefreshCw className="w-5 h-5" />,
  mecanica: <Wrench className="w-5 h-5" />
};

const taskLabels = {
  swap: "Swap",
  move: "Move",
  rebalancing: "Rebalancing",
  deploy: "Deploy",
  mecanica: "Mecânica"
};

export default function ColaboradorDashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [turnoAtivo, setTurnoAtivo] = useState(null);
  const [showIniciarTurno, setShowIniciarTurno] = useState(false);
  const [showFecharTurno, setShowFecharTurno] = useState(false);
  const [tipo, setTipo] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [dataTask, setDataTask] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, custo: 0 });
  
  // Iniciar turno form
  const [iniciarForm, setIniciarForm] = useState({
    veiculo_id: "",
    km_inicial: 0,
    baterias_nineboot_carregadas: 0,
    baterias_okay_carregadas: 0
  });

  // Fechar turno form
  const [fecharForm, setFecharForm] = useState({
    km_final: 0,
    litros_diesel: 0,
    baterias_nineboot_descarregadas: 0,
    baterias_okay_descarregadas: 0
  });

  // Calculate automatic liters based on km_final
  const calcularLitrosAutomatico = () => {
    if (!turnoAtivo || !fecharForm.km_final || fecharForm.km_final <= turnoAtivo.km_inicial) {
      return null;
    }
    
    const kmRodado = fecharForm.km_final - turnoAtivo.km_inicial;
    const veiculo = veiculos.find(v => v.id === turnoAtivo.veiculo_id);
    
    if (veiculo && veiculo.consumo_km_por_litro > 0) {
      const litrosCalculados = kmRodado / veiculo.consumo_km_por_litro;
      return {
        litros: litrosCalculados,
        kmRodado: kmRodado,
        consumoMedio: veiculo.consumo_km_por_litro,
        custoEstimado: litrosCalculados * (veiculo.custo_litro_diesel || 1.50)
      };
    }
    return null;
  };

  useEffect(() => {
    fetchVeiculos();
    checkTurnoAtivo();
  }, []);

  useEffect(() => {
    if (turnoAtivo) {
      fetchTasks();
    }
  }, [dataTask, turnoAtivo]);

  const checkTurnoAtivo = async () => {
    try {
      const token = localStorage.getItem('token');
      const hoje = new Date().toISOString().split('T')[0];
      
      const response = await axios.get(`${API}/registros-veiculos?data=${hoje}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check if there's an active shift (km_final is null or 0)
      const turnoAberto = response.data.find(
        r => r.motorista_id === user.id && (!r.km_final || r.km_final === 0)
      );
      
      if (turnoAberto) {
        setTurnoAtivo(turnoAberto);
      } else {
        setShowIniciarTurno(true);
      }
    } catch (error) {
      console.error(error);
      setShowIniciarTurno(true);
    }
  };

  const fetchVeiculos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/veiculos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const veiculosDoTurno = response.data.filter(v => v.turno === user.turno);
      setVeiculos(veiculosDoTurno);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API}/tasks?data=${dataTask}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTasks(response.data);
      
      const total = response.data.reduce((sum, t) => sum + t.quantidade, 0);
      const custo = response.data.reduce((sum, t) => sum + t.custo_total, 0);
      setStats({ total, custo });
    } catch (error) {
      console.error(error);
    }
  };

  const handleIniciarTurno = async (e) => {
    e.preventDefault();
    if (!iniciarForm.veiculo_id) {
      toast.error("Selecione um veículo");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/registros-veiculos`,
        {
          veiculo_id: iniciarForm.veiculo_id,
          motorista_id: user.id,
          km_inicial: parseFloat(iniciarForm.km_inicial),
          km_final: null,
          litros_diesel: 0,
          custo_diesel: 0,
          data: new Date().toISOString().split('T')[0],
          baterias_nineboot_carregadas: parseInt(iniciarForm.baterias_nineboot_carregadas) || 0,
          baterias_okay_carregadas: parseInt(iniciarForm.baterias_okay_carregadas) || 0,
          baterias_nineboot_descarregadas: 0,
          baterias_okay_descarregadas: 0
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTurnoAtivo(response.data);
      setShowIniciarTurno(false);
      toast.success("Turno iniciado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Erro ao iniciar turno");
    }
  };

  const handleFecharTurno = async (e) => {
    e.preventDefault();
    
    if (!fecharForm.km_final || fecharForm.km_final <= turnoAtivo.km_inicial) {
      toast.error("KM final deve ser maior que KM inicial");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API}/registros-veiculos/${turnoAtivo.id}`,
        {
          veiculo_id: turnoAtivo.veiculo_id,
          motorista_id: user.id,
          km_inicial: turnoAtivo.km_inicial,
          km_final: parseFloat(fecharForm.km_final),
          litros_diesel: parseFloat(fecharForm.litros_diesel),
          custo_diesel: 0, // Will be calculated by backend based on vehicle cost per liter
          data: turnoAtivo.data
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Registrar logout
      try {
        await axios.post(
          `${API}/presenca/registrar`,
          {
            usuario_id: user.id,
            tipo: "logout",
            localizacao: null
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } catch (locError) {
        console.error("Erro ao registrar logout:", locError);
      }

      toast.success("Turno fechado com sucesso!");
      setShowFecharTurno(false);
      onLogout();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Erro ao fechar turno");
    }
  };

  const handleLogoutClick = () => {
    setShowFecharTurno(true);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!tipo) {
      toast.error("Selecione o tipo de tarefa");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/tasks`,
        {
          colaborador_id: user.id,
          tipo,
          quantidade: parseInt(quantidade),
          data: dataTask
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Tarefa adicionada com sucesso!");
      setTipo("");
      setQuantidade(1);
      fetchTasks();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Erro ao adicionar tarefa");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Tarefa removida");
      fetchTasks();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover tarefa");
    }
  };

  // Iniciar Turno Dialog
  if (showIniciarTurno) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Truck className="w-6 h-6" />
              Iniciar Turno - Milão
            </CardTitle>
            <CardDescription>Registre o veículo e KM inicial para começar seu turno</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIniciarTurno} className="space-y-4">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>{user.name}</strong> - Turno: <span className="capitalize font-semibold">{user.turno}</span>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Veículo (Targa)</Label>
                <Select 
                  value={iniciarForm.veiculo_id} 
                  onValueChange={(val) => setIniciarForm({ ...iniciarForm, veiculo_id: val })}
                  required
                >
                  <SelectTrigger data-testid="select-veiculo-iniciar">
                    <SelectValue placeholder="Selecione o veículo (targa)..." />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {veiculos.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        <strong>{v.placa}</strong> - {v.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>KM Inicial</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={iniciarForm.km_inicial}
                  onChange={(e) => setIniciarForm({ ...iniciarForm, km_inicial: parseFloat(e.target.value) })}
                  required
                  data-testid="input-km-inicial-turno"
                  placeholder="Ex: 10000.5"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                data-testid="iniciar-turno-button"
              >
                Iniciar Turno
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Fechar Turno Dialog */}
      <Dialog open={showFecharTurno} onOpenChange={setShowFecharTurno}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Fechar Turno - Milão
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFecharTurno} className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Veículo:</strong> {turnoAtivo?.veiculo_placa}<br/>
                <strong>KM Inicial:</strong> {turnoAtivo?.km_inicial.toFixed(1)}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>KM Final *</Label>
              <Input
                type="number"
                step="0.1"
                value={fecharForm.km_final}
                onChange={(e) => setFecharForm({ ...fecharForm, km_final: parseFloat(e.target.value) })}
                required
                data-testid="input-km-final-turno"
                placeholder="Ex: 10150.5"
              />
            </div>

            {/* Cálculo Automático de Combustível */}
            {(() => {
              const calculo = calcularLitrosAutomatico();
              if (calculo) {
                return (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="space-y-2">
                      <p className="font-semibold text-blue-900">📊 Cálculo Automático:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Distância percorrida:</p>
                          <p className="font-semibold">{calculo.kmRodado.toFixed(1)} km</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Consumo médio:</p>
                          <p className="font-semibold">{calculo.consumoMedio.toFixed(1)} km/L</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Litros consumidos:</p>
                          <p className="font-bold text-green-600">{calculo.litros.toFixed(2)} L</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Custo estimado:</p>
                          <p className="font-bold text-orange-600">€{calculo.custoEstimado.toFixed(2)}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        ✓ O sistema calculará automaticamente o combustível com base na média cadastrada do veículo.
                      </p>
                    </AlertDescription>
                  </Alert>
                );
              }
              return null;
            })()}

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowFecharTurno(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                data-testid="fechar-turno-button"
              >
                Fechar Turno e Sair
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="colaborador-header">Minha Produção</h1>
            <p className="text-sm text-gray-500">{user.name} - Turno: <span className="font-semibold capitalize">{user.turno}</span></p>
            {turnoAtivo && (
              <p className="text-xs text-green-600 font-semibold mt-1">
                🚗 {turnoAtivo.veiculo_placa} | KM Inicial: {turnoAtivo.km_inicial.toFixed(1)}
              </p>
            )}
          </div>
          <Button
            onClick={handleLogoutClick}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4" />
            Fechar Turno
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Date Selector */}
        <div className="mb-6">
          <Label>Data</Label>
          <Input
            type="date"
            value={dataTask}
            onChange={(e) => setDataTask(e.target.value)}
            className="max-w-xs"
            data-testid="input-data-selector"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Tasks na Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold" data-testid="colaborador-tasks-data">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-pink-600 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Custo Gerado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold" data-testid="colaborador-custo-data">€{stats.custo.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Add Task Form */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Registrar Nova Tarefa
            </CardTitle>
            <CardDescription>Adicione as tarefas que você realizou</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Tarefa</Label>
                  <Select value={tipo} onValueChange={setTipo}>
                    <SelectTrigger data-testid="select-tipo-tarefa">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="z-[9999]">
                      <SelectItem value="swap">Swap</SelectItem>
                      <SelectItem value="move">Move</SelectItem>
                      <SelectItem value="rebalancing">Rebalancing</SelectItem>
                      <SelectItem value="deploy">Deploy</SelectItem>
                      <SelectItem value="mecanica">Mecânica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    data-testid="input-quantidade"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    data-testid="add-task-button"
                  >
                    {loading ? "Adicionando..." : "Adicionar"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Tarefas Registradas</CardTitle>
            <CardDescription>Histórico das suas tarefas</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Nenhuma tarefa registrada para esta data</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Custo Unitário</TableHead>
                    <TableHead>Custo Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {taskIcons[task.tipo]}
                          <span className="font-medium">{taskLabels[task.tipo]}</span>
                        </div>
                      </TableCell>
                      <TableCell>{task.quantidade}</TableCell>
                      <TableCell>€{task.custo_unitario.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">€{task.custo_total.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          data-testid={`delete-task-${task.id}`}
                        >
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
      </main>
    </div>
  );
}
