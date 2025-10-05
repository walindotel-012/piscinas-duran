import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X, User, FileText, Users, Wrench, DollarSign, Printer, Plus, Edit, Trash2, CheckCircle, AlertCircle, Download, Info, Calendar, LogOut } from 'lucide-react';
import { useAuth } from './components/AuthProvider';
import { servicesService, clientsService, invoicesService } from './lib/services';
import { onSnapshot, query, where } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import { db } from './lib/firebase';

const App = () => {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [monthlyInvoices, setMonthlyInvoices] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [newClient, setNewClient] = useState({ name: '', serviceId: '', servicePrice: '', phone: '' });
  const [newService, setNewService] = useState({ name: '', price: '' });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DollarSign },
    { id: 'invoices', label: 'Facturas', icon: FileText },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'services', label: 'Servicios', icon: Wrench }
  ];

  // Cargar datos desde Firebase
const loadData = useCallback(async () => {
  if (!currentUser) return;
  
  setLoading(true);
  try {
    // Cargar servicios
    const servicesUnsub = onSnapshot(
      servicesService.getAll(currentUser.uid),
      (snapshot) => {
        const servicesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setServices(servicesData); // ✅ Asegúrate de que esto se ejecute
      }
    );
    // ... resto del código
  } catch (error) {
    console.error('Error al cargar datos:', error);
    setLoading(false);
  }
}, [currentUser]);
 useEffect(() => {
  if (!currentUser) return;
  

  let servicesUnsub, clientsUnsub, invoicesUnsub;

  const loadData = async () => {
    try {
      // Cargar servicios
      servicesUnsub = onSnapshot(
        servicesService.getAll(currentUser.uid),
        (snapshot) => {
          const servicesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setServices(servicesData);
        }
      );

      // Cargar clientes
      clientsUnsub = onSnapshot(
        clientsService.getAll(currentUser.uid),
        (snapshot) => {
          const clientsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setClients(clientsData);
        }
      );

      // Cargar facturas
      invoicesUnsub = onSnapshot(
        invoicesService.getAll(currentUser.uid),
        (snapshot) => {
          const invoicesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setInvoices(invoicesData);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoading(false);
    }
  };

  loadData();

  // Función de limpieza
  return () => {
    if (servicesUnsub && typeof servicesUnsub === 'function') servicesUnsub();
    if (clientsUnsub && typeof clientsUnsub === 'function') clientsUnsub();
    if (invoicesUnsub && typeof invoicesUnsub === 'function') invoicesUnsub();
  };
}, [currentUser]);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // CLIENT FUNCTIONS
 // CLIENT FUNCTIONS
// CLIENT FUNCTIONS
const handleAddClient = async () => {
  if (!newClient.name || !newClient.serviceId) {
    showNotification('Por favor complete todos los campos requeridos', 'error');
    return;
  }

  try {
    // ✅ Asegúrate de que services esté cargado
    if (services.length === 0) {
      showNotification('Error: No hay servicios disponibles', 'error');
      return;
    }

    // ✅ Convierte serviceId a número
    const serviceIdNum = parseInt(newClient.serviceId);
    if (isNaN(serviceIdNum)) {
      showNotification('Error: ID de servicio inválido', 'error');
      return;
    }

    // ✅ Busca el servicio por ID numérico
    const service = services.find(s => s.id === serviceIdNum);
    
    if (!service) {
      showNotification(`Error: Servicio con ID ${serviceIdNum} no encontrado`, 'error');
      console.log('Servicios disponibles:', services);
      return;
    }

    const clientData = {
      name: newClient.name,
      serviceId: serviceIdNum,
      serviceName: service.name,
      servicePrice: parseInt(newClient.servicePrice) || service.price,
      status: 'active',
      phone: newClient.phone || ''
    };
    
    await clientsService.create(clientData, currentUser.uid);
    setNewClient({ name: '', serviceId: '', servicePrice: '', phone: '' });
    setShowAddClient(false);
    showNotification('Cliente agregado exitosamente', 'success');
  } catch (error) {
    console.error('Error detallado al agregar cliente:', error);
    showNotification(`Error al agregar cliente: ${error.message || 'Verifique la consola'}`, 'error');
  }
};
const handleEditClient = (client) => {
  if (!client) {
    showNotification('Error: Cliente no válido', 'error');
    return;
  }
  
  setEditingClient(client);
  setNewClient({
    name: client.name || '',
    serviceId: client.serviceId ? client.serviceId.toString() : '',
    servicePrice: client.servicePrice ? client.servicePrice.toString() : '',
    phone: client.phone || ''
  });
  setShowAddClient(true);
};

const handleUpdateClient = async () => {
  if (!editingClient) {
    showNotification('Error: No se encontró el cliente a actualizar', 'error');
    return;
  }

  try {
    // ✅ Convertir serviceId a número
    const serviceIdNum = parseInt(newClient.serviceId);
    const service = services.find(s => s.id === serviceIdNum);
    
    if (!service) {
      showNotification('Error: Servicio no encontrado', 'error');
      return;
    }

    const clientData = {
      name: newClient.name || editingClient.name,
      serviceId: serviceIdNum, // ✅ Guardar como número
      serviceName: service.name,
      servicePrice: parseInt(newClient.servicePrice) || service.price,
      status: editingClient.status || 'active',
      phone: newClient.phone || editingClient.phone || ''
    };
    
    await clientsService.update(editingClient.id, clientData, currentUser.uid);
    setEditingClient(null);
    setNewClient({ name: '', serviceId: '', servicePrice: '', phone: '' });
    setShowAddClient(false);
    showNotification('Cliente actualizado exitosamente', 'success');
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    showNotification('Error al actualizar cliente', 'error');
  }
};

const handleDeleteClient = async (clientId) => {
  if (window.confirm('¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.')) {
    try {
      await clientsService.delete(clientId);
      showNotification('Cliente eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      showNotification('Error al eliminar cliente', 'error');
    }
  }
};

  // SERVICE FUNCTIONS
  const handleAddService = async () => {
    if (newService.name && newService.price) {
      try {
        const serviceData = {
          name: newService.name,
          price: parseInt(newService.price)
        };
        await servicesService.create(serviceData, currentUser.uid);
        setNewService({ name: '', price: '' });
        setShowAddService(false);
        showNotification('Servicio agregado exitosamente', 'success');
      } catch (error) {
        showNotification('Error al agregar servicio', 'error');
      }
    }
  };

  const handleEditService = (service) => {
  setEditingService(service);
  setNewService({
    name: service.name,
    price: service.price.toString()
  });
  setShowAddService(true);
};

  const handleUpdateService = async () => {
  if (editingService) {
    try {
      const serviceData = {
        name: newService.name,
        price: parseInt(newService.price)
      };
      
      await servicesService.update(editingService.id, serviceData, currentUser.uid);
      
      // Actualizar clientes que usan este servicio
      const updatedClients = clients.filter(client => client.serviceId === editingService.id);
      for (const client of updatedClients) {
        await clientsService.update(client.id, {
          ...client,
          serviceName: newService.name,
          servicePrice: parseInt(newService.price)
        }, currentUser.uid);
      }
      
      setEditingService(null);
      setNewService({ name: '', price: '' });
      setShowAddService(false);
      showNotification('Servicio actualizado exitosamente', 'success');
    } catch (error) {
      showNotification('Error al actualizar servicio', 'error');
    }
  }
};

  const handleDeleteService = async (serviceId) => {
    const clientsUsingService = clients.filter(client => client.serviceId === serviceId);
    if (clientsUsingService.length > 0) {
      alert(`No se puede eliminar este servicio porque ${clientsUsingService.length} cliente(s) lo están utilizando.`);
      return;
    }
    
    if (window.confirm('¿Está seguro de que desea eliminar este servicio?')) {
      try {
        await servicesService.delete(serviceId);
        showNotification('Servicio eliminado exitosamente', 'success');
      } catch (error) {
        showNotification('Error al eliminar servicio', 'error');
      }
    }
  };

  // INVOICE FUNCTIONS
  const toggleInvoiceStatus = async (invoiceId) => {
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      const newStatus = invoice.status === 'paid' ? 'pending' : 'paid';
      await invoicesService.update(invoiceId, { status: newStatus }, currentUser.uid);
      showNotification('Estado de factura actualizado', 'success');
    } catch (error) {
      showNotification('Error al actualizar estado', 'error');
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta factura?')) {
      try {
        await invoicesService.delete(invoiceId);
        showNotification('Factura eliminada exitosamente', 'success');
      } catch (error) {
        showNotification('Error al eliminar factura', 'error');
      }
    }
  };

 // En App.jsx - Modifica la función generateMonthlyInvoices
const generateMonthlyInvoices = async () => {
  try {
    // Verificar que haya clientes activos
    const activeClients = clients.filter(client => client.status === 'active');
    if (activeClients.length === 0) {
      showNotification('No hay clientes activos para generar facturas', 'info');
      setShowGenerateModal(false);
      return;
    }

    // Generar facturas usando el servicio
    const newInvoices = await invoicesService.generateMonthly(activeClients, currentUser.uid);
    
    if (newInvoices.length === 0) {
      showNotification('No se pudieron generar facturas', 'error');
      return;
    }

    setMonthlyInvoices(prev => [...prev, ...newInvoices]);
    showNotification(`Se generaron ${newInvoices.length} facturas mensuales`, 'success');
    setShowGenerateModal(false);
    
  } catch (error) {
    console.error('Error detallado al generar facturas:', error);
    showNotification(`Error al generar facturas: ${error.message || 'Verifique la consola'}`, 'error');
    setShowGenerateModal(false);
  }
};

const printInvoice = (invoice) => {
  // Formato de fecha en español
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Formato de moneda RD$
  const formatCurrencyRD = (amount) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Generar número de factura en formato FACT-XXXXX
  const generateInvoiceNumber = () => {
    if (invoice.number) {
      return invoice.number;
    }
    const baseNumber = invoice.id 
      ? String(invoice.id).padStart(5, '0').slice(-5) 
      : String(Date.now()).slice(-5);
    return `FACT-${baseNumber}`;
  };

  const invoiceNumber = generateInvoiceNumber();

  // Crear iframe para impresión
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Factura - Piscinas Durán</title>
      <style>
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          color: #000;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #ddd;
          padding: 30px;
        }
        .header-blue-bar {
          background-color: #17365d;
          height: 10px;
          margin: -30px -30px 20px -30px;
        }
        .logo-section {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        .logo-placeholder {
          width: 60px;
          height: 60px;
          background-image: url('data:image/png;base64,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');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
        .company-info {
          margin-left: 15px;
        }
        .company-name {
          font-size: 16px;
          font-weight: bold;
          color: #17365d;
          line-height: 1.2;
        }
        .company-details {
          font-size: 11px;
          color: #333;
          line-height: 1.4;
        }
        .invoice-header {
          text-align: right;
          margin-bottom: 20px;
        }
        .invoice-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .invoice-details {
          font-size: 12px;
          color: #333;
        }
        .client-section {
          border: 1px solid #17365d;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 20px;
        }
        .client-title {
          font-size: 14px;
          font-weight: bold;
          color: #17365d;
          margin-bottom: 8px;
        }
        .client-info {
          font-size: 12px;
          color: #333;
          line-height: 1.5;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background-color: #17365d;
          color: white;
          padding: 8px;
          font-size: 12px;
          text-align: center;
        }
        td {
          padding: 8px;
          font-size: 12px;
          border: 1px solid #ddd;
          text-align: center;
        }
        .total-section {
          text-align: right;
          margin-top: 10px;
        }
        .total-label {
          font-weight: bold;
          font-size: 12px;
          margin-right: 10px;
        }
        .total-amount {
          font-weight: bold;
          font-size: 12px;
          color: #008000;
        }
        .footer-message {
          text-align: left;
          font-weight: bold;
          color: #008000;
          font-size: 14px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #17365d;
        }
        .footer-blue-bar {
          background-color: #17365d;
          height: 10px;
          margin: 20px -30px -30px -30px;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .invoice-container {
            padding: 20px;
            border: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Barra azul superior -->
        <div class="header-blue-bar"></div>
        
        <!-- Logo y datos de la empresa -->
        <div class="logo-section">
          <div class="logo-placeholder"></div>
          <div class="company-info">
            <div class="company-name">CONSTRUCCIÓN, MANTENIMIENTO &<br>REPARACIONES DE PISCINAS DURÁN</div>
            <div class="company-details">
              DIRECCIÓN: Calle Buen Pastor #5 Alondra, Pantoja<br>
              TELÉFONO: (809) 856-7741<br>
              CORREO: rogeliodurran88@gmail.com
            </div>
          </div>
        </div>
        
        <!-- Encabezado de factura -->
        <div class="invoice-header">
          <div class="invoice-title">FACTURA</div>
          <div class="invoice-details">N° DE FACTURA: ${invoiceNumber}</div>
          <div class="invoice-details">FECHA: ${formatDate(invoice.date)}</div>
        </div>
        
        <!-- Datos del cliente -->
        <div class="client-section">
          <div class="client-title">DATOS DEL CLIENTE</div>
          <div class="client-info">
            Cliente: ${invoice.clientName || ''}<br>
            Servicio: ${invoice.serviceName || ''}<br>
            Teléfono: ${invoice.clientPhone || ''}
          </div>
        </div>
        
        <!-- Tabla de items -->
        <table>
          <thead>
            <tr>
              <th>CANT.</th>
              <th>DESCRIPCIÓN</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>${invoice.serviceName || ''}</td>
              <td>${formatCurrencyRD(invoice.amount)}</td>
            </tr>
          </tbody>
        </table>
        
        <!-- Total -->
        <div class="total-section">
          <span class="total-label">TOTAL:</span>
          <span class="total-amount">${formatCurrencyRD(invoice.amount)}</span>
        </div>
        
        <!-- Mensaje de agradecimiento -->
        <div class="footer-message">¡Gracias por su pago!</div>
        
        <!-- Barra azul inferior -->
        <div class="footer-blue-bar"></div>
      </div>
      
      <script>
        window.print();
      </script>
    </body>
    </html>
  `;
  
  iframe.contentDocument.write(printContent);
  iframe.contentDocument.close();
};
  // Dashboard statistics
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex space-x-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-blue-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Facturas Pendientes</p>
              <p className="text-3xl font-bold text-gray-800">{pendingInvoices.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Total: ${totalPending.toLocaleString()}</p>
          </div>
        </div>

        <div className="card border-green-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Facturas Cobradas</p>
              <p className="text-3xl font-bold text-gray-800">{paidInvoices.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Total: ${totalPaid.toLocaleString()}</p>
          </div>
        </div>

        <div className="card border-purple-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total a Cobrar</p>
              <p className="text-3xl font-bold text-gray-800">${totalPending.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Mes actual</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Actividad Reciente</h2>
        <div className="space-y-4">
          {invoices.slice(0, 5).map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${invoice.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <div>
                  <p className="font-medium text-gray-800">{invoice.clientName}</p>
                  <p className="text-sm text-gray-500">{invoice.serviceName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-gray-800">${invoice.amount.toLocaleString()}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  invoice.status === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {invoice.status === 'paid' ? 'Cobrado' : 'Pendiente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-gray-800">{clients.length}</div>
          <p className="text-sm text-gray-600 mt-1">Clientes Activos</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-gray-800">{services.length}</div>
          <p className="text-sm text-gray-600 mt-1">Servicios Disponibles</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-gray-800">{invoices.length}</div>
          <p className="text-sm text-gray-600 mt-1">Facturas Generadas</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-2xl font-bold text-gray-800">{Math.round((paidInvoices.length / invoices.length) * 100) || 0}%</div>
          <p className="text-sm text-gray-600 mt-1">Tasa de Cobro</p>
        </div>
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Facturas</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Generar Facturas Mensuales
          </button>
        </div>
      </div>

      {/* Modal de confirmación para generar facturas */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Generar Facturas Mensuales
                </h2>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  ¿Desea generar facturas para todos los clientes activos del mes actual?
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Clientes activos:</strong> {clients.filter(c => c.status === 'active').length}
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    <strong>Fecha de generación:</strong> {new Date().toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={generateMonthlyInvoices}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Generar Facturas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invoice.clientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.serviceName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">${invoice.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleInvoiceStatus(invoice.id)}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        {invoice.status === 'paid' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Cobrado</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            <span>Pendiente</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => printInvoice(invoice)}
                      className="text-blue-600 hover:text-blue-900 mr-3 flex items-center gap-1"
                    >
                      <Printer className="w-4 h-4" />
                      Imprimir
                    </button>
                    <button
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      className="text-red-600 hover:text-red-900 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
        <button
          onClick={() => {
            setShowAddClient(true);
            setEditingClient(null);
            setNewClient({ name: '', serviceId: '', servicePrice: '', phone: '' });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.serviceName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">${client.servicePrice.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {client.status === 'active' ? 'Activo' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                   <button
  onClick={() => handleEditClient(client)} // ✅ Pasa el cliente completo
  className="text-blue-600 hover:text-blue-900 mr-3"
>
  <Edit className="w-4 h-4" />
</button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h2>
                <button
                  onClick={() => setShowAddClient(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre completo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                  <select
  value={newClient.serviceId}
  onChange={(e) => {
    setNewClient({...newClient, serviceId: e.target.value});
    const service = services.find(s => s.id === parseInt(e.target.value));
    if (service) {
      setNewClient(prev => ({...prev, servicePrice: service.price.toString()}));
    }
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>
  <option value="">Seleccionar servicio</option>
  {services.map(service => (
    <option key={service.id} value={service.id.toString()}> {/* ✅ Convierte a string */}
      {service.name} - ${service.price.toLocaleString()}
    </option>
  ))}
</select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio del Servicio</label>
                  <input
                    type="number"
                    value={newClient.servicePrice}
                    onChange={(e) => setNewClient({...newClient, servicePrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Precio"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Teléfono"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddClient(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingClient ? handleUpdateClient : handleAddClient}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingClient ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Servicios</h1>
        <button
          onClick={() => {
            setShowAddService(true);
            setEditingService(null);
            setNewService({ name: '', price: '' });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Servicio
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-900 mb-2">${service.price.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Precio estándar del servicio</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleEditService(service)}
                className="text-blue-600 hover:text-blue-900 text-sm flex items-center"
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </button>
              <button 
                onClick={() => handleDeleteService(service.id)}
                className="text-red-600 hover:text-red-900 text-sm flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                </h2>
                <button
                  onClick={() => setShowAddService(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Servicio</label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre del servicio"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Precio del servicio"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddService(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingService ? handleUpdateService : handleAddService}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingService ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'invoices': return renderInvoices();
      case 'clients': return renderClients();
      case 'services': return renderServices();
      default: return renderDashboard();
    }
  };

  if (!currentUser) {
    return null; // El AuthProvider manejará el login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-blue-800">Piscinas Durán</h1>
                <p className="text-xs text-gray-600">Sistema de Gestión Profesional</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{currentUser.email}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentView(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        currentView === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Sidebar - Mobile */}
        {isMenuOpen && (
          <aside className="md:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg">
            <nav className="p-4 mt-16">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setCurrentView(item.id);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          currentView === item.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : notification.type === 'error' 
              ? 'bg-red-500 text-white' 
              : 'bg-blue-500 text-white'
        }`}>
          {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {notification.type === 'info' && <Info className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;