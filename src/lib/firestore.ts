import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Expense, type Category } from '@/types/index';

export const getActiveCategories = async (): Promise<Category[]> => {
  const q = query(
    collection(db, 'categories'),
    where('isActive', '==', true),
    orderBy('sortOrder', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
};

export const getAllCategories = async (): Promise<Category[]> => {
  const q = query(collection(db, 'categories'), orderBy('sortOrder', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
};

export const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'categories'), {
    ...category,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateCategory = async (id: string, data: Partial<Omit<Category, 'id' | 'createdAt'>>) => {
  const docRef = doc(db, 'categories', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteCategory = async (id: string) => {
  const docRef = doc(db, 'categories', id);
  await deleteDoc(docRef);
};

export const addExpense = async (userId: string, expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
  const expensesRef = collection(db, 'users', userId, 'expenses');
  const docRef = await addDoc(expensesRef, {
    ...expense,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateExpense = async (
  userId: string,
  expenseId: string,
  data: Partial<Omit<Expense, 'id' | 'createdAt'>>
) => {
  const docRef = doc(db, 'users', userId, 'expenses', expenseId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteExpense = async (userId: string, expenseId: string) => {
  const docRef = doc(db, 'users', userId, 'expenses', expenseId);
  await deleteDoc(docRef);
};

export const getMonthlyExpenses = async (userId: string, startDate: Date, endDate: Date): Promise<Expense[]> => {
  const expensesRef = collection(db, 'users', userId, 'expenses');
  const q = query(
    expensesRef,
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<', Timestamp.fromDate(endDate)),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Expense[];
};