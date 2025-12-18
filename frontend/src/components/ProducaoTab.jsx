import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar, Battery, Move, RefreshCw, Wrench, BarChart3, TrendingUp } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const taskIcons = {
  swap: <Battery className="w-4 h-4" />,
  move: <Move className="w-4 h-4" />,
  rebalancing: <RefreshCw className="w-4 h-4" />,
  deploy: <RefreshCw className="w-4 h-4" />,
  mecanica: <Wrench className="w-4 h-4" />
};

const taskLabels = {
  swap: "Swap",
  move: "Move",
  rebalancing: "Rebalancing",
  deploy: "Deploy",
  mecanica: "Mecânica"
};

// Valores de contrato Dott
const valoresContrato = {
  deploy: 2.80,
  rebalancing: 2.80,
  swap: 3.00,
  move: 3.20,
  mecanica: 21.00
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ProducaoTab() {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, [data]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/tasks?data=${data}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
      
      // Process data for charts
      const tasksByType = {};
      response.data.forEach(task => {
        if (!tasksByType[task.tipo]) {
          tasksByType[task.tipo] = {
            tipo: taskLabels[task.tipo] || task.tipo,
            quantidade: 0,
            faturamento: 0,
            custo: 0
          };
        }
        tasksByType[task.tipo].quantidade += task.quantidade;
        tasksByType[task.tipo].faturamento += task.quantidade * (valoresContrato[task.tipo] || 3.00);
        tasksByType[task.tipo].custo += task.custo_total;
      });
      
      setChartData(Object.values(tasksByType));
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar produção");
    }
  };

  // Group by colaborador
  const porColaborador = tasks.reduce((acc, task) => {
    if (!acc[task.colaborador_id]) {
      acc[task.colaborador_id] = {
        nome: task.colaborador_nome,
        turno: task.turno,
        tasks: [],
        total_quantidade: 0,
        total_custo: 0,
        total_faturamento: 0
      };
    }
    acc[task.colaborador_id].tasks.push(task);
    acc[task.colaborador_id].total_quantidade += task.quantidade;
    acc[task.colaborador_id].total_custo += task.custo_total;
    acc[task.colaborador_id].total_faturamento += task.quantidade * (valoresContrato[task.tipo] || 3.00);
    return acc;
  }, {});

  const colaboradoresList = Object.values(porColaborador);
  
  // Calculate totals
  const totalTasks = tasks.reduce((sum, t) => sum + t.quantidade, 0);
  const totalFaturamento = tasks.reduce((sum, t) => sum + (t.quantidade * (valoresContrato[t.tipo] || 3.00)), 0);
  const totalCusto = tasks.reduce((sum, t) => sum + t.custo_total, 0);
  const lucroBruto = totalFaturamento - totalCusto;
  const margemLucro = totalFaturamento > 0 ? ((lucroBruto / totalFaturamento) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Produção Diária
              </CardTitle>
              <CardDescription>Visualize a produção de todos os colaboradores por data</CardDescription>
            </div>
            <div className="w-48">
              <Label>Data</Label>
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                data-testid="input-data-producao"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Nenhuma produção registrada para esta data</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{totalTasks}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Faturamento Bruto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">€{totalFaturamento.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Despesa Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">€{totalCusto.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card className={`bg-gradient-to-br ${lucroBruto >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} text-white`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Lucro Bruto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">€{lucroBruto.toFixed(2)}</div>
                    <div className="text-sm mt-1">Margem: {margemLucro.toFixed(1)}%</div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Quantidade de Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tipo" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="quantidade" fill="#8884d8" name="Quantidade" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Faturamento vs Despesa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tipo" />
                        <YAxis />
                        <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="faturamento" fill="#10b981" name="Faturamento (€)" />
                        <Bar dataKey="custo" fill="#f59e0b" name="Despesa (€)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Lucro por Tipo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.map(item => ({
                        ...item,
                        lucro: item.faturamento - item.custo
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tipo" />
                        <YAxis />
                        <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="lucro" fill="#059669" name="Lucro Bruto (€)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Colaboradores List */}
              <div className="space-y-6">
                {colaboradoresList.map((colab) => (
                  <Card key={colab.nome} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg">{colab.nome}</CardTitle>
                          <p className="text-sm text-gray-500">Turno: <span className="capitalize font-semibold">{colab.turno}</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total Tasks</p>
                          <p className="text-2xl font-bold text-blue-600">{colab.total_quantidade}</p>
                          <p className="text-sm font-semibold text-green-600">Fat: €{colab.total_faturamento.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Quantidade</TableHead>
                            <TableHead>Custo Unit.</TableHead>
                            <TableHead>Faturamento</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {colab.tasks.map((task) => (
                            <TableRow key={task.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {taskIcons[task.tipo]}
                                  <span>{taskLabels[task.tipo]}</span>
                                </div>
                              </TableCell>
                              <TableCell>{task.quantidade}</TableCell>
                              <TableCell>€{task.custo_unitario.toFixed(2)}</TableCell>
                              <TableCell className="text-green-600 font-semibold">
                                €{(task.quantidade * (valoresContrato[task.tipo] || 3.00)).toFixed(2)}
                              </TableCell>
                              <TableCell className="font-semibold">€{task.custo_total.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-gray-50 font-semibold">
                            <TableCell colSpan={2}>Total do Colaborador</TableCell>
                            <TableCell></TableCell>
                            <TableCell className="text-green-600">€{colab.total_faturamento.toFixed(2)}</TableCell>
                            <TableCell>€{colab.total_custo.toFixed(2)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
