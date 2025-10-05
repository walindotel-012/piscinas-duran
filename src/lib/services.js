import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  serverTimestamp,
  orderBy,   // 👈 AGREGA ESTO
  limit 
} from 'firebase/firestore';

// Servicios
export const servicesService = {
  create: async (serviceData, userId) => {
    const docRef = await addDoc(collection(db, 'services'), {
      ...serviceData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...serviceData };
  },

  update: async (id, serviceData, userId) => {
    const docRef = doc(db, 'services', id);
    await updateDoc(docRef, {
      ...serviceData,
      userId,
      updatedAt: serverTimestamp()
    });
    return { id, ...serviceData };
  },

  delete: async (id) => {
    await deleteDoc(doc(db, 'services', id));
  },

   getAll: (userId) => {
    return query(collection(db, 'services'), where('userId', '==', userId));
  }
};

// Clientes
export const clientsService = {
  create: async (clientData, userId) => {
    const docRef = await addDoc(collection(db, 'clients'), {
      ...clientData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...clientData };
  },

  update: async (id, clientData, userId) => {
    const docRef = doc(db, 'clients', id);
    await updateDoc(docRef, {
      ...clientData,
      userId,
      updatedAt: serverTimestamp()
    });
    return { id, ...clientData };
  },

  delete: async (id) => {
    await deleteDoc(doc(db, 'clients', id));
  },

 getAll: (userId) => {
    return query(collection(db, 'clients'), where('userId', '==', userId));
  }
};

// Facturas
// Facturas
export const invoicesService = {
  create: async (invoiceData, userId) => {
    const docRef = await addDoc(collection(db, 'invoices'), {
      ...invoiceData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...invoiceData };
  },

  update: async (id, invoiceData, userId) => {
    const docRef = doc(db, 'invoices', id);
    await updateDoc(docRef, {
      ...invoiceData,
      userId,
      updatedAt: serverTimestamp()
    });
    return { id, ...invoiceData };
  },

  delete: async (id) => {
    await deleteDoc(doc(db, 'invoices', id));
  },

  getAll: (userId) => {
    return query(collection(db, 'invoices'), where('userId', '==', userId));
  },

 // En src/lib/services.js - función generateMonthly
// En src/lib/services.js - Función generateMonthly corregida
generateMonthly: async (clients, userId) => {
    // ✅ Obtener el último número de factura
    const lastInvoice = await getDocs(query(
      collection(db, 'invoices'), 
      where('userId', '==', userId),
      orderBy('number', 'desc'), // ✅ orderBy ahora está definido
      limit(1)                   // ✅ limit ahora está definido
    ));
  
  let nextNumber = 20120; // Número inicial
  
  if (!lastInvoice.empty) {
    const lastNumber = lastInvoice.docs[0].data().number;
    // Extraer el número de la factura (ej. FACT-20120 -> 20120)
    const match = lastNumber.match(/FACT-(\d+)/);
    if (match && match[1]) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  const invoices = [];
  
  for (const client of clients) {
    if (client.status === 'active') {
      const invoiceData = {
        clientId: client.id,
        clientName: client.name,
        serviceName: client.serviceName,
        amount: client.servicePrice,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15).toISOString().split('T')[0],
        clientPhone: client.phone || '',
        userId,
        number: `FACT-${nextNumber}` // ✅ Número de factura secuencial
      };
      
        const invoice = await invoicesService.create(invoiceData, userId);
        invoices.push(invoice);
        nextNumber++;// Incrementar el número para la próxima factura
    }
  }
  return invoices;
}
};
