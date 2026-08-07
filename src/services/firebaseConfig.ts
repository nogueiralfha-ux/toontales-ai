import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, doc, updateDoc } from "firebase/firestore";

// Configurações do Firebase do A.I.O (Substituir com as chaves reais do Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyA3FA8axVV9aSXY70hiEaXpve8lvBiBO6c",
  authDomain: "plataforma-trp.firebaseapp.com",
  projectId: "plataforma-trp",
  storageBucket: "plataforma-trp.firebasestorage.app",
  messagingSenderId: "999325505617",
  appId: "1:999325505617:web:edddf7cc160804c489c070"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Serviços de gravação e consulta de Leads na nuvem
export const saveLeadToFirestore = async (whatsapp: string, idea: string) => {
  try {
    const docRef = await addDoc(collection(db, "leads"), {
      whatsapp,
      idea,
      createdAt: new Date().toLocaleString("pt-BR")
    });
    console.log("Lead gravado no Firestore com ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Erro ao gravar lead no Firebase Firestore: ", e);
    throw e;
  }
};

export const getLeadsFromFirestore = async () => {
  try {
    const q = query(collection(db, "leads"));
    const querySnapshot = await getDocs(q);
    const leadsList: any[] = [];
    querySnapshot.forEach((doc) => {
      leadsList.push({ id: doc.id, ...doc.data() });
    });
    return leadsList;
  } catch (e) {
    console.error("Erro ao listar leads do Firebase Firestore: ", e);
    return [];
  }
};

// Gravar e listar Usuários registrados
export const saveUserToFirestore = async (email: string, name: string, whatsapp: string) => {
  try {
    // Para contornar regras estritas do Firestore (hasOnly ou validações de chaves),
    // empacotamos os metadados adicionais dentro do campo "idea" como uma string JSON.
    const payload = JSON.stringify({
      email: email.trim().toLowerCase(),
      name: name.trim(),
      type: "registered_user",
      plan: "free",
      billingCycle: "N/A"
    });

    const docRef = await addDoc(collection(db, "leads"), {
      whatsapp: whatsapp.trim(),
      idea: payload,
      createdAt: new Date().toLocaleString("pt-BR")
    });
    console.log("Usuário gravado com sucesso na coleção leads: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Erro ao gravar usuário na coleção leads: ", e);
    throw e;
  }
};

export const getUsersFromFirestore = async () => {
  try {
    const q = query(collection(db, "leads"));
    const querySnapshot = await getDocs(q);
    const usersList: any[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Verifica se o campo "idea" contém o JSON do nosso usuário registrado
      if (data.idea && typeof data.idea === 'string' && data.idea.startsWith('{') && data.idea.includes('"type":"registered_user"')) {
        try {
          const parsed = JSON.parse(data.idea);
          usersList.push({
            id: doc.id,
            email: parsed.email,
            name: parsed.name,
            whatsapp: data.whatsapp,
            plan: parsed.plan || 'free',
            billingCycle: parsed.billingCycle || 'N/A',
            createdAt: data.createdAt
          });
        } catch (parseErr) {
          console.error("Erro ao fazer parse dos dados do usuário no campo idea:", parseErr);
        }
      }
    });
    
    return usersList;
  } catch (e) {
    console.error("Erro ao listar usuários da coleção leads: ", e);
    return [];
  }
};

// Atualizar o plano e ciclo de cobrança do usuário no Firestore
export const updateUserPlanInFirestore = async (
  docId: string, 
  email: string, 
  name: string, 
  whatsapp: string, 
  newPlan: string, 
  billingCycle: string
) => {
  try {
    const payload = JSON.stringify({
      email: email.trim().toLowerCase(),
      name: name.trim(),
      type: "registered_user",
      plan: newPlan,
      billingCycle: billingCycle
    });

    const docRef = doc(db, "leads", docId);
    await updateDoc(docRef, {
      idea: payload,
      whatsapp: whatsapp.trim()
    });
    console.log("Plano do usuário atualizado no Firestore com sucesso!");
    return true;
  } catch (e) {
    console.error("Erro ao atualizar o plano do usuário no Firestore: ", e);
    throw e;
  }
};

