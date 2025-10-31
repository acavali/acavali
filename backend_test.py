import requests
import sys
import json
from datetime import datetime

class ProductionSystemTester:
    def __init__(self, base_url="https://team-shift-metrics.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.admin_user = None
        self.colaborador_user = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f", Expected: {expected_status}"
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"

            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {}
            return None

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return None

    def test_admin_login(self):
        """Test admin login"""
        print("\n🔐 Testing Admin Authentication...")
        response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@sistema.com", "password": "admin123"}
        )
        
        if response and 'access_token' in response:
            self.token = response['access_token']
            self.admin_user = response['user']
            return True
        return False

    def test_colaborador_management(self):
        """Test colaborador CRUD operations"""
        print("\n👥 Testing Colaborador Management...")
        
        # Create colaborador
        colaborador_data = {
            "name": "João Silva",
            "email": "joao@test.com",
            "password": "test123",
            "role": "colaborador",
            "turno": "dia",
            "custo_swap": 15.50,
            "custo_move": 12.00,
            "custo_rebalancing": 18.75,
            "salario": 1200.00,
            "bonus": 100.00,
            "horas_extras": 50.00
        }
        
        created_user = self.run_test(
            "Create Colaborador",
            "POST",
            "auth/register",
            200,
            data=colaborador_data
        )
        
        if not created_user:
            return False
            
        colaborador_id = created_user['id']
        
        # Get colaboradores list
        colaboradores = self.run_test(
            "Get Colaboradores",
            "GET",
            "users/colaboradores",
            200
        )
        
        # Update colaborador
        update_data = colaborador_data.copy()
        update_data['salario'] = 1300.00
        
        updated_user = self.run_test(
            "Update Colaborador",
            "PUT",
            f"users/{colaborador_id}",
            200,
            data=update_data
        )
        
        # Test colaborador login
        login_response = self.run_test(
            "Colaborador Login",
            "POST",
            "auth/login",
            200,
            data={"email": "joao@test.com", "password": "test123"}
        )
        
        if login_response:
            self.colaborador_user = login_response['user']
        
        return True

    def test_vehicle_management(self):
        """Test vehicle CRUD operations"""
        print("\n🚛 Testing Vehicle Management...")
        
        # Create vehicle
        veiculo_data = {
            "placa": "ABC-1234",
            "modelo": "Ford Transit",
            "turno": "dia"
        }
        
        created_vehicle = self.run_test(
            "Create Vehicle",
            "POST",
            "veiculos",
            200,
            data=veiculo_data
        )
        
        if not created_vehicle:
            return False
            
        vehicle_id = created_vehicle['id']
        
        # Get vehicles list
        vehicles = self.run_test(
            "Get Vehicles",
            "GET",
            "veiculos",
            200
        )
        
        # Create vehicle usage record
        if self.colaborador_user:
            registro_data = {
                "veiculo_id": vehicle_id,
                "motorista_id": self.colaborador_user['id'],
                "km_inicial": 1000.0,
                "km_final": 1150.5,
                "litros_diesel": 25.5,
                "custo_diesel": 35.70,
                "data": datetime.now().strftime('%Y-%m-%d')
            }
            
            created_registro = self.run_test(
                "Create Vehicle Record",
                "POST",
                "registros-veiculos",
                200,
                data=registro_data
            )
            
            # Get vehicle records
            registros = self.run_test(
                "Get Vehicle Records",
                "GET",
                "registros-veiculos",
                200
            )
        
        return True

    def test_task_management(self):
        """Test task CRUD operations"""
        print("\n📋 Testing Task Management...")
        
        if not self.colaborador_user:
            print("❌ No colaborador user available for task testing")
            return False
        
        # Create tasks
        task_types = ["swap", "move", "rebalancing"]
        created_tasks = []
        
        for task_type in task_types:
            task_data = {
                "colaborador_id": self.colaborador_user['id'],
                "tipo": task_type,
                "quantidade": 3,
                "data": datetime.now().strftime('%Y-%m-%d')
            }
            
            created_task = self.run_test(
                f"Create {task_type.title()} Task",
                "POST",
                "tasks",
                200,
                data=task_data
            )
            
            if created_task:
                created_tasks.append(created_task)
        
        # Get tasks
        tasks = self.run_test(
            "Get Tasks",
            "GET",
            "tasks",
            200
        )
        
        # Get tasks by date
        today = datetime.now().strftime('%Y-%m-%d')
        tasks_today = self.run_test(
            "Get Tasks by Date",
            "GET",
            f"tasks?data={today}",
            200
        )
        
        return len(created_tasks) > 0

    def test_expense_management(self):
        """Test expense CRUD operations"""
        print("\n💰 Testing Expense Management...")
        
        # Create expense
        despesa_data = {
            "descricao": "Compra de material de escritório",
            "valor": 125.50,
            "categoria": "material",
            "pago_por": "Admin",
            "observacoes": "Papel, canetas e grampos",
            "data": datetime.now().strftime('%Y-%m-%d')
        }
        
        created_expense = self.run_test(
            "Create Expense",
            "POST",
            "despesas",
            200,
            data=despesa_data
        )
        
        if not created_expense:
            return False
        
        # Get expenses
        expenses = self.run_test(
            "Get Expenses",
            "GET",
            "despesas",
            200
        )
        
        # Get expenses by date
        today = datetime.now().strftime('%Y-%m-%d')
        expenses_today = self.run_test(
            "Get Expenses by Date",
            "GET",
            f"despesas?data={today}",
            200
        )
        
        return True

    def test_reports(self):
        """Test report generation"""
        print("\n📊 Testing Reports...")
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Daily report
        daily_report = self.run_test(
            "Generate Daily Report",
            "GET",
            f"relatorios/diario?data={today}",
            200
        )
        
        if daily_report:
            # Verify report structure
            required_fields = ['total_tasks', 'total_custo', 'por_tipo', 'por_colaborador', 'por_turno']
            has_all_fields = all(field in daily_report for field in required_fields)
            self.log_test("Daily Report Structure", has_all_fields, 
                         f"Missing fields: {[f for f in required_fields if f not in daily_report]}")
        
        # Period report
        period_report = self.run_test(
            "Generate Period Report",
            "GET",
            f"relatorios/periodo?data_inicio={today}&data_fim={today}",
            200
        )
        
        return daily_report is not None

    def test_authentication_flow(self):
        """Test authentication and authorization"""
        print("\n🔒 Testing Authentication Flow...")
        
        # Test /me endpoint
        me_response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        # Test unauthorized access (without token)
        old_token = self.token
        self.token = None
        
        unauthorized = self.run_test(
            "Unauthorized Access Test",
            "GET",
            "users",
            401
        )
        
        # Restore token
        self.token = old_token
        
        return me_response is not None

    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Production System API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Test basic connectivity
        try:
            response = requests.get(f"{self.api_url}/")
            if response.status_code == 200:
                self.log_test("API Connectivity", True, "API is accessible")
            else:
                self.log_test("API Connectivity", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("API Connectivity", False, f"Connection error: {str(e)}")
            return False
        
        # Run test suites
        if not self.test_admin_login():
            print("❌ Admin login failed - stopping tests")
            return False
        
        self.test_authentication_flow()
        self.test_colaborador_management()
        self.test_vehicle_management()
        self.test_task_management()
        self.test_expense_management()
        self.test_reports()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = ProductionSystemTester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': (tester.tests_passed/tester.tests_run*100) if tester.tests_run > 0 else 0,
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())