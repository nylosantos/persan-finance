/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';

import { Tooltip } from 'react-tooltip';

import { getDownloadURL, ref, updateMetadata, uploadBytes } from 'firebase/storage';
import { addDoc, collection, doc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';

import { TransactionFormProps, TransactionWithoutId } from '../../types';
import { useConfirm } from '../../hooks/useConfirm';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../services/firebase';
import { createCategory } from '../../services/category';
import { useFamily } from '../../contexts/FamilyContext';
import { useCategories } from '../../hooks/useCategories';
import { FileOrPhotoInput } from '../Layout/FileOrPhotoInput';

export const TransactionForm: React.FC<TransactionFormProps> = ({
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
  const [prevType, setPrevType] = useState<'income' | 'expense' | 'budget'>(initialValues?.type ?? 'expense');
  const [currency, setCurrency] = useState<'EUR' | 'BRL'>(initialValues?.currency ?? 'EUR');
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
  const [shouldBePaid, setShouldBePaid] = useState(false);
  const [showShouldBePaid, setShowShouldBePaid] = useState(false);
  const [shouldBePaidDisabled, setShouldBePaidDisabled] = useState(false);
  const [originalName, setOriginalName] = useState(initialValues?.name ?? '');

  useEffect(() => {
    setOriginalName(initialValues?.name ?? '');
  }, [initialValues]);

  function checkIfBudgetSelected() {
    if (type !== 'expense' || !categoryId) {
      setShowShouldBePaid(false);
      setShouldBePaid(false);
      setShouldBePaidDisabled(false);
      return;
    }
    // Verifica se existe um budget para a categoria e mês/ano
    let isBudget = false;
    if (date) {
      const expenseDate = new Date(date);
      isBudget = budgetsOfMonth.some(b => {
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
    if (isBudget) {
      setShouldBePaid(true);
      setShouldBePaidDisabled(true);
      setShowShouldBePaid(true);
    } else {
      setShouldBePaid(false);
      setShouldBePaidDisabled(false);
      setShowShouldBePaid(true);
    }
  }

  function handleCategoryFocus() {
    setShowShouldBePaid(false);
    setShouldBePaid(false);
    setShouldBePaidDisabled(false);
  }

  async function handleCategoryBlur() {
    await handleCategorySelect(categoryName);
    checkIfBudgetSelected();
  }

  useEffect(() => {
    checkIfBudgetSelected();
    // eslint-disable-next-line
  }, [type, categoryId, date, budgetsOfMonth]);

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
      initialValues?.amount !== undefined
        ? Math.round(Number(initialValues.amount) * 100).toString() // converte para centavos
        : ''
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
    setShouldBePaid(initialValues?.paid ?? false);
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
    if (!name || !categoryId || !amount || !date || parseInt(amount, 10) === 0) return;

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

        const txData: TransactionWithoutId = {
          name,
          categoryId,
          amount: parseFloat((parseInt(amount, 10) / 100).toFixed(2)), // centavos para float
          currency,
          date: Timestamp.fromDate(new Date(date)),
          type,
          userId: user!.uid,
          createdAt: Timestamp.fromDate(new Date()),
        };

        if (downloadUrl) txData.downloadUrl = downloadUrl;
        if (type === 'expense') txData.paid = shouldBePaid;
        // if (type === 'expense' && shouldBePaid) txData.paid = true;

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
      setType('expense');
      setCurrency('EUR');
      setAttachFile(false);
      setFile(null);
    }
  };

  function formatCurrencyFromCents(value: string) {
    if (!value) return '0,00';
    // Remove zeros à esquerda
    value = value.replace(/^0+/, '');
    if (value.length === 0) value = '0';
    const cents = value.padStart(3, '0');
    const int = cents.slice(0, -2);
    const dec = cents.slice(-2);
    // Formato brasileiro: vírgula para decimal
    return `${parseInt(int, 10)}${dec ? ',' + dec : ',00'}`;
  }

  // Ao trocar o tipo
  const handleTypeChange = (newType: 'income' | 'expense' | 'budget') => {
    if (prevType === 'budget' && newType !== 'budget') {
      // Se está editando (tem initialValues), restaura o nome original
      if (initialValues?.id) {
        setName(originalName);
      } else {
        setName('');
      }
    }
    if (newType === 'budget' && categoryName) {
      setName(categoryName);
    }
    setPrevType(newType);
    setType(newType);
  };

  // Ao trocar a categoria
  const handleCategoryChange = (value: string) => {
    setCategoryName(value);
    if (type === 'budget') {
      setName(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
      <div className="flex md:flex-row gap-2">
        <select value={type}
          onChange={e => handleTypeChange(e.target.value as any)}
          className="p-2 rounded dark:bg-gray-800">
          <option value="income">Entrada</option>
          <option value="expense">Saída</option>
          <option value="budget">Budget</option>
        </select>
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={e => setName(e.target.value)}
          className={`flex-1 p-2 rounded transition-opacity ${type === 'budget' ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''}`}
          required
          disabled={type === 'budget'}
          data-tooltip-id="budget-tooltip"
          data-tooltip-content={type === 'budget' ? "No budget, o nome será igual à categoria" : undefined}
        />
        <Tooltip id='budget-tooltip' place='top' />
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Category"
          value={categoryName}
          onChange={e => handleCategoryChange(e.target.value)}
          onFocus={handleCategoryFocus}
          onBlur={handleCategoryBlur}
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

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex w-full items-end gap-2">
          <select value={currency} onChange={e => setCurrency(e.target.value as any)} className="p-2 rounded dark:bg-gray-800">
            <option value="EUR">€</option>
            <option value="BRL">R$</option>
          </select>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*[.,]?[0-9]*"
            placeholder="Amount"
            value={formatCurrencyFromCents(amount)}
            onChange={e => {
              // Só números
              const raw = e.target.value.replace(/\D/g, '');
              setAmount(raw);
            }}
            className="flex w-full p-2 rounded"
            required
          />
        </div>
        <div className="flex flex-col md:flex-row">
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
        {attachFile && <FileOrPhotoInput file={file} setFile={setFile} />}
      </div>

      {type === 'expense' && categoryId && date && showShouldBePaid && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={shouldBePaid}
            disabled={shouldBePaidDisabled}
            onChange={e => setShouldBePaid(e.target.checked)}
            id="shouldBePaid"
          />
          <label htmlFor="shouldBePaid" className="select-none">
            Pago
          </label>
          {shouldBePaidDisabled && (
            <>
              <span
                className="ml-2 text-xs text-gray-500 dark:text-gray-300 cursor-help"
                data-tooltip-id="shouldBePaid-tooltip"
                data-tooltip-content="Orçamentos são cadastrados como pagos por padrão"
              >
                <svg className="inline mr-1" width="16" height="16" fill="currentColor"><circle cx="8" cy="8" r="8" /></svg>
                Orçamentos são cadastrados como pagos por padrão
              </span>
              <Tooltip id="shouldBePaid-tooltip" place="top" />
            </>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button type="submit" className="w-full p-2 bg-primary text-white rounded" disabled={catLoading || !amount || parseInt(amount, 10) === 0}>
          {initialValues?.id ? 'Salvar' : 'Adicionar'}
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