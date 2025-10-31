import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BarChart3, TrendingUp, Users, Sun, Moon } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function RelatoriosTab() {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRelatorio();
  }, []);

  const fetchRelatorio = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/relatorios/diario?data=${data}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRelatorio(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar relatório");
    } finally {
      setLoading(false);
    }
  };

  if (!relatorio && !loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">Selecione uma data e clique em Gerar Relatório</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Gerar Relatório</CardTitle>
          <CardDescription>Selecione uma data para visualizar o relatório de produção</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 max-w-xs">
              <Label>Data</Label>
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                data-testid="input-data-relatorio"
              />
            </div>
            <Button onClick={fetchRelatorio} disabled={loading} data-testid="gerar-relatorio-button">
              {loading ? "Carregando..." : "Gerar Relatório"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {relatorio && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Tasks</CardTitle>
                <BarChart3 className="h-5 w-5 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="relatorio-total-tasks">{relatorio.total_tasks}</div>
                <p className="text-xs opacity-80 mt-1">Tasks realizadas</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Bruto</CardTitle>
                <TrendingUp className="h-5 w-5 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="relatorio-faturamento-bruto">€{relatorio.faturamento_bruto.toFixed(2)}</div>
                <p className="text-xs opacity-80 mt-1">Receita total</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Líquido</CardTitle>
                <TrendingUp className="h-5 w-5 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="relatorio-faturamento-liquido">€{relatorio.faturamento_liquido.toFixed(2)}</div>
                <p className="text-xs opacity-80 mt-1">Após descontos</p>
              </CardContent>
            </Card>
          </div>

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Custo de Produção:</span>
                    <span className="font-bold text-lg">€{relatorio.total_custo.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Despesas Operacionais:</span>
                    <span className="font-bold text-lg">€{relatorio.total_despesas.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Custo Veículos:</span>
                    <span className="font-bold text-lg">€{relatorio.total_custo_veiculos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Salários (diário):</span>
                    <span className="font-bold text-lg">€{relatorio.total_salarios.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg w-full">
                    <p className="text-sm text-gray-600 mb-2">Margem de Lucro</p>
                    <p className="text-4xl font-bold text-purple-600">
                      {relatorio.faturamento_bruto > 0 
                        ? ((relatorio.faturamento_liquido / relatorio.faturamento_bruto) * 100).toFixed(1)
                        : 0
                      }%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Dia vs Noite */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                <Moon className="w-5 h-5 text-indigo-500" />
                Comparação: Dia vs Noite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-lg">Turno Dia</h3>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tasks:</span>
                      <span className="font-bold text-lg" data-testid="turno-dia-tasks">{relatorio.por_turno.dia?.quantidade || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Custo:</span>
                      <span className="font-bold text-lg" data-testid="turno-dia-custo">€{(relatorio.por_turno.dia?.custo || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-semibold text-lg">Turno Noite</h3>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tasks:</span>
                      <span className="font-bold text-lg" data-testid="turno-noite-tasks">{relatorio.por_turno.noite?.quantidade || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Custo:</span>
                      <span className="font-bold text-lg" data-testid="turno-noite-custo">€{(relatorio.por_turno.noite?.custo || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Por Tipo de Tarefa */}
          <Card>
            <CardHeader>
              <CardTitle>Produção por Tipo de Tarefa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(relatorio.por_tipo).map(([tipo, dados]) => (
                  <div key={tipo} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold capitalize mb-2">{tipo}</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Quantidade: <span className="font-bold">{dados.quantidade}</span></p>
                      <p className="text-sm text-gray-600">Custo: <span className="font-bold">€{dados.custo.toFixed(2)}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Colaborador</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {relatorio.por_colaborador
                  .sort((a, b) => b.quantidade - a.quantidade)
                  .map((colab, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{colab.nome}</p>
                          <p className="text-sm text-gray-500 capitalize">Turno: {colab.turno}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{colab.quantidade}</p>
                        <p className="text-sm text-gray-500">€{colab.custo.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
