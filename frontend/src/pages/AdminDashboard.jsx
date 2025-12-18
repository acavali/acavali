import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LogOut, Users, BarChart3, Calendar, Truck, Receipt } from "lucide-react";
import ColaboradoresTab from "@/components/ColaboradoresTab";
import RelatoriosTab from "@/components/RelatoriosTab";
import RelatoriosAvancadosTab from "@/components/RelatoriosAvancadosTab";
import RelatorioMensalTab from "@/components/RelatorioMensalTab";
import ProducaoTab from "@/components/ProducaoTab";
import VeiculosTab from "@/components/VeiculosTab";
import DespesasTab from "@/components/DespesasTab";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard({ user, onLogout }) {
  const [stats, setStats] = useState({ colaboradores: 0, tasks_hoje: 0, custo_hoje: 0, despesas_hoje: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const hoje = new Date().toISOString().split('T')[0];
      
      const [colaboradoresRes, relatorioRes] = await Promise.all([
        axios.get(`${API}/users/colaboradores`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/relatorios/diario?data=${hoje}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats({
        colaboradores: colaboradoresRes.data.length,
        tasks_hoje: relatorioRes.data.total_tasks,
        custo_hoje: relatorioRes.data.total_custo,
        despesas_hoje: relatorioRes.data.total_despesas + relatorioRes.data.total_custo_veiculos
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      // Registrar logout
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
    } catch (error) {
      console.error("Erro ao registrar logout:", error);
    } finally {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="admin-header">Dashboard Admin</h1>
            <p className="text-sm text-gray-500">Bem-vindo, {user.name}</p>
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
      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
              <Users className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="total-colaboradores">{stats.colaboradores}</div>
              <p className="text-xs opacity-80 mt-1">Total de colaboradores</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tasks Hoje</CardTitle>
              <BarChart3 className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="tasks-hoje">{stats.tasks_hoje}</div>
              <p className="text-xs opacity-80 mt-1">Total de tarefas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Custo Tasks</CardTitle>
              <Calendar className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="custo-hoje">€{stats.custo_hoje.toFixed(2)}</div>
              <p className="text-xs opacity-80 mt-1">Custo produção</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <Receipt className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="despesas-hoje">€{stats.despesas_hoje.toFixed(2)}</div>
              <p className="text-xs opacity-80 mt-1">Outras despesas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="producao" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto">
            <TabsTrigger value="producao" data-testid="tab-producao">Produção</TabsTrigger>
            <TabsTrigger value="colaboradores" data-testid="tab-colaboradores">Colaboradores</TabsTrigger>
            <TabsTrigger value="veiculos" data-testid="tab-veiculos">Veículos</TabsTrigger>
            <TabsTrigger value="despesas" data-testid="tab-despesas">Despesas</TabsTrigger>
            <TabsTrigger value="relatorios" data-testid="tab-relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="producao">
            <ProducaoTab />
          </TabsContent>

          <TabsContent value="colaboradores">
            <ColaboradoresTab />
          </TabsContent>

          <TabsContent value="veiculos">
            <VeiculosTab />
          </TabsContent>

          <TabsContent value="despesas">
            <DespesasTab />
          </TabsContent>

          <TabsContent value="relatorios">
            <Tabs defaultValue="avancado" className="space-y-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="avancado">Relatórios Avançados</TabsTrigger>
                <TabsTrigger value="mensal">Fechamento Mensal</TabsTrigger>
              </TabsList>

              <TabsContent value="avancado">
                <RelatoriosAvancadosTab />
              </TabsContent>

              <TabsContent value="mensal">
                <RelatorioMensalTab />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
