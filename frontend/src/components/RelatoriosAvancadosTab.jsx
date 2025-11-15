import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Filter, TrendingUp, Euro, BarChart3 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Valores de contrato Dott
const valoresContrato = {
  deploy: 2.80,
  rebalancing: 2.80,
  swap: 3.00,
  move: 3.20,
  mecanica: 21.00
};

export default function RelatoriosAvancadosTab() {
  const [dataInicio, setDataInicio] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  const [colaboradorFiltro, setColaboradorFiltro] = useState("");
  const [tipoTaskFiltro, setTipoTaskFiltro] = useState("");
  const [colaboradores, setColaboradores] = useState([]);
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(false);

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
    }
  };

  const handleGerar = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      let url = `${API}/relatorios/periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`;
      if (colaboradorFiltro && colaboradorFiltro !== "todos") url += `&colaborador_id=${colaboradorFiltro}`;
      if (tipoTaskFiltro && tipoTaskFiltro !== "todos") url += `&tipo_task=${tipoTaskFiltro}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRelatorio(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Relatórios Avançados com Filtros
          </CardTitle>
          <CardDescription>Filtre por período, colaborador ou tipo de task</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                data-testid="input-data-inicio"
              />
            </div>

            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                data-testid="input-data-fim"
              />
            </div>

            <div className="space-y-2">
              <Label>Colaborador (Opcional)</Label>
              <Select value={colaboradorFiltro || undefined} onValueChange={(val) => setColaboradorFiltro(val || "")}>
                <SelectTrigger data-testid="select-colaborador-filtro">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {colaboradores.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Task (Opcional)</Label>
              <Select value={tipoTaskFiltro || undefined} onValueChange={(val) => setTipoTaskFiltro(val || "")}>
                <SelectTrigger data-testid="select-tipo-filtro">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="swap">Swap</SelectItem>
                  <SelectItem value="move">Move</SelectItem>
                  <SelectItem value="deploy">Deploy</SelectItem>
                  <SelectItem value="rebalancing">Rebalancing</SelectItem>
                  <SelectItem value="mecanica">Mecânica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleGerar} 
            disabled={loading}
            className="w-full md:w-auto"
            data-testid="gerar-relatorio-avancado"
          >
            {loading ? "Gerando..." : "Gerar Relatório"}
          </Button>
        </CardContent>
      </Card>

      {/* Valores de Contrato Dott */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Euro className="w-5 h-5" />
            Valores de Contrato Dott
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Deploy</p>
              <p className="text-xl font-bold text-blue-600">€{valoresContrato.deploy.toFixed(2)}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Swap</p>
              <p className="text-xl font-bold text-green-600">€{valoresContrato.swap.toFixed(2)}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Move</p>
              <p className="text-xl font-bold text-purple-600">€{valoresContrato.move.toFixed(2)}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Rebalancing</p>
              <p className="text-xl font-bold text-orange-600">€{valoresContrato.rebalancing.toFixed(2)}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">Mecânica</p>
              <p className="text-xl font-bold text-red-600">€{valoresContrato.mecanica.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {relatorio && (
        <>
          {/* Cards de Totais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{relatorio.totais.tasks}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">€{relatorio.totais.faturamento.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">€{relatorio.totais.custo.toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Lucro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">€{relatorio.totais.lucro.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Por Tipo de Task */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Análise por Tipo de Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Valor Contrato (Unit.)</TableHead>
                    <TableHead>Faturamento</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Lucro</TableHead>
                    <TableHead>Margem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(relatorio.por_tipo).map(([tipo, dados]) => {
                    const lucro = dados.faturamento - dados.custo;
                    const margem = dados.faturamento > 0 ? ((lucro / dados.faturamento) * 100).toFixed(1) : 0;
                    return (
                      <TableRow key={tipo}>
                        <TableCell className="font-medium capitalize">{tipo}</TableCell>
                        <TableCell>{dados.quantidade}</TableCell>
                        <TableCell className="font-semibold">€{valoresContrato[tipo]?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell className="text-green-600 font-bold">€{dados.faturamento.toFixed(2)}</TableCell>
                        <TableCell className="text-red-600">€{dados.custo.toFixed(2)}</TableCell>
                        <TableCell className={`font-bold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          €{lucro.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${margem > 50 ? 'bg-green-100 text-green-800' : margem > 20 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {margem}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Por Colaborador */}
          {relatorio.por_colaborador.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Colaborador</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Turno</TableHead>
                      <TableHead>Tasks</TableHead>
                      <TableHead>Faturamento</TableHead>
                      <TableHead>Custo</TableHead>
                      <TableHead>Contribuição Lucro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatorio.por_colaborador.map((colab) => {
                      const lucro = colab.faturamento - colab.custo;
                      return (
                        <TableRow key={colab.id}>
                          <TableCell className="font-medium">{colab.nome}</TableCell>
                          <TableCell className="capitalize">{colab.turno}</TableCell>
                          <TableCell>{colab.quantidade}</TableCell>
                          <TableCell className="text-green-600 font-semibold">€{colab.faturamento.toFixed(2)}</TableCell>
                          <TableCell className="text-red-600">€{colab.custo.toFixed(2)}</TableCell>
                          <TableCell className={`font-bold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            €{lucro.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Por Data */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução Diária</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Faturamento</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Lucro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(relatorio.por_data)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([data, dados]) => {
                      const lucro = dados.faturamento - dados.custo;
                      return (
                        <TableRow key={data}>
                          <TableCell className="font-medium">{new Date(data).toLocaleDateString('pt-PT')}</TableCell>
                          <TableCell>{dados.quantidade}</TableCell>
                          <TableCell className="text-green-600">€{dados.faturamento.toFixed(2)}</TableCell>
                          <TableCell className="text-red-600">€{dados.custo.toFixed(2)}</TableCell>
                          <TableCell className={`font-bold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            €{lucro.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
