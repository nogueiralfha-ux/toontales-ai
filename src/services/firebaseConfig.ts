import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";

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
    const docRef = await addDoc(collection(db, "leads"), {
      email,
      name,
      whatsapp,
      type: "registered_user",
      createdAt: new Date().toISOString()
    });
    console.log("Usuário gravado na coleção leads com ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Erro ao gravar usuário na coleção leads: ", e);
    throw e;
  }
};

export const getUsersFromFirestore = async () => {
  try {
    const q = query(collection(db, "leads"), where("type", "==", "registered_user"));
    const querySnapshot = await getDocs(q);
    const usersList: any[] = [];
    querySnapshot.forEach((doc) => {
      usersList.push({ id: doc.id, ...doc.data() });
    });
    return usersList;
  } catch (e) {
    console.error("Erro ao listar usuários da coleção leads: ", e);
    return [];
  }
};

