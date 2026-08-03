'use client';
import { createContext, useContext } from 'react';

// サーバー側で読み込んだ文言（getCopy の結果）を、クライアント側の各ページへ配布する。
const CopyContext = createContext({});

export function CopyProvider({ value, children }) {
  return <CopyContext.Provider value={value || {}}>{children}</CopyContext.Provider>;
}

export function useCopy() {
  return useContext(CopyContext);
}
