import { useState, useEffect } from "react";
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

  // Buscar colaboradores para o filtro
  const buscarColaboradores = async () => {
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

  // Carregar colaboradores ao montar componente
  useEffect(() => {
    buscarColaboradores();
  }, []);

  const gerarRelatorio = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const mesFormatado = mes.toString().padStart(2, '0');
      
      // Construir query params com filtros
      let url = `${API}/relatorios/mensal?mes=${mesFormatado}&ano=${ano}`;
      
      if (filtros.dataInicioCustom) url += `&data_inicio_custom=${filtros.dataInicioCustom}`;
      if (filtros.dataFimCustom) url += `&data_fim_custom=${filtros.dataFimCustom}`;
      if (filtros.colaboradorId) url += `&colaborador_id=${filtros.colaboradorId}`;
      if (filtros.tipoFuncionario !== "todos") url += `&tipo_funcionario=${filtros.tipoFuncionario}`;
      if (filtros.tipoTarefa !== "todas") url += `&tipo_tarefa=${filtros.tipoTarefa}`;
      if (filtros.tipoDespesa !== "todas") url += `&tipo_despesa=${filtros.tipoDespesa}`;
      if (filtros.valorMin) url += `&valor_min=${filtros.valorMin}`;
      if (filtros.valorMax) url += `&valor_max=${filtros.valorMax}`;
      if (filtros.localizacao) url += `&localizacao_filtro=${encodeURIComponent(filtros.localizacao)}`;
      if (filtros.producaoMin) url += `&producao_min=${filtros.producaoMin}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRelatorio(response.data);
      toast.success("Relatório gerado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  };

  const limparFiltros = () => {
    setFiltros({
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
  };

  // Contar filtros ativos
  const contarFiltrosAtivos = () => {
    let count = 0;
    if (filtros.dataInicioCustom) count++;
    if (filtros.dataFimCustom) count++;
    if (filtros.colaboradorId) count++;
    if (filtros.tipoFuncionario !== "todos") count++;
    if (filtros.tipoTarefa !== "todas") count++;
    if (filtros.tipoDespesa !== "todas") count++;
    if (filtros.valorMin) count++;
    if (filtros.valorMax) count++;
    if (filtros.localizacao) count++;
    if (filtros.producaoMin) count++;
    return count;
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
          {/* Filtros Básicos */}
          <div className="flex gap-4 items-end mb-4 flex-wrap">
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
            <Button 
              variant="outline" 
              onClick={() => setShowFiltros(!showFiltros)}
              className="flex items-center gap-2 relative"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {showFiltros ? "Ocultar" : "Filtros Avançados"}
              {contarFiltrosAtivos() > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {contarFiltrosAtivos()}
                </span>
              )}
            </Button>
            {relatorio && (
              <Button variant="outline" onClick={exportarPDF}>
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            )}
          </div>

          {/* Filtros Avançados */}
          {showFiltros && (
            <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🔍 Filtros Avançados
                </CardTitle>
                <CardDescription>Refine sua busca com filtros personalizados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Período Personalizado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>📅 Data Inicial (Período Customizado)</Label>
                    <Input
                      type="date"
                      value={filtros.dataInicioCustom}
                      onChange={(e) => setFiltros({...filtros, dataInicioCustom: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>📅 Data Final (Período Customizado)</Label>
                    <Input
                      type="date"
                      value={filtros.dataFimCustom}
                      onChange={(e) => setFiltros({...filtros, dataFimCustom: e.target.value})}
                    />
                  </div>
                </div>

                {/* Filtros de Colaborador */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>👥 Tipo de Funcionário</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={filtros.tipoFuncionario}
                      onChange={(e) => setFiltros({...filtros, tipoFuncionario: e.target.value})}
                    >
                      <option value="todos">Todos</option>
                      <option value="motorista">👨‍✈️ Motoristas</option>
                      <option value="mecanico">🔧 Mecânicos</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>👤 Colaborador Específico</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={filtros.colaboradorId}
                      onChange={(e) => setFiltros({...filtros, colaboradorId: e.target.value})}
                    >
                      <option value="">Todos os colaboradores</option>
                      {colaboradores.map((colab) => (
                        <option key={colab.id} value={colab.id}>
                          {colab.name} ({colab.tipo_funcionario === 'mecanico' ? '🔧' : '👨‍✈️'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filtros de Tarefa e Despesa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>📋 Tipo de Tarefa</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={filtros.tipoTarefa}
                      onChange={(e) => setFiltros({...filtros, tipoTarefa: e.target.value})}
                    >
                      <option value="todas">Todas</option>
                      <option value="deploy">Deploy</option>
                      <option value="swap">Swap</option>
                      <option value="move">Move</option>
                      <option value="mecanica">Mecânica</option>
                      <option value="rebalancing">Rebalancing</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>💰 Tipo de Despesa</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={filtros.tipoDespesa}
                      onChange={(e) => setFiltros({...filtros, tipoDespesa: e.target.value})}
                    >
                      <option value="todas">Todas</option>
                      <option value="tasks">Despesas de Tarefas</option>
                      <option value="gerais">Despesas Gerais</option>
                      <option value="manutencao">Manutenção</option>
                    </select>
                  </div>
                </div>

                {/* Valores e Produção */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>💶 Valor Mínimo (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 10.00"
                      value={filtros.valorMin}
                      onChange={(e) => setFiltros({...filtros, valorMin: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>💶 Valor Máximo (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 100.00"
                      value={filtros.valorMax}
                      onChange={(e) => setFiltros({...filtros, valorMax: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>📊 Produção Mínima</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 10"
                      value={filtros.producaoMin}
                      onChange={(e) => setFiltros({...filtros, producaoMin: e.target.value})}
                    />
                  </div>
                </div>

                {/* Localização */}
                <div className="space-y-2">
                  <Label>📍 Filtrar por Localização</Label>
                  <Input
                    type="text"
                    placeholder="Ex: Via Roma, Milano, Centro"
                    value={filtros.localizacao}
                    onChange={(e) => setFiltros({...filtros, localizacao: e.target.value})}
                  />
                  <p className="text-xs text-gray-500">
                    Digite parte do endereço registrado nos logins
                  </p>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={gerarRelatorio} disabled={loading} className="flex-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Aplicar Filtros
                  </Button>
                  <Button variant="outline" onClick={limparFiltros} className="flex-1">
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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
