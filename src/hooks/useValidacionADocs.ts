import { useCallback, useRef, useState } from 'react'

import { VALIDACION_A_DOC_TYPES } from '@/lib/constants'

const MAX_FILES_PER_DOC = 3

function mergePdfsIntoDocs(
  prev: Record<number, File[]>,
  num: number,
  pdfs: File[]
): Record<number, File[]> {
  const current = prev[num] ?? []
  const space = MAX_FILES_PER_DOC - current.length
  if (space <= 0) {
    return prev
  }
  return { ...prev, [num]: [...current, ...pdfs.slice(0, space)] }
}

const initialDocsA = Object.fromEntries(
  VALIDACION_A_DOC_TYPES.map((_, i) => [i + 1, [] as File[]])
) as Record<number, File[]>

export function useValidacionADocs() {
  const [docsA, setDocsA] = useState<Record<number, File[]>>(initialDocsA)
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const docsWithFilesCount = Object.values(docsA).filter(files => files.length > 0).length
  const totalFilesA = Object.values(docsA).reduce((sum, files) => sum + files.length, 0)
  const docCount = VALIDACION_A_DOC_TYPES.length
  const progressPercentA = (docsWithFilesCount / docCount) * 100
  const canSubmitA = docsWithFilesCount > 0

  const handleDocUpload = useCallback(function onDocUpload(
    num: number,
    files: FileList | null
  ) {
    if (!files?.length) {
      return
    }
    const pdfs = Array.from(files).filter(f => f.type === 'application/pdf')
    setDocsA(prev => mergePdfsIntoDocs(prev, num, pdfs))
    const input = fileInputRefs.current[num]
    if (input) {
      input.value = ''
    }
  }, [])

  const removeFileA = useCallback(function onRemoveFileA(num: number, index: number) {
    setDocsA(prev => ({
      ...prev,
      [num]: (prev[num] ?? []).filter((_, i) => i !== index),
    }))
  }, [])

  return {
    canSubmitA,
    docsA,
    docsWithFilesCount,
    fileInputRefs,
    handleDocUpload,
    progressPercentA,
    removeFileA,
    totalFilesA,
  }
}
