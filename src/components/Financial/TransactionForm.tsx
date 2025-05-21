// // src/components/Financial/TransactionForm.tsx
// import React, { useState, useEffect } from 'react';
// import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
// import { db } from '../../services/firebase';
// import { useAuth } from '../../contexts/AuthContext';
// import { createCategory } from '../../services/category';
// import { useCategories } from '../../hooks/useCategories';
// import { useFamily } from '../../contexts/FamilyContext';

// interface Props {
//   path: string;
//   // categoryOptions: { id: string; name: string }[];
// }

// export const TransactionForm: React.FC<Props> = ({ path/*, categoryOptions*/ }) => {
//   const { user } = useAuth();
//   const { familyId } = useFamily();
//   const [name, setName] = useState('');
//   const [categoryId, setCategoryId] = useState<string>('');
//   const [categoryName, setCategoryName] = useState<string>('');
//   const [amount, setAmount] = useState('');
//   const [date, setDate] = useState('');
//   const [type, setType] = useState<'income' | 'expense'>('income');
//   const [currency, setCurrency] = useState<'EUR' | 'BRL'>('EUR');
//   const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
//   const { categories, loading: catLoading } = useCategories('family', familyId);

//   // update suggestions when categories change or user types
//   // useEffect(() => {
//   //   setSuggestions(
//   //     categories.filter(c => c.name.toLowerCase().includes((categoryOptions.find(opt => opt.id === category)?.name || category).toLowerCase()))
//   //   );
//   // }, [category, categories, categoryOptions]);

//   // sugestões dinâmicas
//   useEffect(() => {
//     setSuggestions(
//       categories.filter(c =>
//         c.name.toLowerCase().includes(categoryName.toLowerCase())
//       )
//     );
//   }, [categoryName, categories]);

//   // const handleCategorySelect = (input: string) => {
//   //   const existing = categories.find(c => c.name === input);
//   //   if (existing) {
//   //     setCategory(existing.id);
//   //   } else if (input.trim() && familyId) {
//   //     // create new category with correct ownerId = familyId
//   //     createCategory(input.trim(), 'family', familyId).then(cat => {
//   //       setCategory(cat.id);
//   //     });
//   //   }
//   // };

//   async function handleCategorySelect(name: string) {
//     // se já existe
//     const existing = categories.find(c => c.name === name);
//     if (existing) {
//       setCategoryId(existing.id);
//       setCategoryName(existing.name);  // reforça o nome
//     } else if (name.trim() && familyId) {
//       // cria nova categoria
//       const cat = await createCategory(name.trim(), 'family', familyId);
//       setCategoryId(cat.id);
//       setCategoryName(cat.name);        // mantém o nome no input
//       // opcional: atualizar localmente a lista de suggestions
//       setSuggestions(prev => [...prev, cat]);
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!name || !categoryId || !amount || !date) return;
//     await addDoc(collection(db, path), {
//       name,
//       categoryId,
//       amount: parseFloat(amount),
//       currency,
//       date: new Date(date),
//       type,
//       userId: user!.uid,
//       createdAt: serverTimestamp(),
//     });
//     setName(''); setCategoryId(''); setCategoryName(''); setAmount(''); setDate(''); setType('income'); setCurrency('EUR');
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
//       <div className="flex space-x-2">
//         <select value={type} onChange={e => setType(e.target.value as any)} className="p-2 rounded">
//           <option value="income">Income</option>
//           <option value="expense">Expense</option>
//         </select>
//         <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="flex-1 p-2 rounded" required />
//       </div>

//       <div className="relative">
//         <input
//           type="text"
//           placeholder="Category"
//           value={categoryName}
//           onChange={e => setCategoryName(e.target.value)}
//           onBlur={() => handleCategorySelect(categoryName)}
//           className="w-full p-2 rounded dark:bg-gray-700"
//           list="category-list"
//           required
//         />
//         <datalist id="category-list">
//           {suggestions.map(c => (
//             <option key={c.id} value={c.name} />
//           ))}
//         </datalist>
//       </div>

//       <div className="flex space-x-2">
//         <select value={currency} onChange={e => setCurrency(e.target.value as any)} className="p-2 rounded">
//           <option value="EUR">€</option>
//           <option value="BRL">R$</option>
//         </select>
//         <input type="number" step="0.01" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="p-2 rounded" required />
//         <input
//           type="date"
//           value={date}
//           onChange={e => setDate(e.target.value)}
//           // readOnly                    // evita digitação
//           onKeyDown={e => e.preventDefault()}    // bloqueia a digitação
//           onFocus={e => e.currentTarget.showPicker?.()} // abre o date picker em Chrome 87+
//           className="custom-date-picker bg-transparent placeholder-gray-400 dark:placeholder-white rounded p-2 cursor-pointer focus:outline-none"
//           placeholder="dd/mm/yyyy"
//           required
//         />
//       </div>

//       <button type="submit" className="w-full p-2 bg-primary text-white rounded" disabled={catLoading}>
//         Add Transaction
//       </button>
//     </form>
//   );
// };


import React, { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db, storage } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { createCategory } from '../../services/category';
import { useCategories } from '../../hooks/useCategories';
import { useFamily } from '../../contexts/FamilyContext';
import { useConfirm } from '../../hooks/useConfirm';
import { getDownloadURL, ref, updateMetadata, uploadBytes } from 'firebase/storage';

interface Props {
  path: string;
  budgetsOfMonth: Array<{
    id: string;
    categoryId: string;
    date: Date | { seconds: number };
  }>;
  initialValues?: {
    id?: string;
    name?: string;
    categoryId?: string;
    categoryName?: string;
    amount?: number | string;
    date?: Date | string | { seconds: number };
    type?: 'income' | 'expense' | 'budget';
    currency?: 'EUR' | 'BRL';
    createdAt?: any;
  };
  onClose?: () => void;
  onSaved?: () => void;
}

export const TransactionForm: React.FC<Props> = ({
  path,
  budgetsOfMonth,
  initialValues,
  onClose,
  onSaved,
}) => {
  const { user } = useAuth();
  const { familyId } = useFamily();
  const { categories, loading: catLoading } = useCategories('family', familyId);
  const confirm = useConfirm();

  const [attachFile, setAttachFile] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [name, setName] = useState(initialValues?.name ?? '');
  const [categoryId, setCategoryId] = useState<string>(initialValues?.categoryId ?? '');
  const [categoryName, setCategoryName] = useState<string>(
    initialValues?.categoryName ??
    (initialValues?.categoryId
      ? categories.find(c => c.id === initialValues.categoryId)?.name ?? ''
      : '')
  );
  const [amount, setAmount] = useState(
    initialValues?.amount !== undefined ? String(initialValues.amount) : ''
  );
  const [date, setDate] = useState(() => {
    if (initialValues?.date) {
      if (typeof initialValues.date === 'string') {
        return initialValues.date;
      }
      if (initialValues.date instanceof Date) {
        return initialValues.date.toISOString().split('T')[0];
      }
      if ('seconds' in initialValues.date) {
        return new Date(initialValues.date.seconds * 1000).toISOString().split('T')[0];
      }
    }
    return '';
  });
  const [type, setType] = useState<'income' | 'expense' | 'budget'>(initialValues?.type ?? 'expense');
  const [currency, setCurrency] = useState<'EUR' | 'BRL'>(initialValues?.currency ?? 'EUR');
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);

  // Atualiza campos se initialValues mudar (ex: ao editar outra transação)
  useEffect(() => {
    setName(initialValues?.name ?? '');
    setCategoryId(initialValues?.categoryId ?? '');
    setCategoryName(
      initialValues?.categoryName ??
      (initialValues?.categoryId
        ? categories.find(c => c.id === initialValues.categoryId)?.name ?? ''
        : '')
    );
    setAmount(
      initialValues?.amount !== undefined ? String(initialValues.amount) : ''
    );
    setDate(() => {
      if (initialValues?.date) {
        if (typeof initialValues.date === 'string') {
          return initialValues.date;
        }
        if (initialValues.date instanceof Date) {
          return initialValues.date.toISOString().split('T')[0];
        }
        if ('seconds' in initialValues.date) {
          return new Date(initialValues.date.seconds * 1000).toISOString().split('T')[0];
        }
      }
      return '';
    });
    setType(initialValues?.type ?? 'expense');
    setCurrency(initialValues?.currency ?? 'EUR');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues, categories]);

  // sugestões dinâmicas
  useEffect(() => {
    setSuggestions(
      categories.filter(c =>
        c.name.toLowerCase().includes(categoryName.toLowerCase())
      )
    );
  }, [categoryName, categories]);

  async function handleCategorySelect(name: string) {
    const existing = categories.find(c => c.name === name);
    if (existing) {
      setCategoryId(existing.id);
      setCategoryName(existing.name);
    } else if (name.trim() && familyId) {
      const cat = await createCategory(name.trim(), 'family', familyId);
      setCategoryId(cat.id);
      setCategoryName(cat.name);
      setSuggestions(prev => [...prev, cat]);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || !amount || !date) return;

    await confirm({
      title: initialValues?.id ? 'Salvar alteração?' : 'Adicionar transação?',
      text: initialValues?.id
        ? 'Deseja salvar as alterações desta transação?'
        : 'Deseja adicionar esta transação?',
      confirmButtonText: initialValues?.id ? 'Salvar' : 'Adicionar',
      cancelButtonText: 'Cancelar',
      successMessage: initialValues?.id ? 'Transação atualizada!' : 'Transação adicionada!',
      errorMessage: 'Erro ao salvar transação.',
      onConfirm: async () => {
        let downloadUrl: string | undefined = undefined;

        // Upload do arquivo se necessário
        if (attachFile && file) {
          const ext = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
          const storagePath = `transactions/${user!.uid}/${fileName}`;
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, file);
          await updateMetadata(storageRef, {
            contentDisposition: 'attachment',
          });
          downloadUrl = await getDownloadURL(storageRef);
        }

        // Verifica se existe um budget para a categoria e mês/ano
        let shouldBePaid = false;
        if (type === 'expense') {
          const expenseDate = new Date(date);
          shouldBePaid = budgetsOfMonth.some(b => {
            const bDate = b.date && 'seconds' in b.date
              ? new Date(b.date.seconds * 1000)
              : new Date(b.date);
            return (
              b.categoryId === categoryId &&
              bDate.getMonth() === expenseDate.getMonth() &&
              bDate.getFullYear() === expenseDate.getFullYear()
            );
          });
        }

        const txData: any = {
          name,
          categoryId,
          amount: parseFloat(amount),
          currency,
          date: new Date(date),
          type,
          userId: user!.uid,
          createdAt: serverTimestamp(),
        };

        if (downloadUrl) txData.downloadUrl = downloadUrl;
        if (type === 'expense' && shouldBePaid) txData.paid = true;

        if (initialValues?.id) {
          // Editar transação existente
          const { id, ...rest } = initialValues;
          await updateDoc(doc(db, path, id!), {
            ...txData,
            createdAt: rest.createdAt ?? serverTimestamp(),
          });
        } else {
          // Nova transação
          await addDoc(collection(db, path), txData);
        }
      },
    });

    if (onSaved) onSaved();
    if (onClose) onClose();

    if (!initialValues?.id) {
      setName('');
      setCategoryId('');
      setCategoryName('');
      setAmount('');
      setDate('');
      setType('income');
      setCurrency('EUR');
      setAttachFile(false);
      setFile(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
      <div className="flex space-x-2">
        <select value={type} onChange={e => setType(e.target.value as any)} className="p-2 rounded dark:bg-gray-800">
          <option value="income">Entrada</option>
          <option value="expense">Saída</option>
          <option value="budget">Budget</option>
        </select>
        <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="flex-1 p-2 rounded" required />
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Category"
          value={categoryName}
          onChange={e => setCategoryName(e.target.value)}
          onBlur={() => handleCategorySelect(categoryName)}
          className="w-full p-2 rounded dark:bg-gray-800"
          list="category-list"
          required
        />
        <datalist id="category-list">
          {suggestions.map(c => (
            <option key={c.id} value={c.name} />
          ))}
        </datalist>
      </div>

      <div className="flex space-x-2">
        <select value={currency} onChange={e => setCurrency(e.target.value as any)} className="p-2 rounded dark:bg-gray-800">
          <option value="EUR">€</option>
          <option value="BRL">R$</option>
        </select>
        <input type="number" step="0.01" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="p-2 rounded" required />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          onKeyDown={e => e.preventDefault()}
          onFocus={e => e.currentTarget.showPicker?.()}
          className="custom-date-picker bg-transparent placeholder-gray-400 dark:placeholder-white rounded p-2 cursor-pointer focus:outline-none"
          placeholder="dd/mm/yyyy"
          required
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={attachFile}
            onChange={e => setAttachFile(e.target.checked)}
          />
          Anexar imagem ou PDF
        </label>
        {attachFile && (
          <input
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="p-2 border rounded mt-2"
            required
          />
        )}
      </div>

      <div className="flex gap-2">
        <button type="submit" className="w-full p-2 bg-primary text-white rounded" disabled={catLoading}>
          {initialValues?.id ? 'Salvar' : 'Add Transaction'}
        </button>
        {onClose && (
          <button type="button" className="w-full p-2 bg-gray-300 dark:bg-gray-700 rounded" onClick={onClose}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};