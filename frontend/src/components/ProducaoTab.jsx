import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar, Battery, Move, RefreshCw, Wrench } from "lucide-react";

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

export default function ProducaoTab() {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState([]);

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
        total_custo: 0
      };
    }
    acc[task.colaborador_id].tasks.push(task);
    acc[task.colaborador_id].total_quantidade += task.quantidade;
    acc[task.colaborador_id].total_custo += task.custo_total;
    return acc;
  }, {});

  const colaboradoresList = Object.values(porColaborador);

  return (
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
                          <TableCell className="font-semibold">€{task.custo_total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-50 font-semibold">
                        <TableCell colSpan={3}>Total do Colaborador</TableCell>
                        <TableCell>€{colab.total_custo.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
