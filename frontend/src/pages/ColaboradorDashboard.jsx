import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LogOut, Plus, Trash2, Battery, Move, RefreshCw, Truck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const taskIcons = {
  swap: <Battery className="w-5 h-5" />,
  move: <Move className="w-5 h-5" />,
  rebalancing: <RefreshCw className="w-5 h-5" />
};

const taskLabels = {
  swap: "Troca de Swap",
  move: "Move",
  rebalancing: "Rebalancing"
};

export default function ColaboradorDashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [registrosVeiculos, setRegistrosVeiculos] = useState([]);
  const [tipo, setTipo] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [dataTask, setDataTask] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, custo: 0 });
  
  // Vehicle form
  const [veiculoForm, setVeiculoForm] = useState({
    veiculo_id: "",
    km_inicial: 0,
    km_final: 0,
    litros_diesel: 0,
    custo_diesel: 0
  });

  useEffect(() => {
    fetchTasks();
    fetchVeiculos();
    fetchRegistrosVeiculos();
  }, [dataTask]);

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
      toast.error("Erro ao carregar tarefas");
    }
  };

  const fetchVeiculos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/veiculos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter vehicles by user's shift
      const veiculosDoTurno = response.data.filter(v => v.turno === user.turno);
      setVeiculos(veiculosDoTurno);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRegistrosVeiculos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/registros-veiculos?data=${dataTask}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter only user's vehicle records
      const meusRegistros = response.data.filter(r => r.motorista_id === user.id);
      setRegistrosVeiculos(meusRegistros);
    } catch (error) {
      console.error(error);
    }
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

  const handleRegistrarVeiculo = async (e) => {
    e.preventDefault();
    if (!veiculoForm.veiculo_id) {
      toast.error("Selecione um veículo");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/registros-veiculos`,
        {
          ...veiculoForm,
          motorista_id: user.id,
          data: dataTask
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Registro de veículo salvo!");
      setVeiculoForm({
        veiculo_id: "",
        km_inicial: 0,
        km_final: 0,
        litros_diesel: 0,
        custo_diesel: 0
      });
      fetchRegistrosVeiculos();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Erro ao registrar veículo");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="colaborador-header">Minha Produção</h1>
            <p className="text-sm text-gray-500">{user.name} - Turno: <span className="font-semibold capitalize">{user.turno}</span></p>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4" />
            Sair
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

        {/* Tabs */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="tasks">Minhas Tasks</TabsTrigger>
            <TabsTrigger value="veiculo">Veículo</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            {/* Add Task Form */}
            <Card className="shadow-lg">
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
                          <SelectItem value="swap">Troca de Swap</SelectItem>
                          <SelectItem value="move">Move</SelectItem>
                          <SelectItem value="rebalancing">Rebalancing</SelectItem>
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
          </TabsContent>

          <TabsContent value="veiculo" className="space-y-6">
            {/* Vehicle Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Registrar Uso do Veículo
                </CardTitle>
                <CardDescription>Registre o KM inicial e final do seu turno</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegistrarVeiculo} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Veículo</Label>
                      <Select value={veiculoForm.veiculo_id} onValueChange={(val) => setVeiculoForm({ ...veiculoForm, veiculo_id: val })}>
                        <SelectTrigger data-testid="select-veiculo-colaborador">
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
                      <Label>KM Inicial</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={veiculoForm.km_inicial}
                        onChange={(e) => setVeiculoForm({ ...veiculoForm, km_inicial: parseFloat(e.target.value) })}
                        data-testid="input-km-inicial-colab"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>KM Final</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={veiculoForm.km_final}
                        onChange={(e) => setVeiculoForm({ ...veiculoForm, km_final: parseFloat(e.target.value) })}
                        data-testid="input-km-final-colab"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Litros Diesel</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={veiculoForm.litros_diesel}
                        onChange={(e) => setVeiculoForm({ ...veiculoForm, litros_diesel: parseFloat(e.target.value) })}
                        data-testid="input-litros-diesel-colab"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Custo Diesel (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={veiculoForm.custo_diesel}
                        onChange={(e) => setVeiculoForm({ ...veiculoForm, custo_diesel: parseFloat(e.target.value) })}
                        data-testid="input-custo-diesel-colab"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                        data-testid="registrar-veiculo-button"
                      >
                        Registrar
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Vehicle Records */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Meus Registros de Veículos</CardTitle>
                <CardDescription>Histórico de uso de veículos</CardDescription>
              </CardHeader>
              <CardContent>
                {registrosVeiculos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>Nenhum registro de veículo para esta data</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Veículo</TableHead>
                        <TableHead>KM Inicial</TableHead>
                        <TableHead>KM Final</TableHead>
                        <TableHead>KM Rodado</TableHead>
                        <TableHead>Diesel (L)</TableHead>
                        <TableHead>km/L</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrosVeiculos.map((reg) => (
                        <TableRow key={reg.id}>
                          <TableCell className="font-medium">{reg.veiculo_placa}</TableCell>
                          <TableCell>{reg.km_inicial.toFixed(1)}</TableCell>
                          <TableCell>{reg.km_final?.toFixed(1) || '-'}</TableCell>
                          <TableCell className="font-semibold">{reg.km_rodado?.toFixed(1) || '-'}</TableCell>
                          <TableCell>{reg.litros_diesel.toFixed(2)}</TableCell>
                          <TableCell>{reg.km_por_litro?.toFixed(2) || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
