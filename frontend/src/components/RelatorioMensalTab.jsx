import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Calendar, FileText, Download, TrendingUp, DollarSign, Users, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function RelatorioMensalTab() {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFiltros, setShowFiltros] = useState(false);
  
  // Estados dos filtros avançados
  const [filtros, setFiltros] = useState({
    dataInicioCustom: "",
    dataFimCustom: "",
    colaboradorId: "",
    tipoFuncionario: "todos",
    tipoTarefa: "todas",
    tipoDespesa: "todas",
    valorMin: "",
    valorMax: "",
    localizacao: "",
    producaoMin: ""
  });
  
  // Lista de colaboradores para o select
  const [colaboradores, setColaboradores] = useState([]);

  const gerarRelatorio = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const mesFormatado = mes.toString().padStart(2, '0');
      const response = await axios.get(
        `${API}/relatorios/mensal?mes=${mesFormatado}&ano=${ano}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRelatorio(response.data);
      toast.success("Relatório gerado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    toast.info("Funcionalidade de exportação será implementada");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Relatório de Fechamento Mensal
              </CardTitle>
              <CardDescription>Análise completa do mês com lucro líquido e pagamentos</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex gap-4 items-end mb-6">
            <div className="space-y-2">
              <Label>Mês</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={mes}
                onChange={(e) => setMes(parseInt(e.target.value))}
                className="w-24"
              />
            </div>
            <div className="space-y-2">
              <Label>Ano</Label>
              <Input
                type="number"
                min="2020"
                max="2030"
                value={ano}
                onChange={(e) => setAno(parseInt(e.target.value))}
                className="w-32"
              />
            </div>
            <Button onClick={gerarRelatorio} disabled={loading}>
              <Calendar className="w-4 h-4 mr-2" />
              {loading ? "Gerando..." : "Gerar Relatório"}
            </Button>
            {relatorio && (
              <Button variant="outline" onClick={exportarPDF}>
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            )}
          </div>

          {/* Relatório */}
          {relatorio && (
            <div className="space-y-6">
              {/* Header do Relatório */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <h2 className="text-2xl font-bold text-blue-900 mb-2">
                  Relatório de {mes}/{ano}
                </h2>
                <p className="text-sm text-gray-600">Período: {relatorio.periodo}</p>
              </div>

              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Faturamento Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">€{relatorio.faturamento.total.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Despesas Totais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">€{relatorio.despesas.total.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card className={`bg-gradient-to-br ${relatorio.lucro_liquido >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} text-white`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Lucro Líquido
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">€{relatorio.lucro_liquido.toFixed(2)}</div>
                    <div className="text-sm mt-1">Margem: {relatorio.margem_lucro.toFixed(1)}%</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Tarefas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{relatorio.resumo_tarefas.total_tarefas}</div>
                    <div className="text-sm mt-1">{relatorio.resumo_tarefas.total_manutencoes} manutenções</div>
                  </CardContent>
                </Card>
              </div>

              {/* Breakdown de Despesas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💰 Detalhamento de Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Despesas de Tarefas</p>
                      <p className="text-2xl font-bold text-orange-600">€{relatorio.despesas.despesas_tasks.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Despesas Gerais</p>
                      <p className="text-2xl font-bold text-orange-600">€{relatorio.despesas.despesas_gerais.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Manutenções</p>
                      <p className="text-2xl font-bold text-orange-600">€{relatorio.despesas.despesas_manutencao.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Pagamentos</p>
                      <p className="text-2xl font-bold text-orange-600">€{relatorio.despesas.pagamentos_colaboradores.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pagamentos por Colaborador */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Pagamentos a Colaboradores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Diárias</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead>Manutenções</TableHead>
                        <TableHead>Salário Base</TableHead>
                        <TableHead>Bônus</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatorio.pagamentos_colaboradores.map((colab, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{colab.nome}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${colab.tipo === 'mecanico' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                              {colab.tipo === 'mecanico' ? '🔧 Mecânico' : '👨‍✈️ Motorista'}
                            </span>
                          </TableCell>
                          <TableCell>{colab.diarias_trabalhadas}</TableCell>
                          <TableCell>{colab.total_tasks}</TableCell>
                          <TableCell>{colab.total_manutencoes}</TableCell>
                          <TableCell>€{colab.salario_base.toFixed(2)}</TableCell>
                          <TableCell>€{(colab.bonus + colab.bonus_producao).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-bold text-green-600">
                            €{colab.salario_total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Registros de Localização */}
              {relatorio.registros_localizacao && relatorio.registros_localizacao.total_registros > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Registros de Localização (Login/Logout)
                    </CardTitle>
                    <CardDescription>
                      Mostrando os primeiros 50 registros de {relatorio.registros_localizacao.total_registros} totais
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Colaborador</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Hora</TableHead>
                          <TableHead>Localização</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatorio.registros_localizacao.registros.map((reg, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{reg.usuario_nome}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${reg.tipo === 'login' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {reg.tipo === 'login' ? '🟢 Login' : '🔴 Logout'}
                              </span>
                            </TableCell>
                            <TableCell>{reg.data}</TableCell>
                            <TableCell>{reg.hora}</TableCell>
                            <TableCell className="text-sm">
                              {reg.localizacao ? (
                                <div>
                                  {reg.localizacao.endereco || `${reg.localizacao.latitude}, ${reg.localizacao.longitude}`}
                                </div>
                              ) : (
                                <span className="text-gray-400">Sem localização</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Resumo Final */}
              <Alert className={`${relatorio.lucro_liquido >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">
                        {relatorio.lucro_liquido >= 0 ? '✅ Mês Lucrativo' : '⚠️ Mês com Prejuízo'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Lucro Líquido: €{relatorio.lucro_liquido.toFixed(2)} | Margem: {relatorio.margem_lucro.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Faturamento</p>
                      <p className="text-xl font-bold text-green-600">€{relatorio.faturamento.total.toFixed(2)}</p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {!relatorio && !loading && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Selecione o mês e ano e clique em "Gerar Relatório"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
