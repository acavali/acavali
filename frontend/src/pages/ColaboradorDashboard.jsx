import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LogOut, Plus, Trash2, Battery, Move, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const [tipo, setTipo] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, custo: 0 });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const hoje = new Date().toISOString().split('T')[0];
      
      const response = await axios.get(`${API}/tasks?data=${hoje}`, {
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
          quantidade: parseInt(quantidade)
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
      <main className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Tasks Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold" data-testid="colaborador-tasks-hoje">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-pink-600 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Custo Gerado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold" data-testid="colaborador-custo-hoje">€{stats.custo.toFixed(2)}</div>
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
            <CardDescription>Adicione as tarefas que você realizou hoje</CardDescription>
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
                    <SelectContent>
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
            <CardTitle>Tarefas de Hoje</CardTitle>
            <CardDescription>Histórico das suas tarefas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Nenhuma tarefa registrada hoje</p>
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
